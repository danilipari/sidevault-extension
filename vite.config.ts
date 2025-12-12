import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest }),
  ],
  build: {
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174
    }
  },
})
