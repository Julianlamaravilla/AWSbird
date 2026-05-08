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
    // es2020 supports static class fields natively, preventing esbuild from
    // wrapping classes in IIFEs with const bindings that create TDZ issues.
    // All modern browsers (Chrome 80+, Firefox 75+, Safari 14+) support es2020.
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: false,
        format: 'es'
      }
    }
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
