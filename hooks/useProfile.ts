'use client'

import { useEffect, useState } from 'react'
import { Profile } from '@/types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { profile, loading }
}
