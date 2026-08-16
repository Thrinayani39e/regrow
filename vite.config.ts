import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://thrinayani39e.github.io/regrow/, not the domain
  // root, so asset URLs need the repo name as a base path.
  base: '/regrow/',
})
