import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// 日期邏輯改用本地時區的日曆日（toLocalDateKey），行為因此隨時區而異。
// 這個 app 只服務台灣，把測試釘在 Asia/Taipei，才不會在 UTC 的 CI 上
// 得到與實際使用者不同的結果。必須在載入 defineConfig 之前設定。
process.env.TZ = 'Asia/Taipei';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './test/setup',
    css: false,
    // e2e/ 的 *.spec.ts 是 Playwright 的案例，跑在真的瀏覽器裡。Vitest 預設會
    // 把整個 repo 的 *.spec.ts 都收進來，收到的當下就會因為找不到 Playwright
    // 的 test fixture 而失敗。
    // `**/` rather than a root-anchored path: an agent worktree under
    // `.claude/worktrees/` is a second copy of this repo, and without the
    // wildcard Vitest collects its Playwright specs too — 465 files and 642
    // failures that say nothing about the code under test.
    exclude: [...configDefaults.exclude, '**/e2e/**', '**/.claude/worktrees/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~app': path.resolve(__dirname, './src'),
    },
  },
});
