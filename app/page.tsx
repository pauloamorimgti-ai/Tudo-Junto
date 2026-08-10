import Link from 'next/link'

const PROVIDERS = [
  { icon: '🦙', name: 'Groq' },
  { icon: '💨', name: 'Mistral' },
  { icon: '🎭', name: 'Claude' },
  { icon: '🟢', name: 'GPT' },
  { icon: '💎', name: 'Gemini' },
  { icon: '🔷', name: 'DeepSeek' },
  { icon: '🌐', name: 'Perplexity' },
  { icon: '𝕏', name: 'Grok' },
  { icon: '🔀', name: 'OpenRouter' },
]

const FEATURES = [
  {
    icon: '✦',
    title: 'Modo Smart',
    desc: 'Nossa IA detecta o tipo de tarefa e escolhe automaticamente o modelo mais adequado.',
  },
  {
    icon: '⚡',
    title: 'Velocidade máxima',
    desc: 'Acesso direto à Groq e Cerebras — os mais rápidos do mundo, com streaming em tempo real.',
  },
  {
    icon: '🔒',
    title: 'Dados seguros',
    desc: 'Suas conversas ficam no seu banco de dados Supabase. Zero vendor lock-in.',
  },
  {
    icon: '💰',
    title: 'Preço justo',
    desc: 'Plano gratuito com modelos top, e Pro por R$39,90/mês com acesso a todos os modelos.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white text-sm">✦</span>
            </div>
            <span className="font-semibold text-text">Tudo Junto</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-muted hover:text-text transition-colors">
              Entrar
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-8">
            <span>✦</span>
            <span>Beta — gratuito para começar</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight mb-6">
            Todas as IAs boas<br />
            <span className="text-accent">no mesmo lugar</span>
          </h1>

          <p className="text-lg text-text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Groq, Mistral, Claude, GPT, Gemini e dezenas de outros modelos numa interface limpa, rápida e sem complicação.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-[var(--accent-hover)] transition-colors text-sm"
            >
              Começar agora — é grátis
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-border text-text-muted hover:text-text hover:border-border-strong transition-colors text-sm"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* Providers strip */}
        <div className="border-y border-border bg-surface/50 py-6">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-center text-xs text-text-muted mb-4 uppercase tracking-widest font-medium">Modelos disponíveis</p>
            <div className="flex items-center justify-center flex-wrap gap-6">
              {PROVIDERS.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5 text-text-muted">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-border bg-surface hover:border-border-strong transition-colors">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-lg mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-text mb-2">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-border bg-surface/50">
          <div className="max-w-5xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl font-semibold mb-4">Pronto para começar?</h2>
            <p className="text-text-muted mb-8 text-sm">50 mensagens por dia grátis. Sem cartão de crédito.</p>
            <Link
              href="/signup"
              className="inline-flex px-8 py-3.5 rounded-xl bg-accent text-white font-medium hover:bg-[var(--accent-hover)] transition-colors text-sm"
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-text-muted">
          <span>© 2025 Tudo Junto</span>
          <span>Feito no Brasil 🇧🇷</span>
        </div>
      </footer>
    </div>
  )
}
