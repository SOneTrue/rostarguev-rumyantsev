import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ⚡️ ВАЖНО: добавь server.proxy для /api — иначе все /api/... запросы пойдут на фронт и вернётся index.html!
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      // Все запросы, начинающиеся с /api, отправляются на бэкенд (Django)
      '/api': 'http://localhost:8000', // <-- тут укажи порт Django (по умолчанию 8000)
      // Если у тебя Django живет на другом хосте или порту — поменяй тут!
    },
  },
})
