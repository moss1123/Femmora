import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `vite build --mode pages` serves the site from https://<user>.github.io/Femmora/
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/Femmora/' : '/',
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'],
          gsap: ['gsap', '@gsap/react'],
        },
      },
    },
  },
}))
