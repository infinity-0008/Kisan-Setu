import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'किसान सेतु - Kisan Setu',
        short_name: 'किसान सेतु',
        description: 'डिजिटल कृषि एवं योजना सहायता केंद्र — AgriStack आधारित किसान पोर्टल',
        theme_color: '#006837',
        background_color: '#F8F9FA',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'hi',
        categories: ['government', 'agriculture', 'productivity'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'सरकारी योजनाएँ',
            short_name: 'योजनाएँ',
            description: 'सरकारी योजनाओं की जाँच करें',
            url: '/schemes',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'फसल बेचें',
            short_name: 'फसल बेचें',
            description: 'मंडी भाव देखें और फसल बेचें',
            url: '/crops',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache API responses for offline fallback
            urlPattern: /^\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
