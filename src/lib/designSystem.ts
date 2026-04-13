/**
 * Design System — Single Source of Truth
 *
 * This file is the canonical reference for every color, surface, and
 * semantic token used across the app.  All pages MUST derive their
 * palette from these values so the UI stays consistent with the
 * Landing Page aesthetic.
 *
 * Palette: "Lush Forest" dark
 *   Background family  → near-black neutrals (no blue tint)
 *   Brand family       → forest green  (#2E6F40 → #68BA7F → #CFFFDC)
 *   Semantic           → amber (warn), red (danger), slate (text)
 */

// ─── Brand ────────────────────────────────────────────────────────────────────
export const brand = {
  /** Pale mint — used for gradient text highlights */
  50:  '#CFFFDC',
  100: '#b8f5c8',
  200: '#96e8ac',
  /** Mid accent — icon fills, active text, badges */
  300: '#68BA7F',
  400: '#4ea368',
  /** Primary brand — button bg, focus rings, glows */
  500: '#2E6F40',
  600: '#265c35',
  700: '#1f4a2a',
  800: '#253D2C',
  900: '#1a2d1f',
  950: '#0D1F13',
} as const;

// ─── Surface (backgrounds) ────────────────────────────────────────────────────
export const surface = {
  /** Page root — matches landing page */
  base:    '#0B0C0E',
  /** Sidebar / nav panel */
  sidebar: '#0F1012',
  /** Cards, table rows, raised panels */
  raised:  '#111315',
  /** Hover state for raised surfaces */
  hover:   '#161819',
  /** Modals / overlays */
  overlay: 'rgba(11,12,14,0.92)',
} as const;

// ─── Border ───────────────────────────────────────────────────────────────────
export const border = {
  subtle:  'rgba(255,255,255,0.06)',
  default: 'rgba(255,255,255,0.08)',
  strong:  'rgba(255,255,255,0.12)',
  brand:   `rgba(46,111,64,0.30)`,
  brandHover: `rgba(104,186,127,0.40)`,
} as const;

// ─── Glow / shadow ────────────────────────────────────────────────────────────
export const glow = {
  brand: '0 0 24px rgba(46,111,64,0.35)',
  brandStrong: '0 0 36px rgba(46,111,64,0.55)',
  brandSm: '0 0 12px rgba(46,111,64,0.25)',
} as const;

// ─── Semantic ─────────────────────────────────────────────────────────────────
export const semantic = {
  success: { text: '#68BA7F', bg: 'rgba(46,111,64,0.12)', border: 'rgba(104,186,127,0.25)' },
  warning: { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  danger:  { text: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
  info:    { text: '#68BA7F', bg: 'rgba(46,111,64,0.10)',  border: 'rgba(104,186,127,0.20)' },
} as const;

// ─── Gradient helpers ─────────────────────────────────────────────────────────
export const gradient = {
  brand:     'linear-gradient(135deg, #2E6F40, #68BA7F)',
  brandText: 'linear-gradient(95deg, #ffffff 0%, #CFFFDC 45%, #68BA7F 100%)',
  spotlight: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(46,111,64,0.22) 0%, transparent 70%)',
} as const;

// ─── Tailwind class shortcuts (use in className strings) ─────────────────────
/**
 * Pre-composed Tailwind class strings for common patterns.
 * Import and spread into className to guarantee brand-consistent styles.
 */
export const tw = {
  // Active sidebar nav item
  navActive:   'bg-brand-500/10 text-brand-300',
  navInactive: 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',

  // KPI / metric card
  card: 'bg-surface-raised rounded-2xl border border-white/[0.06] hover:border-white/[0.10] transition-all',

  // Status badges
  badge: {
    success: 'bg-brand-500/10 text-brand-300 border border-brand-500/25',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/25',
    danger:  'bg-red-500/10 text-red-300 border border-red-500/25',
    neutral: 'bg-white/5 text-slate-400 border border-white/10',
  },

  // Primary action button
  btnPrimary: 'bg-brand-500 hover:bg-brand-400 text-brand-50 font-semibold rounded-xl px-5 py-2.5 transition-all shadow-[0_0_20px_rgba(46,111,64,0.30)]',
  btnSecondary: 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl px-5 py-2.5 transition-all',
} as const;
