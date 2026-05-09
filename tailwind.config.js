/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        attack: '#c0392b',
        skill: '#27ae60',
        power: '#8e44ad',
        gold: '#f1c40f',
      },
    },
  },
  plugins: [],
}

