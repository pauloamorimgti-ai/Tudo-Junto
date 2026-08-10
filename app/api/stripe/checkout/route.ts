import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { plan } = await req.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: profile?.stripe_customer_id || undefined,
    customer_email: !profile?.stripe_customer_id ? user.email : undefined,
    mode: 'subscription',
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/chat?upgraded=true`,
    cancel_url: `${appUrl}/settings`,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
  })

  return NextResponse.json({ url: session.url })
}
