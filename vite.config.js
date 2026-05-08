import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path
  base: './',
  
  // Server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2015'
  },
  
  // Asset handling
  assetsInclude: ['**/*.png', '**/*.wav'],
  
  // Preview configuration
  preview: {
    port: 4173,
    open: true
  },
  
  // Test configuration
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.js']
  }
});
