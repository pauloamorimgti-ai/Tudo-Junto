import { AIModel, SmartTask } from '@/types'
import { getAvailableModels } from './ai-providers'

// ─── Task detection ───────────────────────────────────────────────────────────
export function detectTask(prompt: string): SmartTask {
  const p = prompt.toLowerCase()

  // Detecta tarefas de velocidade/simples PRIMEIRO — evita usar modelo caro pra coisa básica
  const speedKeywords = [
    'rápido', 'resumo', 'lista', 'quick', 'simples', 'curto', 'brevemente',
    'traduz', 'translate', 'o que é', 'what is', 'explique', 'explain',
    'defina', 'define', 'significa', 'significa', 'como funciona', 'diferença entre',
    'quais são', 'me diga', 'me fale', 'fale sobre', 'me explique',
  ]

  const codeKeywords = [
    'código', 'code', 'função', 'function', 'bug', 'erro', 'script', 'api',
    'typescript', 'python', 'javascript', 'react', 'sql', 'programar',
    'implementar', 'debugar', 'componente', 'endpoint', 'deploy', 'github',
    'instalar', 'npm', 'pip', 'classe', 'método', 'variável', 'array', 'objeto',
  ]

  const reasoningKeywords = [
    'calcule', 'calcular', 'matemática', 'math', 'lógica', 'raciocínio',
    'prove', 'demonstre', 'resolva', 'equação', 'theorem', 'prova', 'dedução',
    'analise', 'compare', 'avalie', 'estratégia', 'plano de negócio',
  ]

  const searchKeywords = [
    'notícia', 'news', 'atual', 'recent', 'hoje', 'today', 'pesquise',
    'search', 'busque', 'último', 'latest', 'mercado', 'preço', 'agora',
    'aconteceu', 'lançou', 'novo modelo', '2025', '2026',
  ]

  const creativeKeywords = [
    'escreva', 'crie', 'story', 'história', 'poema', 'poem', 'redação',
    'criativo', 'blog', 'marketing', 'copywriting', 'roteiro', 'slogan',
    'campanha', 'texto persuasivo', 'email marketing', 'post',
  ]

  const visionKeywords = [
    'imagem', 'image', 'foto', 'picture', 'veja', 'analise a imagem',
    'screenshot', 'diagrama', 'o que aparece', 'descreva a imagem',
  ]

  // Ordem importa: speed primeiro para economizar
  if (speedKeywords.some((k) => p.includes(k))) return 'speed'
  if (visionKeywords.some((k) => p.includes(k))) return 'vision'
  if (searchKeywords.some((k) => p.includes(k))) return 'search'
  if (codeKeywords.some((k) => p.includes(k))) return 'code'
  if (reasoningKeywords.some((k) => p.includes(k))) return 'reasoning'
  if (creativeKeywords.some((k) => p.includes(k))) return 'creative'

  return 'general'
}

// ─── Priority lists per task ──────────────────────────────────────────────────
// Lógica de economia:
// - Tarefas simples/gerais → Haiku primeiro (barato), depois Groq grátis, depois Sonnet
// - Tarefas criativas → Sonnet (bom custo-benefício), Opus só se necessário
// - Código → Sonnet primeiro, Opus só para complexidade alta
// - Raciocínio → DeepSeek grátis via OpenRouter, depois Claude Opus
// - Busca → Perplexity/Groq grátis primeiro, Claude como fallback
// - Velocidade → Groq grátis primeiro, Haiku como fallback pago
// - Visão → Gemini grátis via OpenRouter, Claude como fallback

const TASK_PRIORITIES: Record<SmartTask, string[]> = {

  // Tarefas simples: Cerebras é o mais rápido do mundo, grátis
  speed: [
    'cerebras/llama3.1-8b',                  // grátis, MAIS RÁPIDO — chip Cerebras
    'cerebras/llama3.1-70b',                 // grátis, rápido e capaz
    'groq/llama-3.1-8b-instant',             // grátis, ultrarrápido
    'groq/llama-3.3-70b-versatile',          // grátis, bom
    'groq/mixtral-8x7b-32768',               // grátis
    'openrouter/google/gemini-2.0-flash-exp:free', // grátis
    'cloudflare/@cf/meta/llama-3-8b-instruct', // grátis
    'mistral/open-mistral-7b',               // barato
    'anthropic/claude-haiku-4-5-20251001',   // Claude mais barato — fallback pago
    'anthropic/claude-sonnet-4-6',           // fallback final
  ],

  // Tarefas gerais: grátis primeiro, Claude como fallback
  general: [
    'cerebras/llama3.1-70b',                 // grátis, rápido
    'sambanova/Meta-Llama-3.3-70B-Instruct', // grátis, capaz
    'groq/llama-3.3-70b-versatile',          // grátis, capaz
    'openrouter/meta-llama/llama-3.3-70b-instruct:free', // grátis
    'mistral/mistral-small-latest',          // barato
    'cohere/command-r',                      // barato
    'anthropic/claude-haiku-4-5-20251001',   // Claude econômico
    'anthropic/claude-sonnet-4-6',           // Claude médio
  ],

  // Busca: especialistas primeiro, Claude como fallback
  search: [
    'perplexity/sonar-pro',                  // especialista em busca
    'xai/grok-beta',                         // acesso à web
    'groq/llama-3.3-70b-versatile',          // grátis
    'cohere/command-r-plus',                 // bom em busca
    'cohere/command-r',                      // barato
    'google/gemini-2.5-pro',                 // capaz
    'anthropic/claude-haiku-4-5-20251001',   // Claude econômico
    'anthropic/claude-sonnet-4-6',           // fallback
  ],

  // Código: modelos especializados grátis primeiro
  code: [
    'sambanova/Meta-Llama-3.1-405B-Instruct', // grátis, gigante 405B
    'groq/deepseek-r1-distill-llama-70b',    // grátis, bom em código
    'sambanova/DeepSeek-R1',                 // grátis, raciocínio
    'deepseek/deepseek-chat',                // barato, especialista
    'anthropic/claude-sonnet-4-6',           // Claude econômico para código
    'anthropic/claude-opus-4-6',             // Claude mais capaz
    'anthropic/claude-opus-4-7',             // Claude topo
    'anthropic/claude-opus-4-8',             // Claude topo mais recente
    'anthropic/claude-fable-5',              // Claude máximo
    'openai/gpt-4o',                         // alternativa
    'groq/llama-3.3-70b-versatile',          // fallback grátis
  ],

  // Raciocínio: DeepSeek e SambaNova grátis primeiro
  reasoning: [
    'sambanova/DeepSeek-R1',                 // grátis, especialista
    'openrouter/deepseek/deepseek-r1:free',  // grátis
    'groq/deepseek-r1-distill-llama-70b',    // grátis
    'sambanova/Meta-Llama-3.1-405B-Instruct', // grátis, gigante
    'deepseek/deepseek-reasoner',            // barato, especialista
    'anthropic/claude-sonnet-4-6',           // Claude econômico
    'anthropic/claude-opus-4-6',             // Claude capaz
    'anthropic/claude-opus-4-7',             // Claude mais capaz
    'anthropic/claude-opus-4-8',             // Claude topo
    'anthropic/claude-fable-5',              // Claude máximo
    'google/gemini-2.5-pro',                 // alternativa
  ],

  // Criativo: modelos grátis primeiro
  creative: [
    'sambanova/Meta-Llama-3.3-70B-Instruct', // grátis, criativo
    'groq/llama-3.3-70b-versatile',          // grátis
    'mistral/mistral-small-latest',          // barato, bom em escrita
    'anthropic/claude-sonnet-4-6',           // Claude — excelente para escrita
    'anthropic/claude-opus-4-6',             // Claude mais expressivo
    'anthropic/claude-fable-5',              // Claude máximo criativo
    'openai/gpt-4o',                         // alternativa
    'google/gemini-2.5-pro',                 // alternativa
  ],

  // Visão: Gemini grátis primeiro, Claude como fallback
  vision: [
    'openrouter/google/gemini-2.0-flash-exp:free', // grátis com visão
    'google/gemini-2.5-pro',                 // pago mas capaz
    'openai/gpt-4o',                         // alternativa
    'anthropic/claude-sonnet-4-6',           // Claude econômico com visão
    'anthropic/claude-opus-4-6',             // Claude mais capaz
    'anthropic/claude-fable-5',              // Claude máximo
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

  // Fallback: qualquer modelo disponível
  const fallback = available[0]
  if (!fallback) throw new Error('Nenhum modelo disponível. Configure pelo menos uma chave de API.')
  return { model: fallback, task }
}
