import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Every other test mocks lib/firebase wholesale (see test/setup.ts). What is
 * under test here is the decision the module makes at load time, so each case
 * resets the module cache, changes the environment, and re-imports the real
 * module with importActual.
 *
 * The decision now has two steps: load the reCAPTCHA script, and only then
 * initialise App Check. The reason is a defect in `@firebase/app-check` 0.11.2
 * — its own loader sets `script.onload` and nothing else, so a client that
 * cannot fetch `https://www.google.com/recaptcha/api.js` waits on a promise
 * that never settles, and the database waits on that. These cases pin the two
 * outcomes that matter: a blocked script must cost the session its App Check
 * token and nothing more, and a loaded script must still produce exactly the
 * provider the console is configured for.
 *
 * `document.head.appendChild` is stubbed rather than left alone because
 * happy-dom refuses to fetch an external script and dispatches `error` on the
 * spot, so a connected element could never be driven to `load`. Stubbing it
 * captures the element the module built and leaves the outcome to the test.
 */
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

vi.mock('firebase/database', () => ({ getDatabase: vi.fn(() => ({})) }));

const RECAPTCHA_URL = 'https://www.google.com/recaptcha/api.js';

/** Every element the module appended to `<head>`, newest last. */
let appended: Element[] = [];

// The imports are dynamic because the module's decision happens at load time:
// a static import would run it once, before the first `stubEnv`, and every
// case would then observe the same one load.
async function loadFirebase() {
  vi.resetModules();
  await vi.importActual('./firebase');

  return vi.mocked(await import('firebase/app-check'));
}

/** The script tag the module built, or null when it built none. */
function recaptchaScript(): Element | null {
  return (
    appended.find((element) => element.getAttribute('src') === RECAPTCHA_URL) ?? null
  );
}

/**
 * Play out the browser's side of the script load.
 *
 * `load` also defines the global, because that is what the real script does
 * and what `initializeV3` checks for before touching its own loader.
 */
async function settleScript(outcome: 'load' | 'error'): Promise<void> {
  const script = recaptchaScript();

  expect(script, 'the module did not append the reCAPTCHA script').not.toBeNull();

  if (outcome === 'load') {
    window.grecaptcha = { ready: () => {} };
  }

  script?.dispatchEvent(new Event(outcome));
  await flushMicrotasks();
}

/** Two ticks: one for the load promise, one for the `then` that initialises. */
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('App Check gate', () => {
  beforeEach(() => {
    // `firebase/app-check` is mocked once for the whole suite (test/setup.ts),
    // so its call history outlives a case unless it is cleared here.
    vi.clearAllMocks();
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_FIREBASE_APPCHECK_DEBUG', '');
    appended = [];

    vi.spyOn(document.head, 'appendChild').mockImplementation(
      <T extends Node>(node: T): T => {
        if (node instanceof Element) {
          appended.push(node);
        }

        return node;
      },
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
    // A leftover global would make the next case skip the load entirely.
    delete window.grecaptcha;
  });

  it('skips App Check without a site key', async () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', '');

    const { initializeAppCheck } = await loadFirebase();

    await flushMicrotasks();

    expect(initializeAppCheck).not.toHaveBeenCalled();
    expect(recaptchaScript()).toBeNull();
  });

  it('starts App Check after reCAPTCHA loads', async () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', 'site-key-under-test');

    const { initializeAppCheck, ReCaptchaV3Provider } = await loadFirebase();

    // Before the script lands there is no provider to hand the SDK.
    expect(initializeAppCheck).not.toHaveBeenCalled();

    await settleScript('load');

    expect(initializeAppCheck).toHaveBeenCalledTimes(1);
    const [, options] = initializeAppCheck.mock.calls[0];

    expect(options.provider).toBeInstanceOf(ReCaptchaV3Provider);

    expect((options.provider as unknown as { siteKey: string }).siteKey).toBe(
      'site-key-under-test',
    );

    expect(options.isTokenAutoRefreshEnabled).toBe(true);
  });

  it('skips App Check when reCAPTCHA fails', async () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', 'site-key-under-test');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { initializeAppCheck } = await loadFirebase();

    await settleScript('error');

    // Initialising against a script that never arrived is the hang: the
    // provider's promise would never settle and the database would wait on it.
    expect(initializeAppCheck).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('gives up on the script after the timeout rather than waiting forever', async () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', 'site-key-under-test');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.useFakeTimers();

    const { initializeAppCheck } = await loadFirebase();

    // A blocked request does not always fail: some blockers leave it pending,
    // which is the case the SDK's own loader has no answer for.
    expect(initializeAppCheck).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(8000);

    expect(initializeAppCheck).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('reuses an existing reCAPTCHA script', async () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', 'site-key-under-test');
    window.grecaptcha = { ready: () => {} };

    const { initializeAppCheck } = await loadFirebase();

    await flushMicrotasks();

    expect(recaptchaScript()).toBeNull();
    expect(initializeAppCheck).toHaveBeenCalledTimes(1);
  });

  it('keeps the app alive when initializeAppCheck throws', async () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', 'site-key-under-test');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.doMock('firebase/app-check', () => ({
      initializeAppCheck: vi.fn(() => {
        throw new Error('boom');
      }),
      ReCaptchaV3Provider: class {},
    }));

    await expect(loadFirebase()).resolves.toBeDefined();
    await settleScript('load');

    expect(error).toHaveBeenCalledTimes(1);
    vi.doUnmock('firebase/app-check');
  });
});
