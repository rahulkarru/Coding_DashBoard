import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🛑 CRITICAL FIX: Base URL for GitHub Pages
  // Your GitHub Pages URL is typically: https://<username>.github.io/<repo-name>/
  // Assuming your repository name is 'unified-cp-dashboard'
  base: '/unified-cp-dashboard/', 
});