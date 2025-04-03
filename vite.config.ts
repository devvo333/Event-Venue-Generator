import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Event-Venue-Generator/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@canvas': path.resolve(__dirname, './src/canvas'),
      '@uploads': path.resolve(__dirname, './src/uploads'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@profiles': path.resolve(__dirname, './src/profiles'),
      '@dashboard': path.resolve(__dirname, './src/dashboard'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@data': path.resolve(__dirname, './src/data'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@config': path.resolve(__dirname, './src/config'),
      '@auth': path.resolve(__dirname, './src/auth')
    }
  }
}) 