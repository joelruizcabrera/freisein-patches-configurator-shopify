import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: './src/main.js',
      name: 'StickerConfigurator',
      fileName: 'sticker-configurator',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
