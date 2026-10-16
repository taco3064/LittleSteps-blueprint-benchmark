import { E2E_TEST_FILES } from './e2e/testFiles';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the end-to-end suite.
 *
 * See `docs/E2E_TEST_PLAN.md` for the reasoning behind every choice here and
 * `e2e/README.md` for how to run the suite.
 */

/**
 * The port the built app is previewed on.
 *
 * Overridable because `--strictPort` plus `reuseExistingServer` makes two
 * concurrent suites on one machine fight over a single server, and the symptoms
 * — `ERR_CONNECTION_REFUSED` part-way through a run, a lazy chunk failing to
 * load, the app rendering its error boundary — look exactly like product bugs.
 * CI gives every job its own container and needs no override.
 */
const PREVIEW_PORT = Number(process.env.E2E_PORT ?? 4173);

// The IPv4 literal, deliberately. `vite preview` without `--host` binds the
// hostname `localhost`, and in the CI container that resolves to `::1` first,
// so the server listened on IPv6 while this poller waited on IPv4 until it
// timed out. Both ends are pinned rather than left to the resolver.
const BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

/**
 * Dummy Firebase credentials for the built app.
 *
 * `src/platform/services/firebase` calls `initializeApp()` at module load, so with these
 * unset the SDK throws `auth/invalid-api-key` and the page renders blank —
 * there is no such thing as running this app with no Firebase configuration.
 * No child's record is ever requested: Phase 1 only visits public routes, and
 * both `useUserChildren` and `useFirebaseCollection` early-return on a null
 * user, so no database listener ever attaches. The two calls that do leave for
 * Google — the analytics web config, and the sign-in iframe Firebase Auth
 * loads proactively on a mobile user agent — are route-blocked instead, with
 * the reasoning in `e2e/fixtures/blockedHosts.ts`.
 *
 * Two traps, both of which cost an afternoon once:
 * - The SDK rejects an `apiKey` containing `:`, so the key below has none.
 * - `getDatabase()` without `VITE_FIREBASE_DATABASE_URL` falls back to
 *   `<projectId>-default-rtdb.firebaseio.com`, the us-central1 host, which is
 *   not where an `asia-southeast1` instance lives. Keep it set; both hosting
 *   workflows write it (the pull-request one only since #92).
 *
 * These are build-time values: Vite inlines `import.meta.env` when `webServer`
 * runs `vite build`, so they belong on `webServer.env`, not on `use`.
 */
const FIREBASE_E2E_ENV = {
  VITE_FIREBASE_API_KEY: 'AIzaSyE2eDummyKeyNoColonAllowedHere0000',
  VITE_FIREBASE_AUTH_DOMAIN: 'littlesteps-e2e.firebaseapp.com',
  VITE_FIREBASE_DATABASE_URL: 'https://littlesteps-e2e-default-rtdb.firebaseio.com',
  VITE_FIREBASE_PROJECT_ID: 'littlesteps-e2e',
  VITE_FIREBASE_STORAGE_BUCKET: 'littlesteps-e2e.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
  VITE_FIREBASE_MEASUREMENT_ID: 'G-E2E0000000',
  // The suite runs without App Check. Pinned empty rather than left out: Vite
  // merges the repo's `.env` under `process.env`, so a real site key in a
  // developer's `.env` would otherwise reach the E2E build.
  VITE_FIREBASE_APPCHECK_SITE_KEY: '',
};

/**
 * Mobile Chromium. Cross-browser is deferred until the suite is stable (plan
 * §4); the viewport is overridden per project because the two widths
 * `.claude/CLAUDE.md` mandates are the point of running the suite at all.
 */
const MOBILE_CHROMIUM = devices['Pixel 5'];

export default defineConfig({
  testDir: '.',
  testMatch: E2E_TEST_FILES.map(file => '**/' + file),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // No retries, in CI too (plan §8). A retry that turns a job green is
  // retrying into passing, and a suite that does it stops being a signal.
  retries: 0,

  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    // Evidence for humans on a failure, never an oracle (plan §2).
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'mobile-390',
      use: { ...MOBILE_CHROMIUM, viewport: { width: 390, height: 844 } },
    },
    {
      // 320px is the narrowest width CLAUDE.md asks for, and the width where a
      // grid or a chip row breaks first.
      name: 'mobile-320',
      use: { ...MOBILE_CHROMIUM, viewport: { width: 320, height: 844 } },
    },
  ],

  webServer: {
    // The production build, not the dev server (plan §4): the dev server
    // exercises neither the lazy-chunk split, nor the service worker, nor the
    // prerendered HTML, and three of the six gaps the suite exists for live
    // exactly there.
    //
    // `--host 127.0.0.1` is load-bearing. Without it `vite preview` binds the
    // name `localhost`, and in the CI container `/etc/hosts` maps that to `::1`
    // as well as to `127.0.0.1`, so the listener ends up on IPv6 only while
    // Playwright polls the IPv4 literal below until it times out. Binding the
    // literal keeps both ends off the resolver's ordering.
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PREVIEW_PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // A cold `vite build` is the whole of this budget; the preview server is up
    // in under a second afterwards.
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: FIREBASE_E2E_ENV,
  },
});
