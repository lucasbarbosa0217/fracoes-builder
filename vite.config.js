import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Enable JSX fast refresh
      fastRefresh: true
    })
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    sourcemap: false
  },
  server: {
    port: 3000,
    middlewareMode: false
  },
  // Cache busting for better performance
  base: '/',
  resolve: {
    alias: {}
  }
})
