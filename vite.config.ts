import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE is set by the GitHub Pages workflow ("/glowmore-website/"); local dev serves from "/".
export default defineConfig({
  base: process.env.BASE || '/',
  plugins: [react()],
});
