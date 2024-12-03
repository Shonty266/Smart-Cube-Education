/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'button-border': 'linear-gradient(90deg, #FFE6E6 10%, #E1AFD1 20%, #AD88C6 30%, #7469B6 40%, #010101 50%)',

      },
      animation: {
        'spin-slow': 'spin 5s linear infinite',
      },  
    },
  },
  plugins: [],
}

