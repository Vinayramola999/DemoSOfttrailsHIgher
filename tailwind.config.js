// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'custom-gray': '#FAF9F6',
//         'custom-dark-gray': '#767676',
//         'custome-blue': '#005AE6',
//         'lightgray': '#F4F4F4',
//         'tableblue': '#005AE61A',
//         // 'custome-light-gray':'#B5B5B5'

//       },
//       scrollbar: {
//         none: 'none',
//       },
//     },

//   },
//   plugins: [],
// }


module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-gray': '#FAF9F6',
        'custom-dark-gray': '#767676',
        'custome-blue': '#005AE6',
        'lightgray': '#F4F4F4',
        'tableblue': '#005AE61A',
        'tabgray': '#BEBEBE',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}