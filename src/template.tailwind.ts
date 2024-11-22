export default `/** @type {import('tailwindcss').Config} */
// need install autoprefixer postcss tailwindcss -d
// vscode-message: don't forget import tailwind.css to your main file | i autoprefixer postcss tailwindcss -d
module.exports = {
  content: ['./src/**/*.{html,ts,tsx,vue,jsx,svelte,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
