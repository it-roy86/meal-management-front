import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // jsconfig.json의 "@/*" 경로와 맞춰서 @ 를 src/ 로 연결해요.
    // (예: import api from '@/api/axios')
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // 로컬 개발 시 /api/* → localhost:8080으로 프록시
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})