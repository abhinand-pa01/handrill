/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          dark: '#1E3A8A',
          teal: '#14B8A6',
        },
        surface: '#FFFFFF',
        bg: '#F1F5F9',
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#94A3B8',
        border: '#E2E8F0',
        status: {
          pending: '#94A3B8',
          assigned: '#3B82F6',
          inprogress: '#F59E0B',
          completed: '#10B981',
          cancelled: '#EF4444',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
        nav: '0 -1px 0 #E2E8F0',
      },
    },
  },
  plugins: [],
}
