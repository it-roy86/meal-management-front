import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // vueDevTools()는 개발 서버(npm run dev)에서만 켜져요.
  // 페이지 우측 하단에 Vue 로고 아이콘이 뜨고, 거기서 컴포넌트 트리/상태를 볼 수 있어요.
  // (package.json엔 있었지만 여기 등록이 안 돼있어서 실제로는 꺼져있던 상태였어요.)
  plugins: [vue(), vueDevTools()],
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