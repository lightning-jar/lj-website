/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,pug,js,svelte,ts}'],
  safelist: [
    'left-0',
    'right-0',
    'rotate-180',
    'bg-maximumYellow'
  ],
  theme: {
    fontFamily: {
      'sans': ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      'serif': ['New York Medium', '-apple-system-ui-serif', 'ui-serif', 'DM Serif Display', 'serif']
    },
    extend: {
      colors: {
        oxfordBlue: 'hsl(217, 48%, 15%)',
        darkCornflowerBlue: 'hsl(217, 45%, 30%)',
        middleBlue: 'hsl(188, 55%, 64%)',
        androidGreen: 'hsla(71, 82%, 43%, 1.0)',
        yellowGreen: 'hsl(71, 69%, 70%)',
        titaniumYellow: 'hsl(58, 100%, 47%)',
        maximumYellow: 'hsl(64, 94%, 58%)',
        culturedGray: 'hsl(220, 20%, 97%)',
        offWhite: 'hsl(240, 33%, 99%)'
      }
    },
  },
  corePlugins: {
    aspectRatio:false,
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ],
}
