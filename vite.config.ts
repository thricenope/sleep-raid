import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sleep-raid/',
  plugins: [react()],
  server: { port: 5192, host: true },
})
