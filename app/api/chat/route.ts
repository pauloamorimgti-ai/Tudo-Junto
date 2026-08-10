import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { resolveModel, getModelById } from '@/lib/ai-providers'
import { smartRoute } from '@/lib/smart-router'
import { checkAndIncrementUsage } from '@/lib/usage-limiter'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 })
    }

    const { messages, modelId, smart = false, conversationId } = await req.json()

    // Check usage limit
    const usage = await checkAndIncrementUsage(user.id)
    if (!usage.allowed) {
      return new Response(
        JSON.stringify({
          error: `Limite diário atingido (${usage.limit} mensagens). Faça upgrade para Pro para mensagens ilimitadas.`,
          limitReached: true,
          used: usage.used,
          limit: usage.limit,
        }),
        { status: 429 }
      )
    }

    // Resolve model
    let resolvedModelId = modelId
    let taskUsed = null

    if (smart || !modelId) {
      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
      const prompt = lastUserMsg?.content || ''
      const { model, task } = smartRoute(prompt)
      resolvedModelId = model.id
      taskUsed = task
    }

    const model = getModelById(resolvedModelId)
    if (!model) {
      return new Response(JSON.stringify({ error: 'Modelo não encontrado' }), { status: 400 })
    }

    const { provider, modelString } = resolveModel(resolvedModelId)

    // FIX: Save title from the FIRST user message (messages[0]) only on first turn
    // messages.length === 1 means it's the very first user message
    if (conversationId && messages.length === 1) {
      const firstUserContent = messages[0].content || ''
      const title = firstUserContent.slice(0, 80)
      await supabase
        .from('conversations')
        .update({ title, model_id: resolvedModelId })
        .eq('id', conversationId)
        .eq('user_id', user.id)
    }

    const result = streamText({
      model: provider(modelString) as Parameters<typeof streamText>[0]['model'],
      messages,
      system: `Você é o Tudo Junto, um assistente de IA inteligente e amigável. \nResponda sempre em português do Brasil, a menos que o usuário escreva em outro idioma.\nSeja conciso, direto e útil. Use markdown quando apropriado.\n${taskUsed ? `Tarefa detectada: ${taskUsed}` : ''}`,
      maxTokens: 4096,
      temperature: 0.7,
      onFinish: async ({ text }) => {
        // Persist the full updated message list to DB
        if (conversationId) {
          // FIX: store only the NEW messages from this turn (last user + new assistant)
          // to avoid duplicating the full history on every turn.
          // We use the messages array from the request (which is the full history up to now)
          // and append the assistant reply.
          const lastUserMsg = messages[messages.length - 1]

          // Fetch existing stored messages to append
          const { data: conv } = await supabase
            .from('conversations')
            .select('messages')
            .eq('id', conversationId)
            .eq('user_id', user.id)
            .single()

          const existing = Array.isArray(conv?.messages) ? conv.messages : []

          // Only append if the last stored message isn't the same as the one we're about to add
          // (prevents duplicates on retries)
          const lastStored = existing[existing.length - 1]
          const isDuplicate = lastStored?.role === 'user' && lastStored?.content === lastUserMsg?.content

          const newMessages = isDuplicate
            ? [...existing.slice(0, -1)] // replace the duplicate user msg
            : [...existing]

          newMessages.push(
            { id: crypto.randomUUID(), role: lastUserMsg.role, content: lastUserMsg.content, createdAt: new Date().toISOString() },
            { id: crypto.randomUUID(), role: 'assistant', content: text, model: resolvedModelId, createdAt: new Date().toISOString() }
          )

          await supabase
            .from('conversations')
            .update({
              messages: newMessages,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversationId)
            .eq('user_id', user.id)
        }
      },
    })

    return result.toDataStreamResponse({
      headers: {
        'x-model-used': resolvedModelId,
        'x-task-detected': taskUsed || '',
        'x-usage-used': String(usage.used),
        'x-usage-limit': String(usage.limit),
      },
    })
  } catch (error: unknown) {
    console.error('[chat/route]', error)
    const message = error instanceof Error ? error.message : 'Erro interno'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
