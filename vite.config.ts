import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function productionChunk(id: string): string | undefined {
  const moduleId = id.replace(/\\/g, '/');
  if (!moduleId.includes('/node_modules/')) return undefined;

  if (
    moduleId.includes('/node_modules/react/') ||
    moduleId.includes('/node_modules/react-dom/') ||
    moduleId.includes('/node_modules/scheduler/')
  ) return 'react-vendor';

  if (
    moduleId.includes('/node_modules/@firebase/firestore/') ||
    moduleId.includes('/node_modules/firebase/firestore')
  ) return 'firebase-firestore';

  if (
    moduleId.includes('/node_modules/@firebase/auth/') ||
    moduleId.includes('/node_modules/firebase/auth')
  ) return 'firebase-auth';

  if (
    moduleId.includes('/node_modules/@firebase/storage/') ||
    moduleId.includes('/node_modules/firebase/storage')
  ) return 'firebase-storage';

  if (
    moduleId.includes('/node_modules/@firebase/') ||
    moduleId.includes('/node_modules/firebase/')
  ) return 'firebase-core';

  if (moduleId.includes('/node_modules/lucide-react/')) return 'icons';
  if (moduleId.includes('/node_modules/motion/')) return 'motion-vendor';
  if (moduleId.includes('/node_modules/@google/genai/')) return 'google-ai';

  return undefined;
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          jobs: path.resolve(__dirname, 'jobs/index.html'),
          admin: path.resolve(__dirname, 'admin/index.html'),
        },
        output: {
          manualChunks: productionChunk,
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
