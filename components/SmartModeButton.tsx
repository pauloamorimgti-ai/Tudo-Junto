'use client'

import { cn } from '@/lib/utils'

interface Props {
  active: boolean
  onToggle: () => void
}

export function SmartModeButton({ active, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title="Modo Tudo Junto Smart: escolhe o melhor modelo automaticamente"
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-accent text-white shadow-sm shadow-accent/30'
          : 'bg-surface border border-border text-text-muted hover:text-text hover:border-border-strong'
      )}
    >
      <span className="text-base">✦</span>
      <span>Smart</span>
    </button>
  )
}
