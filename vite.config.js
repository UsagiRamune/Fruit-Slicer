import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        versionA: './versionA.html',
        versionB: './versionB.html'
      }
    }
  }
})