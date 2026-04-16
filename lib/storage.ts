'use client'

import { useEffect, useState } from 'react'

const PREFIX = 'wt_'

export function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

// React hook for persisted state
export function useStored<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setValue(load<T>(key, initial))
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = (v: T | ((p: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
      save(key, next)
      return next
    })
  }

  return [hydrated ? value : initial, set]
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function formatPKR(n: number): string {
  return 'Rs. ' + new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(n)
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function billNumber(): string {
  const d = new Date()
  const y = d.getFullYear().toString().slice(-2)
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const r = Math.floor(Math.random() * 999).toString().padStart(3, '0')
  return `WT-${y}${m}${day}-${r}`
}
