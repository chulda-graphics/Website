import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['three'] },
  optimizeDeps: { include: ['three', 'three/addons/loaders/GLTFLoader.js', 'three/addons/loaders/DRACOLoader.js'] },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', 'three/addons/loaders/GLTFLoader.js'],
          scroll: ['gsap', 'gsap/ScrollTrigger', 'gsap/ScrollSmoother'],
        },
      },
    },
  },
});
