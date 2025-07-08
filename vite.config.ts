import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@heroicons/react/24/outline', '@heroicons/react/24/solid'],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/grpc': {
        target: process.env.VITE_GRPC_URL || 'http://localhost:50051',
        changeOrigin: true,
        secure: false,
      }
    },
    port: 3000,
    host: true,
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    allowedHosts: [
      'healthcheck.railway.app', 
      'www.mudraos.xyz',
      'localhost', 
      '.railway.app',
      'backend-api-production-2efe.up.railway.app',
      'grpc-api-production.up.railway.app'
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    // Ensure source maps for better debugging
    sourcemap: true,
  },
  base: '/',
});