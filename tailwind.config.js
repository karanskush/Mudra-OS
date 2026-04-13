/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand "Lush Forest" ───────────────────────────────────────────
        // Use `brand-*` everywhere instead of `emerald-*` or `green-*`
        // so the whole app stays in sync with the landing page palette.
        brand: {
          50:  '#CFFFDC',   // pale mint  — gradient text, chip highlights
          100: '#b8f5c8',
          200: '#96e8ac',
          300: '#68BA7F',   // mid accent — active icons, badge text
          400: '#4ea368',
          500: '#2E6F40',   // primary    — buttons, focus rings, glows
          600: '#265c35',
          700: '#1f4a2a',
          800: '#253D2C',
          900: '#1a2d1f',
          950: '#0D1F13',
        },

        // ── Surface backgrounds ───────────────────────────────────────────
        // Neutral near-black — no blue tint.  Matches landing page.
        surface: {
          base:    '#0B0C0E',   // page root background
          sidebar: '#0F1012',   // sidebar / nav panel
          raised:  '#111315',   // cards, panels
          hover:   '#161819',   // hover state on raised
        },

        // ── Legacy aliases (keep for backwards-compat) ────────────────────
        forest: {
          50:  '#CFFFDC',
          100: '#b8f5c8',
          200: '#96e8ac',
          300: '#68BA7F',
          400: '#4ea368',
          500: '#2E6F40',
          600: '#265c35',
          700: '#1f4a2a',
          800: '#253D2C',
          900: '#1a2d1f',
          950: '#0D1F13',
        },
        primary: {
          50: '#CFFFDC', 100: '#b8f5c8', 200: '#96e8ac',
          300: '#68BA7F', 400: '#4ea368', 500: '#2E6F40',
          600: '#265c35', 700: '#1f4a2a', 800: '#253D2C',
          900: '#1a2d1f', 950: '#0D1F13',
        },
        secondary: {
          50: '#CFFFDC', 100: '#b8f5c8', 200: '#96e8ac',
          300: '#68BA7F', 400: '#4ea368', 500: '#2E6F40',
          600: '#265c35', 700: '#1f4a2a', 800: '#253D2C',
          900: '#1a2d1f', 950: '#0D1F13',
        },
      },

      animation: {
        'fade-in':       'fadeIn 0.5s ease-in-out',
        'slide-up':      'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
