/**
 * MudraCore OS Design System
 * Single source of truth for all design tokens.
 * Mirrors tailwind.config.js theme.extend values.
 */

export const colors = {
  primary:        '#0A1128',   // deep navy — headings, buttons, dark bg
  accent:         '#00FF94',   // neon emerald — highlights, active states
  secondary:      '#006d43',   // forest green — labels, secondary text
  surface:        '#F8FAFC',   // off-white page background
  surfaceDark:    '#050914',   // near-black — dark sections
  white:          '#FFFFFF',
  onSurface:      '#0F172A',
  outlineVariant: '#E2E8F0',   // card borders, dividers

  text: {
    primary:   '#0A1128',
    secondary: '#475569',   // slate-600
    muted:     '#94A3B8',   // slate-400
    disabled:  '#CBD5E1',
    onDark:    '#F1F5F9',
  },

  state: {
    success: '#00FF94',
    warning: '#FBBF24',
    error:   '#EF4444',
    info:    '#38BDF8',
  },
} as const;

export const shadows = {
  premium: '0 10px 30px -10px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.02)',
  glow:    '0 0 20px rgba(0,255,148,0.2)',
  card:    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  lg:      '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.05)',
} as const;

export const radii = {
  sm:   '0.5rem',
  md:   '0.75rem',
  lg:   '1rem',
  xl:   '1.25rem',
  '2xl':'1.5rem',
  '3xl':'1.875rem',
  full: '9999px',
} as const;

export const typography = {
  fontFamily: 'Inter, sans-serif',
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700, black: 900 },
} as const;

/** Reusable Tailwind class strings */
export const cx = {
  card:        'bg-white border border-outline-variant rounded-2xl shadow-premium',
  cardSurface: 'bg-surface border border-outline-variant rounded-2xl hover:shadow-premium transition-all',
  iconBox:     'w-12 h-12 bg-surface rounded-xl flex items-center justify-center',
  btnPrimary:  'bg-primary text-white rounded-xl font-bold active:scale-95 transition-all hover:shadow-lg hover:shadow-primary/20',
  btnOutline:  'bg-white border border-outline-variant text-primary rounded-xl font-bold active:scale-95 transition-all hover:bg-slate-50',
  label:       'text-[0.75rem] font-black text-accent uppercase tracking-[0.3em]',
  heading:     'text-3xl font-black tracking-tight text-primary',
  body:        'text-slate-500 leading-relaxed',
  badge: {
    accent:  'bg-accent/10 border border-accent/20 text-secondary text-[0.7rem] font-black px-2 py-0.5 rounded-full',
    neutral: 'bg-slate-100 text-slate-600 text-[0.7rem] font-black px-2 py-0.5 rounded-full',
    blue:    'bg-blue-50 text-blue-600 text-[0.7rem] font-black px-2 py-0.5 rounded-full',
    amber:   'bg-amber-50 text-amber-700 text-[0.7rem] font-black px-2 py-0.5 rounded-full',
    red:     'bg-red-50 text-red-600 text-[0.7rem] font-black px-2 py-0.5 rounded-full',
    purple:  'bg-purple-50 text-purple-600 text-[0.7rem] font-black px-2 py-0.5 rounded-full',
  },
} as const;
