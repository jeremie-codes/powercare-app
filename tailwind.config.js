/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './app/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0fade8',
      },
      fontFamily: {
        montserrat: 'Montserrat-Regular',
        'montserrat-medium': 'Montserrat-Medium',
        'montserrat-semibold': 'Montserrat-SemiBold',
        'montserrat-bold': 'Montserrat-Bold',
      },
    },
  },
  plugins: [],
};
