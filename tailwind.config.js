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

        // ── Surface backgrounds (light theme) ────────────────────────────
        surface: {
          DEFAULT: '#F8FAFC',   // page root / subtle bg
          base:    '#F8FAFC',   // page root background
          sidebar: '#FFFFFF',   // sidebar / nav panel
          raised:  '#FFFFFF',   // cards, panels
          hover:   '#F1F5F9',   // hover state on raised
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
        // ── Stitch landing page tokens ────────────────────────────────────
        // DEFAULT makes `bg-primary` / `text-primary` use the flat value;
        // numbered shades (bg-primary-500 etc.) still work for inner pages.
        primary: {
          DEFAULT: '#0A1128',
          50: '#CFFFDC', 100: '#b8f5c8', 200: '#96e8ac',
          300: '#68BA7F', 400: '#4ea368', 500: '#2E6F40',
          600: '#265c35', 700: '#1f4a2a', 800: '#253D2C',
          900: '#1a2d1f', 950: '#0D1F13',
        },
        secondary: {
          DEFAULT: '#006d43',
          50: '#CFFFDC', 100: '#b8f5c8', 200: '#96e8ac',
          300: '#68BA7F', 400: '#4ea368', 500: '#2E6F40',
          600: '#265c35', 700: '#1f4a2a', 800: '#253D2C',
          900: '#1a2d1f', 950: '#0D1F13',
        },
        accent: '#00FF94',
        'surface-dark': '#050914',
        'on-surface': '#0F172A',
        'outline-variant': '#E2E8F0',
      },

      boxShadow: {
        premium: '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        glow: '0 0 20px rgba(0, 255, 148, 0.2)',
      },

      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
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
