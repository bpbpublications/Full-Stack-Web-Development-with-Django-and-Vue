import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@stores': path.resolve(__dirname, 'src/stores'),
    },
  },
})
