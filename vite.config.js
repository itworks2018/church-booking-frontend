// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'admin',          // <-- this "root" points to your frontend folder
  build: {
    outDir: '../dist'
  }
});