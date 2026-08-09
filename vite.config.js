import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three-core'
          if (id.includes('node_modules/@react-three') || id.includes('node_modules/three-stdlib')) return 'r3f-vendor'
          if (id.includes('node_modules/gsap')) return 'motion-vendor'
          if (id.includes('node_modules/react')) return 'react-vendor'
        },
      },
    },
  },
})
