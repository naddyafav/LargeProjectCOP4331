import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/login':    'http://localhost:5050',
      '/register': 'http://localhost:5050',
      '/quiz':     'http://localhost:5050',
      '/friends':  'http://localhost:5050',
      '/password': 'http://localhost:5050',
    }
  }
})