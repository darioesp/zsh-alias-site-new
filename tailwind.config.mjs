/** @type {import('tailwindcss').Config} */
import animations from '@midudev/tailwind-animations'
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sixtyfour: ['Sixtyfour', 'sans-serif'],
      },
      animation: {
        wave: 'wave 1000ms infinite both',
      },
    },
  },
  plugins: [animations],
  safeList: ['animate-fade-in'],
}
