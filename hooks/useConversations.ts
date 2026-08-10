'use client'

import { useEffect, useState, useCallback } from 'react'
import { Conversation } from '@/types'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const r = await fetch('/api/conversations')
    const data = await r.json()
    if (Array.isArray(data)) setConversations(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async () => {
    const r = await fetch('/api/conversations', { method: 'POST' })
    const data = await r.json()
    setConversations((prev) => [data, ...prev])
    return data as Conversation
  }, [])

  const remove = useCallback(async (id: string) => {
    await fetch('/api/conversations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const updateTitle = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    )
  }, [])

  return { conversations, loading, create, remove, updateTitle, reload: load }
}
