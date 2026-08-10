'use client'

import { useEffect, useState } from 'react'

export function useUsage() {
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: 'free' | 'pro' } | null>(null)

  const load = async () => {
    const r = await fetch('/api/usage')
    if (r.ok) setUsage(await r.json())
  }

  useEffect(() => { load() }, [])

  return { usage, reload: load }
}
