import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Загружаем env переменные
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    // Base path для GitHub Pages или подпапки
    base: mode === 'production' ? '/PhD/' : '/',

    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      })
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@utils': resolve(__dirname, './src/utils'),
        '@styles': resolve(__dirname, './src/styles'),
        '@server': resolve(__dirname, '../server/src'),
        '@shared': resolve(__dirname, '../shared')
      }
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'chart-vendor': ['chart.js', 'vue-chartjs'],
            'ui-vendor': ['element-plus', 'axios']
          }
        }
      }
    },

    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      open: true,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    preview: {
      port: 4173,
      host: true
    },

    // Оптимизация для продакшена
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'axios']
    }
  };
});