'use client'

import { useState, useRef, useEffect } from 'react'
import { AIModel } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  models: AIModel[]
  selected: AIModel | null
  onSelect: (model: AIModel) => void
}

const TAG_LABELS: Record<string, string> = {
  fast: '⚡ Rápido',
  smart: '🧠 Inteligente',
  code: '💻 Código',
  creative: '✨ Criativo',
  vision: '👁 Visão',
  reasoning: '🔢 Raciocínio',
  search: '🌐 Busca',
  'long-context': '📄 Longo',
}

export function ModelSelector({ models, selected, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = models.filter((m) =>
    m.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.provider.toLowerCase().includes(filter.toLowerCase())
  )

  const freeModels = filtered.filter((m) => m.free)
  const paidModels = filtered.filter((m) => !m.free)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          'bg-surface border border-border text-text-muted hover:text-text hover:border-border-strong',
          'focus:outline-none focus:ring-2 focus:ring-accent/20'
        )}
      >
        {selected ? (
          <>
            <span>{selected.icon}</span>
            <span className="max-w-[140px] truncate">{selected.name}</span>
            {selected.free && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold">
                GRÁTIS
              </span>
            )}
          </>
        ) : (
          <span>Escolher modelo</span>
        )}
        <svg className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={cn(
          'absolute bottom-full mb-2 left-0 z-50 w-80',
          'bg-surface border border-border rounded-xl shadow-lg shadow-black/10',
          'overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150'
        )}>
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar modelo..."
              className="w-full px-3 py-1.5 text-sm bg-bg rounded-lg border border-border focus:outline-none focus:border-accent/40 placeholder:text-text-muted/50"
            />
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {freeModels.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold tracking-widest text-text-muted/60 uppercase">
                  Gratuitos
                </div>
                {freeModels.map((model) => (
                  <ModelOption key={model.id} model={model} selected={selected} onSelect={(m) => { onSelect(m); setOpen(false) }} />
                ))}
              </>
            )}
            {paidModels.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold tracking-widest text-text-muted/60 uppercase border-t border-border mt-1 pt-2">
                  Premium
                </div>
                {paidModels.map((model) => (
                  <ModelOption key={model.id} model={model} selected={selected} onSelect={(m) => { onSelect(m); setOpen(false) }} />
                ))}
              </>
            )}
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-text-muted">Nenhum modelo encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ModelOption({ model, selected, onSelect }: { model: AIModel; selected: AIModel | null; onSelect: (m: AIModel) => void }) {
  const isSelected = selected?.id === model.id
  return (
    <button
      onClick={() => onSelect(model)}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors',
        isSelected ? 'bg-accent/8 text-text' : 'hover:bg-bg text-text-muted hover:text-text'
      )}
    >
      <span className="text-base mt-0.5">{model.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{model.name}</span>
          {model.free && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-semibold shrink-0">
              GRÁTIS
            </span>
          )}
          {isSelected && <span className="ml-auto text-accent">✓</span>}
        </div>
        <p className="text-xs text-text-muted/70 truncate mt-0.5">{model.description}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {model.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-border/60 text-text-muted">
              {TAG_LABELS[tag] || tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
