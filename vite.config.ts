import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import {
  pagesToPrerender,
  renderPageHtml,
  renderRobotsTxt,
  renderSitemap,
} from "./src/portal/domain/staticHead"

/**
 * 建置後補上 SEO 需要的靜態檔案。
 *
 * Vite 用 esbuild 編譯自己的設定檔，所以這裡可以直接 import TypeScript 的
 * 路由表與 metadata——不必再寫一份 Node 版本，也就不會有第二份事實來源。
 *
 * Firebase Hosting 會先找真實檔案，找不到才套 `**` → /index.html 的 rewrite。
 * 因此 dist/littleexplorer/wiki/index.html 一存在，該網址就會拿到自己的
 * title 與 og 標籤，不需要先執行 JS。
 */
function seoStaticFiles(): Plugin {
  return {
    name: 'littlesteps-seo-static',
    apply: 'build',
    closeBundle() {
      const dist = join(process.cwd(), 'dist')
      const template = readFileSync(join(dist, 'index.html'), 'utf8')

      for (const { page, outDir } of pagesToPrerender()) {
        const target = join(dist, outDir, 'index.html')
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, renderPageHtml(template, page))
      }

      // 首頁本身也要換成自己的 head，否則它還是原始樣板。
      writeFileSync(join(dist, 'index.html'), renderPageHtml(template, 'home'))

      const today = new Date().toISOString().slice(0, 10)
      writeFileSync(join(dist, 'sitemap.xml'), renderSitemap(today))

      // robots.txt 也從路由表產生，而不是放在 public/ 手動維護：手寫的版本
      // 是 fail-open 的，新增一個需登入的頁面卻忘了補 Disallow，那一頁就會
      // 被爬進索引。
      writeFileSync(join(dist, 'robots.txt'), renderRobotsTxt())
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: { alias: { "~app": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'LittleSteps - 孕期到幼兒的育兒陪伴',
        short_name: 'LittleSteps',
        description: '從懷孕、新生兒到 1-3 歲幼兒，五個服務陪台灣爸媽走過每個階段',
        lang: 'zh-TW',
        theme_color: '#FDFBF7',
        background_color: '#FDFBF7',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            // Separate art, not the same file tagged twice: a launcher crops
            // maskable icons to a circle, which ate the corners of the `any`
            // icon. This one keeps the mark inside the safe zone.
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        // 全國哺乳室資料約 1.1 MB，預先快取會讓每個使用者在安裝 PWA 時就下載，
        // 即使從未開啟 BabyOasis。改為首次進入地圖時才取得並快取。
        globIgnores: ['**/data/nursingRooms.json'],
        runtimeCaching: [
          {
            urlPattern: /\/data\/nursingRooms\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'nursing-rooms-data',
              // 上游每半年更新一次，過期資料仍遠勝於空白地圖。
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      }
    }),
    // PWA 之後跑：它會產生 index.html 的最終樣貌，這裡才能拿到正確的樣板。
    seoStaticFiles()
  ],
  base: '/',
  server: {
    port: 5173,
    strictPort: true
  }
})
