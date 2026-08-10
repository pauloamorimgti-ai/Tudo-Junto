export type Provider =
  | 'groq'
  | 'mistral'
  | 'cohere'
  | 'huggingface'
  | 'cloudflare'
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'xai'
  | 'perplexity'
  | 'deepseek'

export interface AIModel {
  id: string
  name: string
  provider: Provider
  description: string
  contextWindow: number
  free: boolean
  tags: ModelTag[]
  icon: string
}

export type ModelTag =
  | 'fast'
  | 'smart'
  | 'code'
  | 'creative'
  | 'vision'
  | 'reasoning'
  | 'search'
  | 'long-context'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
  model?: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  model_id: string
  messages: Message[]
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'pro'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface UsageRecord {
  id: string
  user_id: string
  date: string
  message_count: number
  created_at: string
}

export type SmartTask =
  | 'code'
  | 'reasoning'
  | 'search'
  | 'speed'
  | 'creative'
  | 'vision'
  | 'general'
