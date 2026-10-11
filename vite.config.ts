import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // относительные пути: работает из любой папки и офлайн
  plugins: [react()],
})
