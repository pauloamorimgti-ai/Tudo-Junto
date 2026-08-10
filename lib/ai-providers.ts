import { createGroq } from '@ai-sdk/groq'
import { createMistral } from '@ai-sdk/mistral'
import { createCohere } from '@ai-sdk/cohere'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { AIModel } from '@/types'

// ─── Key detection ────────────────────────────────────────────────────────────
const hasKey = (key: string) => {
  const val = process.env[key]
  return !!val && val.length > 10 && !val.includes('placeholder') && !val.includes('SUA_CHAVE')
}

// ─── Provider instances ───────────────────────────────────────────────────────
export const getProvider = (provider: string) => {
  switch (provider) {
    case 'groq':
      return createGroq({ apiKey: process.env.GROQ_API_KEY })
    case 'mistral':
      return createMistral({ apiKey: process.env.MISTRAL_API_KEY })
    case 'cohere':
      return createCohere({ apiKey: process.env.COHERE_API_KEY })
    case 'openai':
      return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
    case 'anthropic':
      return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    case 'google':
      return createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })
    case 'openrouter':
      return createOpenAICompatible({
        name: 'openrouter',
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'Tudo Junto',
        },
      })
    case 'cloudflare':
      return createOpenAICompatible({
        name: 'cloudflare',
        baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      })
    case 'huggingface':
      return createOpenAICompatible({
        name: 'huggingface',
        baseURL: 'https://api-inference.huggingface.co/v1',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      })
    case 'xai':
      return createOpenAICompatible({
        name: 'xai',
        baseURL: 'https://api.x.ai/v1',
        headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
      })
    case 'deepseek':
      return createOpenAICompatible({
        name: 'deepseek',
        baseURL: 'https://api.deepseek.com/v1',
        headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      })
    case 'perplexity':
      return createOpenAICompatible({
        name: 'perplexity',
        baseURL: 'https://api.perplexity.ai',
        headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` },
      })
    case 'cerebras':
      return createOpenAICompatible({
        name: 'cerebras',
        baseURL: 'https://api.cerebras.ai/v1',
        headers: { Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}` },
      })
    case 'sambanova':
      return createOpenAICompatible({
        name: 'sambanova',
        baseURL: 'https://api.sambanova.ai/v1',
        headers: { Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}` },
      })
    default:
      throw new Error(`Provider "${provider}" não reconhecido`)
  }
}

// ─── Model registry ───────────────────────────────────────────────────────────
const ALL_MODELS: AIModel[] = [
  // ── Groq (free) ──
  {
    id: 'groq/llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    description: 'Meta Llama rápido e versátil via Groq',
    contextWindow: 128000,
    free: true,
    tags: ['fast', 'smart'],
    icon: '🦙',
  },
  {
    id: 'groq/llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    description: 'Ultra rápido para tarefas simples',
    contextWindow: 128000,
    free: true,
    tags: ['fast'],
    icon: '⚡',
  },
  {
    id: 'groq/mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    description: 'Mixture of Experts da Mistral',
    contextWindow: 32768,
    free: true,
    tags: ['smart', 'code'],
    icon: '🌀',
  },
  {
    id: 'groq/deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill (Groq)',
    provider: 'groq',
    description: 'Raciocínio avançado via Groq',
    contextWindow: 128000,
    free: true,
    tags: ['reasoning', 'smart'],
    icon: '🧠',
  },

  // ── Mistral (free tier) ──
  {
    id: 'mistral/mistral-small-latest',
    name: 'Mistral Small',
    provider: 'mistral',
    description: 'Modelo eficiente da Mistral AI',
    contextWindow: 32000,
    free: true,
    tags: ['fast', 'creative'],
    icon: '💨',
  },
  {
    id: 'mistral/open-mistral-7b',
    name: 'Mistral 7B',
    provider: 'mistral',
    description: 'Open source da Mistral',
    contextWindow: 32000,
    free: true,
    tags: ['fast'],
    icon: '💨',
  },

  // ── Cohere (free) ──
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'cohere',
    description: 'Cohere para tarefas complexas e pesquisa',
    contextWindow: 128000,
    free: true,
    tags: ['smart', 'search'],
    icon: '🔍',
  },
  {
    id: 'cohere/command-r',
    name: 'Command R',
    provider: 'cohere',
    description: 'Cohere equilibrado',
    contextWindow: 128000,
    free: true,
    tags: ['fast', 'search'],
    icon: '🔍',
  },

  // ── Cloudflare (free) ──
  {
    id: 'cloudflare/@cf/meta/llama-3-8b-instruct',
    name: 'Llama 3 8B (CF)',
    provider: 'cloudflare',
    description: 'Llama via Cloudflare Workers AI',
    contextWindow: 8000,
    free: true,
    tags: ['fast'],
    icon: '☁️',
  },

  // ── HuggingFace (free) ──
  {
    id: 'huggingface/mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B (HF)',
    provider: 'huggingface',
    description: 'Mistral via Hugging Face Inference',
    contextWindow: 32000,
    free: true,
    tags: ['fast'],
    icon: '🤗',
  },

  // ── OpenRouter (free & paid) ──
  {
    id: 'openrouter/meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (OR)',
    provider: 'openrouter',
    description: 'Llama 70B grátis via OpenRouter',
    contextWindow: 128000,
    free: true,
    tags: ['smart', 'fast'],
    icon: '🔀',
  },
  {
    id: 'openrouter/deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (OR)',
    provider: 'openrouter',
    description: 'DeepSeek R1 grátis via OpenRouter',
    contextWindow: 128000,
    free: true,
    tags: ['reasoning'],
    icon: '🧩',
  },
  {
    id: 'openrouter/google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (OR)',
    provider: 'openrouter',
    description: 'Gemini Flash grátis via OpenRouter',
    contextWindow: 1000000,
    free: true,
    tags: ['fast', 'vision', 'long-context'],
    icon: '✨',
  },
  {
    id: 'openrouter/anthropic/claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'openrouter',
    description: 'Claude via OpenRouter',
    contextWindow: 200000,
    free: false,
    tags: ['smart', 'code', 'creative'],
    icon: '🎭',
  },
  {
    id: 'openrouter/openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    description: 'OpenAI GPT-4o via OpenRouter',
    contextWindow: 128000,
    free: false,
    tags: ['smart', 'vision'],
    icon: '🟢',
  },

  // ── OpenAI (paid) ──
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI mais capaz e multimodal',
    contextWindow: 128000,
    free: false,
    tags: ['smart', 'vision', 'code'],
    icon: '🟢',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Rápido e econômico da OpenAI',
    contextWindow: 128000,
    free: false,
    tags: ['fast', 'code'],
    icon: '🟢',
  },

  // ── Anthropic (paid) ──
  {
    id: 'anthropic/claude-fable-5',
    name: 'Claude Fable 5',
    provider: 'anthropic',
    description: 'Topo absoluto da Anthropic — 1M tokens, thinking adaptativo',
    contextWindow: 1000000,
    free: false,
    tags: ['smart', 'code', 'creative', 'reasoning', 'long-context'],
    icon: '🎭',
  },
  {
    id: 'anthropic/claude-opus-4-8',
    name: 'Claude Opus 4.8',
    provider: 'anthropic',
    description: 'Flagship Opus — raciocínio e código de alto nível',
    contextWindow: 200000,
    free: false,
    tags: ['smart', 'code', 'creative', 'reasoning'],
    icon: '🎭',
  },
  {
    id: 'anthropic/claude-opus-4-7',
    name: 'Claude Opus 4.7',
    provider: 'anthropic',
    description: 'Opus de segunda geração, ótimo custo-benefício de topo',
    contextWindow: 200000,
    free: false,
    tags: ['smart', 'code', 'reasoning'],
    icon: '🎭',
  },
  {
    id: 'anthropic/claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    description: 'Opus geração anterior — muito capaz',
    contextWindow: 200000,
    free: false,
    tags: ['smart', 'code', 'creative', 'reasoning'],
    icon: '🎭',
  },
  {
    id: 'anthropic/claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    description: 'Equilíbrio perfeito — qualidade e velocidade da Anthropic',
    contextWindow: 200000,
    free: false,
    tags: ['smart', 'code', 'creative'],
    icon: '🎭',
  },
  {
    id: 'anthropic/claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Mais rápido e econômico da Anthropic',
    contextWindow: 200000,
    free: false,
    tags: ['fast', 'code'],
    icon: '🎭',
  },

  // ── Google (paid) ──
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'Melhor modelo do Google',
    contextWindow: 1000000,
    free: false,
    tags: ['smart', 'vision', 'long-context', 'reasoning'],
    icon: '💎',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Google rápido e eficiente',
    contextWindow: 1000000,
    free: false,
    tags: ['fast', 'vision', 'long-context'],
    icon: '💎',
  },

  // ── DeepSeek (paid) ──
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'DeepSeek para código e raciocínio',
    contextWindow: 128000,
    free: false,
    tags: ['code', 'reasoning', 'smart'],
    icon: '🔷',
  },
  {
    id: 'deepseek/deepseek-reasoner',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    description: 'DeepSeek raciocínio avançado',
    contextWindow: 128000,
    free: false,
    tags: ['reasoning'],
    icon: '🔷',
  },

  // ── xAI (paid) ──
  {
    id: 'xai/grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    description: 'Grok da xAI com acesso à internet',
    contextWindow: 131072,
    free: false,
    tags: ['smart', 'search'],
    icon: '𝕏',
  },

  // ── Cerebras (free tier) ──
  {
    id: 'cerebras/llama3.1-8b',
    name: 'Llama 3.1 8B (Cerebras)',
    provider: 'cerebras',
    description: 'Llama ultrarrápido via chip Cerebras — o mais veloz disponível',
    contextWindow: 8192,
    free: true,
    tags: ['fast'],
    icon: '🧩',
  },
  {
    id: 'cerebras/llama3.1-70b',
    name: 'Llama 3.1 70B (Cerebras)',
    provider: 'cerebras',
    description: 'Llama 70B com velocidade absurda via Cerebras',
    contextWindow: 8192,
    free: true,
    tags: ['fast', 'smart'],
    icon: '🧩',
  },

  // ── SambaNova (free tier) ──
  {
    id: 'sambanova/Meta-Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B (SambaNova)',
    provider: 'sambanova',
    description: 'Llama 70B via SambaNova — rápido e gratuito',
    contextWindow: 128000,
    free: true,
    tags: ['fast', 'smart'],
    icon: '🔵',
  },
  {
    id: 'sambanova/DeepSeek-R1',
    name: 'DeepSeek R1 (SambaNova)',
    provider: 'sambanova',
    description: 'DeepSeek R1 via SambaNova — raciocínio gratuito',
    contextWindow: 32000,
    free: true,
    tags: ['reasoning', 'smart'],
    icon: '🔵',
  },
  {
    id: 'sambanova/Meta-Llama-3.1-405B-Instruct',
    name: 'Llama 3.1 405B (SambaNova)',
    provider: 'sambanova',
    description: 'Modelo gigante 405B gratuito via SambaNova',
    contextWindow: 16384,
    free: true,
    tags: ['smart', 'reasoning', 'code'],
    icon: '🔵',
  },

  // ── Perplexity (paid) ──
  {
    id: 'perplexity/sonar-pro',
    name: 'Sonar Pro',
    provider: 'perplexity',
    description: 'Perplexity com busca em tempo real',
    contextWindow: 200000,
    free: false,
    tags: ['search', 'smart'],
    icon: '🌐',
  },
]

// ─── Filter by available keys ─────────────────────────────────────────────────
export function getAvailableModels(): AIModel[] {
  const keyMap: Record<string, string> = {
    groq: 'GROQ_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    cohere: 'COHERE_API_KEY',
    huggingface: 'HUGGINGFACE_API_KEY',
    cloudflare: 'CLOUDFLARE_API_TOKEN',
    openrouter: 'OPENROUTER_API_KEY',
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
    xai: 'XAI_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    perplexity: 'PERPLEXITY_API_KEY',
    cerebras: 'CEREBRAS_API_KEY',
    sambanova: 'SAMBANOVA_API_KEY',
  }

  return ALL_MODELS.filter((m) => hasKey(keyMap[m.provider] || ''))
}

export function getModelById(id: string): AIModel | undefined {
  return ALL_MODELS.find((m) => m.id === id)
}

// Returns provider instance + model string from composite model ID
export function resolveModel(modelId: string) {
  const [providerKey, ...rest] = modelId.split('/')
  const modelString = rest.join('/')
  const providerInstance = getProvider(providerKey)
  return { provider: providerInstance, modelString }
}
