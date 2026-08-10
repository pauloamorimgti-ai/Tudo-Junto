import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAvailableModels } from '@/lib/ai-providers'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const models = getAvailableModels()
  return NextResponse.json(models)
}
