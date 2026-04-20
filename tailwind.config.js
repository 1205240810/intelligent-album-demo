/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 30px 90px rgba(9, 19, 39, 0.32)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top left, rgba(64, 221, 197, 0.18), transparent 34%), radial-gradient(circle at 85% 15%, rgba(255, 181, 71, 0.2), transparent 28%), linear-gradient(135deg, rgba(10, 25, 41, 0.92), rgba(12, 30, 48, 0.78))',
      },
      animation: {
        'float-in': 'float-in 0.7s ease-out both',
      },
      keyframes: {
        'float-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(18px) scale(0.98)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};
