/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,pug,js,svelte,ts}'],
  safelist: [
    'left-0',
    'right-0',
    'rotate-180',
    'bg-maximumYellow',
    'opacity-100',
  ],
  theme: {

    extend: {
      colors: {
        oxfordBlue: 'hsl(217, 48%, 15%)',
        oxford: 'hsl(217, 48%, 15%)',
        oxfordLight: '#21355B',
        oxfordDark: 'hsla(217, 48%, 12%, 1.0)',
        oxfordBlueLight: '#21355B',
        darkCornflowerBlue: 'hsl(217, 45%, 30%)',
        cornflower: this.darkCornflowerBlue,
        cornflowerDark: 'hsl(217, 45%, 30%)',
        middleBlue: 'hsl(188, 55%, 64%)',
        androidGreen: 'hsla(71, 82%, 43%, 1.0)',
        yellowGreen: 'hsl(71, 69%, 70%)',
        titaniumYellow: 'hsl(58, 100%, 47%)',
        maximumYellow: 'hsl(64, 94%, 58%)',
        culturedGray: 'hsl(220, 20%, 97%)',
        cultured: 'hsl(220, 20%, 97%)',
        offWhite: 'hsl(240, 33%, 99%)'
      },
      fontFamily: {
        'sans': ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        'serif': ['New York Medium', '-apple-system-ui-serif', 'ui-serif', 'DM Serif Display', 'serif']
      },
    },
  },
  corePlugins: {
    aspectRatio:false,
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp')
  ],
}
