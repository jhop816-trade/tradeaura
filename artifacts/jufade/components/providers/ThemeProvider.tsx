'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { themes, DEFAULT_THEME_ID, type ThemeId } from '@/config/themes'
import { applyTheme } from '@/lib/themeColors'

type ThemeCtx = { id: ThemeId; setTheme: (id: ThemeId) => void }

const Ctx = createContext<ThemeCtx>({ id: DEFAULT_THEME_ID, setTheme: () => {} })

const STORAGE_KEY = 'jufade-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState<ThemeId>(DEFAULT_THEME_ID)

  // Restore a previewed choice on load (per-visitor; the shipped default is
  // DEFAULT_THEME_ID in config/themes.ts).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    const initial = stored && themes[stored] ? stored : DEFAULT_THEME_ID
    applyTheme(themes[initial])
    setId(initial)
  }, [])

  const setTheme = (next: ThemeId) => {
    applyTheme(themes[next])
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore storage errors */
    }
    setId(next)
  }

  return <Ctx.Provider value={{ id, setTheme }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
