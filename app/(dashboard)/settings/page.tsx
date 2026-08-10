'use client'

import { useProfile } from '@/hooks/useProfile'
import { useUsage } from '@/hooks/useUsage'
import Link from 'next/link'
import { useState } from 'react'

const PLANS = [
  {
    id: 'pro_monthly',
    name: 'Pro Mensal',
    price: 'R$39,90',
    period: '/mês',
    features: ['Mensagens ilimitadas', 'Todos os modelos', 'Prioridade no suporte', 'Histórico completo'],
  },
  {
    id: 'pro_yearly',
    name: 'Pro Anual',
    price: 'R$399,00',
    period: '/ano',
    badge: '2 meses grátis',
    features: ['Tudo do plano mensal', 'Economia de R$79,80', 'Acesso antecipado a novos modelos'],
  },
]

export default function SettingsPage() {
  const { profile, loading } = useProfile()
  const { usage } = useUsage()
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId)
    const r = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    const { url } = await r.json()
    if (url) window.location.href = url
    setCheckoutLoading(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  const isPro = profile?.plan === 'pro'

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back */}
        <Link href="/chat" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao chat
        </Link>

        <h1 className="text-2xl font-semibold text-text mb-8">Configurações</h1>

        {/* Profile card */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-text mb-4">Perfil</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-xl font-semibold text-accent">
              {profile?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-text text-sm">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-text-muted">{profile?.email}</p>
            </div>
            <div className="ml-auto">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                isPro ? 'bg-accent/10 text-accent' : 'bg-border text-text-muted'
              }`}>
                {isPro ? '✦ PRO' : 'GRÁTIS'}
              </span>
            </div>
          </div>
        </div>

        {/* Usage card */}
        {usage && !isPro && (
          <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-text mb-4">Uso hoje</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Mensagens</span>
              <span className="text-sm font-medium text-text">{usage.used} / {usage.limit}</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-text-muted mt-3">Reinicia à meia-noite. Faça upgrade para mensagens ilimitadas.</p>
          </div>
        )}

        {/* Plans */}
        {!isPro && (
          <div>
            <h2 className="text-sm font-semibold text-text mb-4">Planos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLANS.map((plan) => (
                <div key={plan.id} className="bg-surface border border-border hover:border-accent/40 rounded-2xl p-6 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-text text-sm">{plan.name}</p>
                      <p className="text-2xl font-semibold text-text mt-1">
                        {plan.price}
                        <span className="text-sm font-normal text-text-muted">{plan.period}</span>
                      </p>
                    </div>
                    {plan.badge && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-semibold">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="text-accent">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={checkoutLoading === plan.id}
                    className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                  >
                    {checkoutLoading === plan.id ? 'Redirecionando...' : 'Assinar agora'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isPro && (
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">✦</div>
            <p className="font-semibold text-text mb-1">Você é PRO!</p>
            <p className="text-sm text-text-muted">Aproveite mensagens ilimitadas e todos os modelos.</p>
          </div>
        )}
      </div>
    </div>
  )
}
