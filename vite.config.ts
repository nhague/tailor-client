import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'], // Include assets from public
      manifest: {
        // Assuming manifest.json is in the public directory
        // VitePWA will automatically use public/manifest.json if found
        // You can explicitly define it here if needed, or customize further
        name: 'Amorn Customer App', // Example name, adjust if needed
        short_name: 'Amorn', // Example short_name
        description: 'Customer management application for Amorn', // Example description
        theme_color: '#ffffff', // Example theme color
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      // Optional: configure workbox options if needed
      // workbox: {
      //   globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      // }
    }),
  ],
  server: {
    port: 3000, // Keep the port consistent if desired
    open: true, // Automatically open in browser
  },
  build: {
    outDir: 'build', // Specify the output directory for the build
    rollupOptions: {
      external: [],
    },
  },
});