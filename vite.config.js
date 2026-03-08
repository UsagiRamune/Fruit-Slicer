import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),      // หน้าเกมหลัก
        admin: resolve(__dirname, 'admin.html'),    // หน้า Dashboard ที่มึงต้องการ
      },
    },
  },
});