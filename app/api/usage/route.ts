import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getDailyUsage } from '@/lib/usage-limiter'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const usage = await getDailyUsage(user.id)
  return NextResponse.json(usage)
}
