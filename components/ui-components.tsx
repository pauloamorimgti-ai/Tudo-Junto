'use client'

import { Conversation } from '@/types'
import { cn } from '@/lib/utils'
import { useUsage } from '@/hooks/useUsage'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client-impl'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  userEmail?: string
  plan?: 'free' | 'pro'
}

export function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete, userEmail, plan }: SidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Group by date
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  const grouped: Record<string, Conversation[]> = {}
  for (const c of conversations) {
    const d = new Date(c.updated_at).toDateString()
    const label = d === today ? 'Hoje' : d === yesterday ? 'Ontem' : new Date(c.updated_at).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })
    grouped[label] = grouped[label] || []
    grouped[label].push(c)
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-sidebar border-r border-border">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-sm font-bold">✦</span>
          </div>
          <span className="font-semibold text-text text-sm">Tudo Junto</span>
          {plan === 'pro' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">PRO</span>
          )}
        </div>
      </div>

      {/* New chat */}
      <div className="px-3 mb-2">
        <button
          onClick={onCreate}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-bg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova conversa
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {Object.entries(grouped).map(([label, convs]) => (
          <div key={label}>
            <p className="px-3 py-1 text-[10px] font-semibold tracking-widest text-text-muted/50 uppercase">{label}</p>
            <div className="space-y-0.5">
              {convs.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  active={c.id === activeId}
                  onSelect={() => onSelect(c.id)}
                  onDelete={() => onDelete(c.id)}
                />
              ))}
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="px-3 text-xs text-text-muted/50 text-center mt-8">Nenhuma conversa ainda</p>
        )}
      </div>

      {/* Bottom: usage + user */}
      <div className="px-3 py-3 border-t border-border space-y-2">
        <UsageCounter />
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-bg transition-colors group">
          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
            {userEmail?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-xs text-text-muted truncate flex-1">{userEmail}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => router.push('/settings')}
              className="p-1 hover:text-text text-text-muted rounded"
              title="Configurações"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="p-1 hover:text-red-500 text-text-muted rounded"
              title="Sair"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

function ConversationItem({ conversation, active, onSelect, onDelete }: {
  conversation: Conversation; active: boolean; onSelect: () => void; onDelete: () => void
}) {
  return (
    <div className={cn('group flex items-center rounded-lg transition-colors', active ? 'bg-bg' : 'hover:bg-bg/60')}>
      <button onClick={onSelect} className="flex-1 text-left px-3 py-2 text-xs text-text-muted truncate">
        {conversation.title || 'Nova conversa'}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 p-2 text-text-muted/50 hover:text-red-400 transition-all"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function UsageCounter() {
  const { usage } = useUsage()
  if (!usage) return null

  const pct = Math.min((usage.used / usage.limit) * 100, 100)
  const isHigh = pct > 80

  if (usage.plan === 'pro') {
    return (
      <div className="px-2 py-1.5 flex items-center gap-2">
        <span className="text-[10px] text-accent font-semibold">✦ PRO</span>
        <span className="text-[10px] text-text-muted">Mensagens ilimitadas</span>
      </div>
    )
  }

  return (
    <div className="px-2 py-1.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-muted">Uso hoje</span>
        <span className={cn('text-[10px] font-medium', isHigh ? 'text-orange-500' : 'text-text-muted')}>
          {usage.used} / {usage.limit}
        </span>
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', isHigh ? 'bg-orange-500' : 'bg-accent')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
