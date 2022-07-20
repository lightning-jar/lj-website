/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,pug,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}
