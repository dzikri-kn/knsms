/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Koding Next Brand Colors
        brand: {
          blue: '#49A5D7',
          'blue-soft': '#A6DEEF',
          pink: '#E8579B',
          'pink-mid': '#DA6F9D',
          'pink-soft': '#E9C5DE',
        },
        primary: {
          50: '#F0F8FC',
          100: '#DCF0F9',
          200: '#A6DEEF', // Soft Cyan Tint
          300: '#77BCE1',
          400: '#5CB1DC',
          500: '#49A5D7', // Official Primary Koding Next Blue/Cyan
          600: '#338CBF',
          700: '#25719D',
          800: '#1C577A',
          900: '#15425E',
        },
        pink: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#E9C5DE', // Soft Pink Tint
          300: '#DA6F9D', // Medium Pink Tint
          400: '#E15E9F',
          500: '#E8579B', // Official Primary Koding Next Pink/Magenta
          600: '#D23E84',
          700: '#B22769',
          800: '#8E1E53',
          900: '#6F1841',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        }
      },
      fontFamily: {
        sans: ['PT Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        brand: ['Ubuntu', 'sans-serif'],
        heading: ['Ubuntu', 'Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

