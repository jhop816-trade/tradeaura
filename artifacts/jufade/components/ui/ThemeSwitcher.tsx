'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Palette, X } from 'lucide-react'
import { themes, type ThemeId } from '@/config/themes'
import { useTheme } from '@/components/providers/ThemeProvider'

/**
 * Floating preview control to compare the three looks live. Once you've picked
 * one, set DEFAULT_THEME_ID in config/themes.ts and delete <ThemeSwitcher />
 * from app/layout.tsx to remove this widget.
 */
export function ThemeSwitcher() {
  const { id, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const list = Object.values(themes)

  return (
    <div className="fixed bottom-4 left-4 z-[60]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-64 rounded-2xl border border-line bg-ink/95 p-3 shadow-2xl shadow-black/60 backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-smoke">
                Preview a look
              </p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close theme preview" className="text-smoke hover:text-frost">
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {list.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as ThemeId)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    id === t.id ? 'border-gold/70 bg-panel' : 'border-line bg-panel/40 hover:border-gold/40'
                  }`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border border-white/10"
                    style={{ background: t.css.accent, boxShadow: `0 0 14px ${t.css.accent}88` }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-frost">{t.label}</span>
                    <span className="block truncate text-[11px] text-smoke">{t.blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Preview color themes"
        className="flex items-center gap-2 rounded-full border border-line bg-ink/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-frost shadow-2xl shadow-black/50 backdrop-blur transition-colors hover:border-gold/50"
      >
        <Palette size={16} className="text-gold" />
        Theme
      </button>
    </div>
  )
}
