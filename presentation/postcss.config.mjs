// For Tailwind CSS v4
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // No need for autoprefixer with Tailwind CSS v4 as it's built-in
  },
};

export default config;
