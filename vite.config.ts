import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 900, // Increase the chunk size warning limit
    rollupOptions: {
      external: mode === 'production' ? ['minio'] : [],
      output: {
        manualChunks: {
          // Split the vendor code into separate chunks
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion'
          ]
        },
        globals: mode === 'production' ? {
          'minio': 'undefined'
        } : {}
      }
    }
  },
  optimizeDeps: {
    exclude: mode === 'production' ? ['minio'] : [],
  },
}));
