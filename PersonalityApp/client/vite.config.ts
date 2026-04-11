import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/login':    'http://104.236.41.135:5050',
      '/register': 'http://104.236.41.135:5050',
      '/quiz':     'http://104.236.41.135:5050',
      '/friends':  'http://104.236.41.135:5050',
      '/password': 'http://104.236.41.135:5050',
    }
  }
})