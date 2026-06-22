export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        purpleDeep: '#3B0A50',
        purpleDark: '#25002F',
        burgundy: '#8A1E4D',
        burgundyDark: '#5C1235',
        gold: '#D4AF37',
        goldLight: '#F4D77A',
        cream: '#FFF8EA',
        white: '#FFFFFF',
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        latin: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 24px 70px rgba(37, 0, 47, 0.18)',
        gold: '0 14px 38px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
}
