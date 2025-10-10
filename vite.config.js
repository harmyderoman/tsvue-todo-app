import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // Add other configurations as needed, e.g., aliases
  resolve: {
    alias: {
      '@': '/src', // Example alias
    },
  },
});