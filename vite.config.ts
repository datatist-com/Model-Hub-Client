import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf('node_modules') === -1) {
            return undefined;
          }

          if (id.indexOf('/react/') !== -1 || id.indexOf('/react-dom/') !== -1 || id.indexOf('/scheduler/') !== -1) {
            return 'vendor-react';
          }

          if (id.indexOf('/react-router/') !== -1 || id.indexOf('/react-router-dom/') !== -1) {
            return 'vendor-router';
          }

          if (id.indexOf('/recharts/') !== -1 || id.indexOf('/d3-') !== -1 || id.indexOf('/victory-vendor/') !== -1) {
            return 'vendor-charts';
          }

          if (id.indexOf('/i18next/') !== -1 || id.indexOf('/react-i18next/') !== -1) {
            return 'vendor-i18n';
          }

          return undefined;
        }
      }
    }
  }
});
