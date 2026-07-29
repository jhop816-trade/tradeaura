/**
 * ============================================================================
 * JUFADE — THEME OPTIONS
 * ============================================================================
 * Three complete looks. Each recolors both the UI accent and the 3D scene
 * lighting. Use the on-screen theme switcher (bottom-left) to preview them,
 * then set DEFAULT_THEME_ID below to lock in your favorite.
 *
 * To remove the switcher entirely once you've chosen, delete <ThemeSwitcher />
 * from app/layout.tsx.
 * ============================================================================
 */

export type ThemeId = 'gold' | 'blood' | 'ice'

export type Theme = {
  id: ThemeId
  label: string
  blurb: string
  /** CSS accent driving every UI element (buttons, kickers, glows, stars…). */
  css: { accent: string; accentDim: string; accentRgb: string }
  /** Colors fed into the three.js scene lighting + materials. */
  three: {
    keyLight: string
    backLight: string
    rimNeutral: string
    led: string
    ledBase: string
    particles: string
    envRim: string
    envFill: string
    fallbackGlow: string
  }
}

export const themes: Record<ThemeId, Theme> = {
  gold: {
    id: 'gold',
    label: 'Gold Reaper',
    blurb: 'Warm gold — matches your logo',
    css: { accent: '#e8b23a', accentDim: '#8a6a1e', accentRgb: '232 178 58' },
    three: {
      keyLight: '#ffb14a',
      backLight: '#e8951e',
      rimNeutral: '#cdd6e4',
      led: '#ffb43a',
      ledBase: '#241a08',
      particles: '#ffcf6b',
      envRim: '#ffb14a',
      envFill: '#8a6a1e',
      fallbackGlow: '#e8b23a',
    },
  },
  blood: {
    id: 'blood',
    label: 'Blood',
    blurb: 'Deep barber-pole crimson',
    css: { accent: '#e23b3b', accentDim: '#7a1518', accentRgb: '226 59 59' },
    three: {
      keyLight: '#ff5a52',
      backLight: '#c81e2a',
      rimNeutral: '#cdd6e4',
      led: '#ff3b47',
      ledBase: '#240709',
      particles: '#ff8a7a',
      envRim: '#ff5a52',
      envFill: '#7a1518',
      fallbackGlow: '#e23b3b',
    },
  },
  ice: {
    id: 'ice',
    label: 'Ice Chrome',
    blurb: 'Cold electric blue, Apple-style',
    css: { accent: '#4d8dff', accentDim: '#2f5fb3', accentRgb: '77 141 255' },
    three: {
      keyLight: '#6ea8ff',
      backLight: '#3f79e6',
      rimNeutral: '#cdd6e4',
      led: '#4d8dff',
      ledBase: '#0a1524',
      particles: '#8fc0ff',
      envRim: '#4d8dff',
      envFill: '#2f5fb3',
      fallbackGlow: '#4d8dff',
    },
  },
}

/** The look the site ships with (used for SSR + first paint). */
export const DEFAULT_THEME_ID: ThemeId = 'gold'
