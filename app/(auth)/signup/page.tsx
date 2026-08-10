'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client-impl'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/chat'), 1500)
    }
  }

  if (done) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl mx-auto mb-4">✓</div>
        <h2 className="font-semibold text-text mb-2">Conta criada!</h2>
        <p className="text-sm text-text-muted">Redirecionando...</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-8">
      <h1 className="text-xl font-semibold text-text mb-1">Criar conta grátis</h1>
      <p className="text-sm text-text-muted mb-6">50 mensagens/dia sem cartão</p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-text-muted/40"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-text-muted/40"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-text-muted/40"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && (
          <div className="text-xs text-red-500 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-xs text-text-muted text-center mt-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
