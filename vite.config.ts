import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
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
      },
      // Add proper handling for SPA routing
      port: 3000,
      host: true,
    },
    // Ensure proper handling of client-side routes in production build
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: !isProd,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', '@heroicons/react'],
            utils: ['clsx', 'tailwind-merge'],
          },
        },
      },
    },
    // Add base URL configuration
    base: '/',
  };
});