'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client-impl'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
    } else {
      router.push('/chat')
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-8">
      <h1 className="text-xl font-semibold text-text mb-1">Bem-vindo de volta</h1>
      <p className="text-sm text-text-muted mb-6">Entre na sua conta</p>

      <form onSubmit={handleLogin} className="space-y-4">
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
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-text-muted/40"
            placeholder="••••••••"
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
          className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-xs text-text-muted text-center mt-6">
        Não tem conta?{' '}
        <Link href="/signup" className="text-accent hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </div>
  )
}
