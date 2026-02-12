/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tech-blue': '#0066FF',
        'tech-green': '#00D9A3',
        'tech-light': '#F8FAFC',
        'tech-purple': '#7C3AED',
      },
      backgroundImage: {
        'gradient-tech': 'linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 50%, #ECFDF5 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.9) 100%)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#0066FF',
          'secondary': '#00D9A3',
          'accent': '#7C3AED',
          'neutral': '#1E293B',
          'base-100': '#FFFFFF',
          'base-200': '#F8FAFC',
          'base-300': '#E2E8F0',
          'info': '#0284C7',
          'success': '#16A34A',
          'warning': '#EA580C',
          'error': '#DC2626',
        },
      },
      'lofi',
    ],
    logs: false,
  },
  plugins: [require('daisyui')],
}
