/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta white-label: cada color resuelve a una CSS variable que
        // se inyecta en runtime desde tienda_config. Si no esta seteada,
        // cae al valor por defecto que replica la paleta Amanda Clothing.
        amanda: {
          black: 'var(--color-primario, #0a0a0a)',
          white: 'var(--color-fondo, #fafafa)',
          nude: 'var(--color-acento, #c9a882)',
          nude2: 'var(--color-acento-claro, #e8d5c0)',
          gray: 'var(--color-texto-suave, #8a8a8a)',
          lightgray: 'var(--color-gris-claro, #f2f2f2)',
        },
        // Alias semanticos (preferidos para codigo nuevo)
        brand: {
          primary: 'var(--color-primario, #0a0a0a)',
          background: 'var(--color-fondo, #fafafa)',
          accent: 'var(--color-acento, #c9a882)',
          'accent-soft': 'var(--color-acento-claro, #e8d5c0)',
          muted: 'var(--color-texto-suave, #8a8a8a)',
          subtle: 'var(--color-gris-claro, #f2f2f2)',
        },
      },
      fontFamily: {
        serif: ['var(--font-titulo)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['var(--font-cuerpo)', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
};
