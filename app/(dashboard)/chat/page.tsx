'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from 'ai/react'
import { Sidebar } from '@/components/ui-components'
import { ModelSelector } from '@/components/ModelSelector'
import { SmartModeButton } from '@/components/SmartModeButton'
import { MessageBubble } from '@/components/MessageBubble'
import { useConversations } from '@/hooks/useConversations'
import { useProfile } from '@/hooks/useProfile'
import { AIModel, Message } from '@/types'
import { getSupabaseClient } from '@/lib/supabase-client-impl'
import { cn } from '@/lib/utils'

const STARTER_PROMPTS = [
  { icon: '💡', text: 'Me explique como funciona a inteligência artificial' },
  { icon: '💻', text: 'Escreva uma função em TypeScript para validar CPF' },
  { icon: '✍️', text: 'Crie um post de LinkedIn sobre produtividade' },
  { icon: '🔢', text: 'Resolva: qual é o resultado de 17 × 24 + 156 ÷ 12?' },
]

export default function ChatPage() {
  const { profile } = useProfile()
  const { conversations, create, remove, reload } = useConversations()
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [models, setModels] = useState<AIModel[]>([])
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [smartMode, setSmartMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  // Refs to avoid stale closures in callbacks
  const activeConvIdRef = useRef<string | null>(null)
  const smartModeRef = useRef(true)
  const selectedModelRef = useRef<AIModel | null>(null)
  const creatingRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Keep refs in sync
  useEffect(() => { activeConvIdRef.current = activeConvId }, [activeConvId])
  useEffect(() => { smartModeRef.current = smartMode }, [smartMode])
  useEffect(() => { selectedModelRef.current = selectedModel }, [selectedModel])

  useEffect(() => {
    getSupabaseClient().auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || '')
    })
  }, [])

  useEffect(() => {
    fetch('/api/models').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setModels(data)
        if (data.length > 0) setSelectedModel(data[0])
      }
    }).catch(() => {})
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, stop } = useChat({
    api: '/api/chat',
    // BUG FIX: use experimental_prepareRequestBody so conversationId is
    // always read from the ref AT SEND TIME, not at render time.
    experimental_prepareRequestBody: ({ messages }) => ({
      messages,
      conversationId: activeConvIdRef.current,
      smart: smartModeRef.current,
      modelId: smartModeRef.current ? null : selectedModelRef.current?.id,
    }),
    onFinish: async () => {
      // Reload sidebar so new conversation appears and title is updated
      await reload()
    },
  })

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // BUG FIX: auto-create conversation on first send if none exists
  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!activeConvIdRef.current && !creatingRef.current) {
      creatingRef.current = true
      try {
        const conv = await create()
        setActiveConvId(conv.id)
        activeConvIdRef.current = conv.id
      } catch (err) {
        console.error('Failed to create conversation', err)
        creatingRef.current = false
        return
      }
      creatingRef.current = false
    }

    handleSubmit(e)
  }, [input, isLoading, create, handleSubmit])

  const handleNewConversation = useCallback(() => {
    setMessages([])
    setActiveConvId(null)
    activeConvIdRef.current = null
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [setMessages])

  const handleSelectConversation = useCallback(async (id: string) => {
    setActiveConvId(id)
    activeConvIdRef.current = id
    const r = await fetch(`/api/conversations/${id}`)
    if (r.ok) {
      const data = await r.json()
      setMessages((data.messages || []).map((m: Message) => ({
        id: m.id || crypto.randomUUID(),
        role: m.role,
        content: m.content,
      })))
    }
  }, [setMessages])

  const handleStarterPrompt = (text: string) => {
    handleInputChange({ target: { value: text } } as React.ChangeEvent<HTMLInputElement>)
    textareaRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          conversations={conversations as Parameters<typeof Sidebar>[0]['conversations']}
          activeId={activeConvId}
          onSelect={handleSelectConversation}
          onCreate={handleNewConversation}
          onDelete={remove}
          userEmail={userEmail}
          plan={profile?.plan}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-12 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors"
            title={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {!sidebarOpen && (
            <button
              onClick={handleNewConversation}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors"
              title="Nova conversa"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}

          <div className="flex-1" />

          {isLoading && (
            <span className="text-[11px] text-text-muted/60 hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Gerando…
            </span>
          )}

          <SmartModeButton active={smartMode} onToggle={() => setSmartMode(v => !v)} />

          {!smartMode && (
            <ModelSelector models={models} selected={selectedModel} onSelect={setSelectedModel} />
          )}

          {smartMode && (
            <span className="text-xs text-text-muted hidden sm:block">
              Melhor modelo selecionado automaticamente
            </span>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-2xl mb-5">
                ✦
              </div>
              <h2 className="text-xl font-semibold text-text mb-2">O que vamos resolver hoje?</h2>
              <p className="text-sm text-text-muted mb-10">
                {smartMode
                  ? 'Modo Smart ativo — escolho o melhor modelo para cada tarefa'
                  : `Usando ${selectedModel?.name || 'nenhum modelo selecionado'}`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p.text}
                    onClick={() => handleStarterPrompt(p.text)}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-surface hover:border-border-strong hover:bg-bg/50 text-left transition-all group"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-sm text-text-muted group-hover:text-text transition-colors leading-snug">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-6">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={{
                    id: msg.id,
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                  }}
                  isStreaming={isLoading && i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-sm px-4 py-3">
          <form onSubmit={handleSend} className="max-w-2xl mx-auto">
            <div className={cn(
              'flex items-end gap-2 rounded-xl border bg-bg transition-all',
              isLoading
                ? 'border-accent/30'
                : 'border-border focus-within:border-border-strong focus-within:shadow-sm'
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (input.trim() && !isLoading) handleSend(e as unknown as React.FormEvent)
                  }
                }}
                rows={1}
                placeholder={isLoading ? 'Gerando resposta…' : 'Mensagem… (Enter para enviar)'}
                disabled={isLoading}
                className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-text placeholder:text-text-muted/50 focus:outline-none min-h-[44px] max-h-36 leading-relaxed"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = t.scrollHeight + 'px'
                }}
              />

              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="mb-2 mr-2 w-8 h-8 rounded-lg flex items-center justify-center bg-border text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all shrink-0"
                  title="Parar geração"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    'mb-2 mr-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0',
                    input.trim()
                      ? 'bg-accent text-white hover:bg-[var(--accent-hover)]'
                      : 'bg-border text-text-muted cursor-not-allowed'
                  )}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-center text-[11px] text-text-muted/40 mt-2">
              Shift+Enter para quebrar linha · Tudo Junto pode cometer erros
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
