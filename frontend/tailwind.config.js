/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy (Industrial dark theme)
        'surface-bright': '#3a3939',
        'background': '#131313',
        'surface-dim': '#131313',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        'surface-variant': '#353534',

        // Primary - Electric Blue
        'primary': '#adc7ff',
        'primary-fixed': '#d8e2ff',
        'primary-fixed-dim': '#adc7ff',
        'primary-container': '#4a8eff',
        'on-primary': '#002e68',
        'on-primary-container': '#00285b',
        'on-primary-fixed': '#001a41',
        'on-primary-fixed-variant': '#004493',
        'inverse-primary': '#005bc0',
        'surface-tint': '#adc7ff',

        // Secondary - Neon Orange
        'secondary': '#ffb596',
        'secondary-fixed': '#ffdbcd',
        'secondary-fixed-dim': '#ffb596',
        'secondary-container': '#fe6500',
        'on-secondary': '#581e00',
        'on-secondary-container': '#541d00',
        'on-secondary-fixed': '#360f00',
        'on-secondary-fixed-variant': '#7c2e00',

        // Tertiary
        'tertiary': '#c8c6c5',
        'tertiary-fixed': '#e5e2e1',
        'tertiary-fixed-dim': '#c8c6c5',
        'tertiary-container': '#929090',
        'on-tertiary': '#303030',
        'on-tertiary-container': '#2a2a2a',
        'on-tertiary-fixed': '#1b1b1c',
        'on-tertiary-fixed-variant': '#474746',

        // On Surface
        'on-surface': '#e5e2e1',
        'on-background': '#e5e2e1',
        'inverse-surface': '#e5e2e1',
        'inverse-on-surface': '#313030',
        'surface-variant': '#353534',
        'on-surface-variant': '#c1c6d7',

        // Outline
        'outline': '#8b90a0',
        'outline-variant': '#414754',

        // Error
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
      },
      fontFamily: {
        'headline': ['var(--font-manrope)', 'var(--font-inter)', 'sans-serif'],
        'body': ['var(--font-inter)', 'var(--font-manrope)', 'sans-serif'],
        'label': ['var(--font-manrope)', 'var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0px',
        'lg': '0px',
        'xl': '0px',
        'full': '9999px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
