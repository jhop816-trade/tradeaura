import { themes, DEFAULT_THEME_ID, type Theme } from '@/config/themes'

/**
 * Live 3D scene colors, read every frame / on material build by the three.js
 * components. Mutated synchronously by ThemeProvider before the Canvas remounts,
 * so a rebuilt scene always picks up the active theme.
 */
export const themeColors: Theme['three'] = { ...themes[DEFAULT_THEME_ID].three }

/** Apply a theme's CSS variables (UI) + 3D colors. Safe to call on the client. */
export function applyTheme(theme: Theme) {
  Object.assign(themeColors, theme.three)
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--color-gold', theme.css.accent)
  root.style.setProperty('--color-gold-dim', theme.css.accentDim)
  root.style.setProperty('--accent-rgb', theme.css.accentRgb)
}
