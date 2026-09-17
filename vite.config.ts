import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png'],
      manifest: {
        name: '보조개샘ai클래스 수학 게임',
        short_name: '수학 보드게임',
        description: '초등 2학년 수학 보드게임 — 교실 전자칠판·태블릿용',
        start_url: '.',
        scope: './',
        display: 'standalone',
        background_color: '#e8fbfb',
        theme_color: '#0f6f70',
        lang: 'ko',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // 문항이 모두 코드 안에 들어 있어 번들이 큽니다. 워크박스는
        // 기본으로 2 MiB가 넘는 파일을 프리캐시에서 빼는데, 그러면
        // 교실에서 인터넷이 끊겼을 때 앱이 열리지 않습니다. 오프라인이
        // 이 앱의 쓰임새라 한도를 올려 둡니다.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        // KaTeX의 수학 글자 파일입니다. 분수는 KaTeX가 그리되 글자체는
        // 앱 것을 쓰므로(styles.css) 이 파일들은 한 번도 내려받지
        // 않습니다. 오프라인 저장에까지 넣으면 교실에서 쓰지도 않을
        // 1 MB를 받아 두는 셈이라 뺍니다.
        globIgnores: ['**/KaTeX_*'],
        // Everything the game needs (data, visuals, sounds) is bundled client-side,
        // so caching the app shell is enough to make it fully playable offline.
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
