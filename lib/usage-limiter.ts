import { createClient } from './supabase-server'

const DAILY_LIMIT_FREE = parseInt(process.env.DAILY_MESSAGE_LIMIT || '50')
const DAILY_LIMIT_PRO = 9999

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean
  used: number
  limit: number
  plan: 'free' | 'pro'
}> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Get user plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan = (profile?.plan as 'free' | 'pro') ?? 'free'
  const limit = plan === 'pro' ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE

  // Upsert usage record
  const { data: usage } = await supabase
    .from('usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const used = usage?.message_count ?? 0

  if (used >= limit) {
    return { allowed: false, used, limit, plan }
  }

  // Increment
  await supabase.from('usage').upsert(
    { user_id: userId, date: today, message_count: used + 1 },
    { onConflict: 'user_id,date' }
  )

  return { allowed: true, used: used + 1, limit, plan }
}

export async function getDailyUsage(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan = (profile?.plan as 'free' | 'pro') ?? 'free'
  const limit = plan === 'pro' ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE

  const { data: usage } = await supabase
    .from('usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  return { used: usage?.message_count ?? 0, limit, plan }
}
