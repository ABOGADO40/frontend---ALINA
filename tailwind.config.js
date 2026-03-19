/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════════════
        // ALINA Design System — Luminous Forensic Architecture
        // Every hue derived from the geometric "A" logo:
        //   Deep Teal #0D6B6E  |  Turquoise #2EC4B6  |  Charcoal #2C3E50
        // ═══════════════════════════════════════════════════════════

        // Primary: Deep Teal (logo's left face — the dominant brand hue)
        // 600 = #0D6B6E, the exact logo color
        alina: {
          50:  '#EBF5F5',
          100: '#CEE9E9',
          200: '#A0DBDA',
          300: '#62C4C1',
          400: '#2DABA9',
          500: '#178B89',
          600: '#0D6B6E',  // LOGO PRIMARY
          700: '#0A5456',
          800: '#073D3E',
          900: '#052A2B',
          950: '#031919',
        },

        // Cyan/Turquoise accent (logo's glowing circuit traces)
        // 500 = #2EC4B6, the exact trace color
        cyan: {
          50:  '#EDFAF8',
          100: '#D2F3EE',
          200: '#A9E5DC',
          300: '#72D4C6',
          400: '#45C9B9',
          500: '#2EC4B6',  // LOGO CIRCUIT TRACE
          600: '#219E92',
          700: '#1D7D74',
          800: '#1C6359',
          900: '#1A524A',
          950: '#0D3330',
        },

        // Surface neutrals: tinted with logo's charcoal-slate #2C3E50
        // Inverted scale: 900 = lightest (page bg), 50 = darkest (headings)
        surface: {
          50:  '#172A3A',  // Deepest text
          100: '#2C3E50',  // Heading text (LOGO CHARCOAL)
          200: '#3A5068',  // Strong text
          300: '#4E6680',  // Body text
          400: '#6A8198',  // Secondary text
          500: '#8DA0B3',  // Placeholder, muted icons
          600: '#BDC9D4',  // Input borders
          700: '#DFE6EC',  // Borders, dividers
          800: '#FFFFFF',  // Card/panel background
          900: '#F4F8FA',  // Page background
          950: '#EDF2F5',  // Deep page background
        },

        // Accent warm (CTAs, warnings)
        accent: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },

        // Status: Success
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },

        // Status: Danger
        danger: {
          50:  '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
          950: '#4C0519',
        },
      },

      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Outfit"', 'system-ui', 'sans-serif'],
        body: ['"Source Sans 3"', '"DM Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Source Sans 3"', '"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      boxShadow: {
        // Logo-teal glows
        'glow-teal': '0 0 20px rgba(13, 107, 110, 0.2), 0 0 40px rgba(13, 107, 110, 0.06)',
        'glow-teal-lg': '0 0 40px rgba(13, 107, 110, 0.18), 0 0 80px rgba(13, 107, 110, 0.06)',
        'glow-teal-intense': '0 0 30px rgba(13, 107, 110, 0.35), 0 0 60px rgba(46, 196, 182, 0.1)',
        // Logo-cyan glows
        'glow-cyan': '0 0 20px rgba(46, 196, 182, 0.2), 0 0 40px rgba(46, 196, 182, 0.06)',
        'glow-accent': '0 0 20px rgba(249, 115, 22, 0.2)',
        'glow-danger': '0 0 20px rgba(244, 63, 94, 0.2)',
        // Layered elevation shadows (charcoal tinted)
        'soft': '0 1px 8px rgba(44, 62, 80, 0.04), 0 4px 16px rgba(44, 62, 80, 0.03)',
        'soft-lg': '0 2px 12px rgba(44, 62, 80, 0.05), 0 8px 32px rgba(44, 62, 80, 0.04)',
        'card': '0 1px 3px rgba(44, 62, 80, 0.04), 0 6px 24px rgba(44, 62, 80, 0.03), 0 0 0 1px rgba(13, 107, 110, 0.03)',
        'card-hover': '0 4px 12px rgba(44, 62, 80, 0.06), 0 12px 40px rgba(44, 62, 80, 0.05), 0 0 16px rgba(13, 107, 110, 0.06)',
        'float': '0 12px 48px rgba(44, 62, 80, 0.1), 0 4px 16px rgba(44, 62, 80, 0.04)',
        'float-lg': '0 20px 60px rgba(44, 62, 80, 0.12), 0 8px 24px rgba(44, 62, 80, 0.06)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(13, 107, 110, 0.03)',
        'panel': '0 1px 3px rgba(44, 62, 80, 0.04), 0 4px 20px rgba(44, 62, 80, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        // Prismatic border shadow (simulates gradient border glow)
        'prismatic': '0 0 0 1px rgba(13, 107, 110, 0.08), 0 4px 20px rgba(13, 107, 110, 0.06), 0 8px 32px rgba(44, 62, 80, 0.04)',
        'prismatic-hover': '0 0 0 1px rgba(13, 107, 110, 0.15), 0 8px 32px rgba(13, 107, 110, 0.1), 0 12px 48px rgba(44, 62, 80, 0.06)',
        // Button shadows
        'btn': '0 2px 8px rgba(13, 107, 110, 0.15), 0 4px 16px rgba(13, 107, 110, 0.08)',
        'btn-hover': '0 4px 16px rgba(13, 107, 110, 0.2), 0 8px 24px rgba(13, 107, 110, 0.1)',
        // Stat card highlight
        'stat': '0 2px 12px rgba(44, 62, 80, 0.04), 0 8px 32px rgba(44, 62, 80, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      },

      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Logo gradient: deep teal -> bright turquoise
        'gradient-alina': 'linear-gradient(135deg, #0D6B6E 0%, #2EC4B6 100%)',
        // Subtle teal gradient (for buttons, accents)
        'gradient-alina-soft': 'linear-gradient(135deg, #178B89 0%, #2DABA9 50%, #2EC4B6 100%)',
        // Dark teal gradient
        'gradient-alina-dark': 'linear-gradient(135deg, #073D3E 0%, #0D6B6E 100%)',
        // Teal -> charcoal (mirrors logo's left-to-right face gradient)
        'gradient-brand': 'linear-gradient(135deg, #0D6B6E 0%, #2C3E50 100%)',
        // Light surface gradient
        'gradient-surface': 'linear-gradient(180deg, #F4F8FA 0%, #FFFFFF 100%)',
        // Warm accent gradient
        'gradient-warm': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
        // Page background: subtle teal-tinted gradient
        'gradient-page': 'linear-gradient(170deg, #F4F8FA 0%, #EDF6F6 35%, #F4F8FA 65%, #F0F4F8 100%)',
        // Hero section: rich layered mesh
        'mesh-hero': 'radial-gradient(ellipse at 20% 50%, rgba(13, 107, 110, 0.06) 0px, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(46, 196, 182, 0.05) 0px, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(44, 62, 80, 0.03) 0px, transparent 55%), radial-gradient(ellipse at 10% 10%, rgba(46, 196, 182, 0.04) 0px, transparent 40%)',
        // Dashboard mesh
        'mesh-dash': 'radial-gradient(ellipse at 15% 30%, rgba(13, 107, 110, 0.05) 0px, transparent 50%), radial-gradient(ellipse at 85% 60%, rgba(46, 196, 182, 0.04) 0px, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(44, 62, 80, 0.02) 0px, transparent 50%)',
        // Sidebar gradient
        'gradient-sidebar': 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFB 50%, #F4F8FA 100%)',
        // Navbar gradient (frosted)
        'gradient-navbar': 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(244,248,250,0.9) 100%)',
        // Card accent line
        'gradient-accent-line': 'linear-gradient(90deg, #0D6B6E 0%, #2EC4B6 50%, #0D6B6E 100%)',
        // Circuit pattern SVG
        'circuit-pattern': `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40h25M55 40h25M40 0v25M40 55v25' stroke='%230D6B6E' stroke-width='0.5' opacity='0.07' fill='none'/%3E%3Cpath d='M25 40l15-15M40 25l15 15' stroke='%232EC4B6' stroke-width='0.4' opacity='0.05' fill='none'/%3E%3Ccircle cx='40' cy='40' r='2.5' fill='%230D6B6E' opacity='0.08'/%3E%3Ccircle cx='25' cy='40' r='1.5' fill='%232EC4B6' opacity='0.1'/%3E%3Ccircle cx='55' cy='40' r='1.5' fill='%232EC4B6' opacity='0.1'/%3E%3Ccircle cx='40' cy='25' r='1.5' fill='%232EC4B6' opacity='0.1'/%3E%3Ccircle cx='40' cy='55' r='1.5' fill='%232EC4B6' opacity='0.1'/%3E%3Ccircle cx='0' cy='0' r='1' fill='%230D6B6E' opacity='0.05'/%3E%3Ccircle cx='80' cy='0' r='1' fill='%230D6B6E' opacity='0.05'/%3E%3Ccircle cx='0' cy='80' r='1' fill='%230D6B6E' opacity='0.05'/%3E%3Ccircle cx='80' cy='80' r='1' fill='%230D6B6E' opacity='0.05'/%3E%3C/svg%3E")`,
        // Hex dot pattern (forensic DNA-like)
        'hex-pattern': `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%230D6B6E' fill-opacity='0.04'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },

      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
        'circuit-trace': 'circuitTrace 3s ease-in-out infinite',
        'node-pulse': 'nodePulse 2s ease-in-out infinite',
        'border-flow': 'borderFlow 4s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(13, 107, 110, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(13, 107, 110, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        circuitTrace: {
          '0%': { strokeDashoffset: '100' },
          '50%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-100' },
        },
        nodePulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
