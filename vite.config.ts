import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // scripts/prerender-meta.mjs lo lee para precargar el chunk de cada página y luego lo borra.
  build: { manifest: true },
})
