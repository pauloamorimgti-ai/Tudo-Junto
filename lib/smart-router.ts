import { AIModel, SmartTask } from '@/types'
import { getAvailableModels } from './ai-providers'

// ─── Task detection ───────────────────────────────────────────────────────────
export function detectTask(prompt: string): SmartTask {
  const p = prompt.toLowerCase()

  const codeKeywords = ['código', 'code', 'função', 'function', 'bug', 'erro', 'script', 'api', 'typescript', 'python', 'javascript', 'react', 'sql', 'programar', 'implementar', 'debugar']
  const reasoningKeywords = ['calcule', 'calcular', 'matemática', 'math', 'lógica', 'raciocínio', 'prove', 'demonstre', 'resolva', 'equação', 'theorem', 'prova', 'dedução']
  const searchKeywords = ['notícia', 'news', 'atual', 'recent', 'hoje', 'today', 'pesquise', 'search', 'busque', 'último', 'latest', 'mercado', 'preço']
  const speedKeywords = ['rápido', 'resumo', 'lista', 'quick', 'simples', 'curto', 'brevemente', 'traduz', 'translate']
  const creativeKeywords = ['escreva', 'crie', 'story', 'história', 'poema', 'poem', 'redação', 'criativo', 'blog', 'marketing', 'copywriting', 'roteiro']
  const visionKeywords = ['imagem', 'image', 'foto', 'picture', 'veja', 'analise a imagem', 'screenshot', 'diagrama']

  if (codeKeywords.some((k) => p.includes(k))) return 'code'
  if (reasoningKeywords.some((k) => p.includes(k))) return 'reasoning'
  if (searchKeywords.some((k) => p.includes(k))) return 'search'
  if (visionKeywords.some((k) => p.includes(k))) return 'vision'
  if (speedKeywords.some((k) => p.includes(k))) return 'speed'
  if (creativeKeywords.some((k) => p.includes(k))) return 'creative'

  return 'general'
}

// ─── Priority lists per task ──────────────────────────────────────────────────
const TASK_PRIORITIES: Record<SmartTask, string[]> = {
  code: [
    'anthropic/claude-fable-5',
    'anthropic/claude-opus-4-8',
    'anthropic/claude-opus-4-7',
    'anthropic/claude-opus-4-6',
    'anthropic/claude-sonnet-4-6',
    'openrouter/anthropic/claude-sonnet-4-6',
    'deepseek/deepseek-chat',
    'openai/gpt-4o',
    'groq/deepseek-r1-distill-llama-70b',
    'groq/llama-3.3-70b-versatile',
    'mistral/mistral-small-latest',
  ],
  reasoning: [
    'anthropic/claude-fable-5',
    'anthropic/claude-opus-4-8',
    'deepseek/deepseek-reasoner',
    'openrouter/deepseek/deepseek-r1:free',
    'anthropic/claude-opus-4-7',
    'anthropic/claude-opus-4-6',
    'google/gemini-2.5-pro',
    'groq/deepseek-r1-distill-llama-70b',
    'openai/gpt-4o',
    'groq/llama-3.3-70b-versatile',
  ],
  search: [
    'perplexity/sonar-pro',
    'xai/grok-beta',
    'google/gemini-2.5-pro',
    'cohere/command-r-plus',
    'cohere/command-r',
    'groq/llama-3.3-70b-versatile',
  ],
  speed: [
    'anthropic/claude-haiku-4-5-20251001',
    'groq/llama-3.1-8b-instant',
    'groq/llama-3.3-70b-versatile',
    'groq/mixtral-8x7b-32768',
    'openrouter/google/gemini-2.0-flash-exp:free',
    'cloudflare/@cf/meta/llama-3-8b-instruct',
    'mistral/open-mistral-7b',
  ],
  creative: [
    'anthropic/claude-fable-5',
    'anthropic/claude-opus-4-8',
    'anthropic/claude-sonnet-4-6',
    'openrouter/anthropic/claude-sonnet-4-6',
    'openai/gpt-4o',
    'google/gemini-2.5-pro',
    'mistral/mistral-small-latest',
    'groq/llama-3.3-70b-versatile',
  ],
  vision: [
    'google/gemini-2.5-pro',
    'openai/gpt-4o',
    'anthropic/claude-fable-5',
    'anthropic/claude-opus-4-8',
    'anthropic/claude-opus-4-6',
    'openrouter/google/gemini-2.0-flash-exp:free',
  ],
  general: [
    'anthropic/claude-sonnet-4-6',
    'groq/llama-3.3-70b-versatile',
    'openrouter/meta-llama/llama-3.3-70b-instruct:free',
    'mistral/mistral-small-latest',
    'cohere/command-r-plus',
    'openai/gpt-4o',
  ],
}

// ─── Smart route ──────────────────────────────────────────────────────────────
export function smartRoute(prompt: string): { model: AIModel; task: SmartTask } {
  const available = getAvailableModels()
  const availableIds = new Set(available.map((m) => m.id))
  const task = detectTask(prompt)
  const priority = TASK_PRIORITIES[task]

  for (const modelId of priority) {
    if (availableIds.has(modelId)) {
      return { model: available.find((m) => m.id === modelId)!, task }
    }
  }

  // Fallback: any available model
  const fallback = available[0]
  if (!fallback) throw new Error('Nenhum modelo disponível. Configure pelo menos uma chave de API.')
  return { model: fallback, task }
}
