import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    // Critical for HMR in Docker
    watch: {
      usePolling: true,  // Use polling for file changes (required for Docker on Windows)
      interval: 1000,    // Check for changes every second
    },
    hmr: {
      port: 5173,       // Use same port for HMR
      host: 'localhost' // Explicit HMR host
    },
    // Ensure the server is accessible from the host
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize for Docker development
  optimizeDeps: {
    // Pre-bundle dependencies to avoid issues with Docker volumes
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
