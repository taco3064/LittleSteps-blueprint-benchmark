import type { ConsoleMessage, Page } from '@playwright/test';
import { expect, test } from '../fixtures/test';
import { BLOCKED_HOSTS, isBlockedUrl } from '../fixtures/blockedHosts';
import { PUBLIC_ROUTES } from '../fixtures/routes';
import { PublicRoutePage } from '../pages/publicRoutePage';

/**
 * PWA-01…03 — the installable shell.
 *
 * A manifest that stopped being emitted, a service worker that no longer
 * registers, and an exception thrown on one route only are all invisible to a
 * component test and all invisible in a passing build. They need the built
 * output and a real browser, which is the plan's §1 row 4.
 */

test('PWA-01 @p1 the manifest is served, parses, and its icons exist', async ({
  request,
  baseURL,
}) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.status()).toBe(200);

  const manifest = await response.json();
  expect(manifest.name, 'the manifest has no name to install under').toBeTruthy();
  expect(manifest.start_url, 'the manifest has no start URL').toBeTruthy();
  expect(manifest.icons.length, 'the manifest declares no icons').toBeGreaterThan(0);

  // The icon list is the half of a manifest that fails silently: a launcher
  // shows a blank tile and the manifest still parses.
  for (const icon of manifest.icons) {
    const iconUrl = new URL(icon.src, `${baseURL}/`).toString();
    const iconResponse = await request.get(iconUrl);
    expect(iconResponse.status(), `the manifest points at a missing icon: ${icon.src}`).toBe(200);
  }
});

test('PWA-02 @p1 the service worker registers on the built app', async ({ page, baseURL }) => {
  const errors = collectPageErrors(page);

  await page.goto('/');

  // `vite-plugin-pwa` injects the registration itself, so nothing in `src/`
  // proves this works — only a built page in a real browser does. `ready`
  // resolves once a worker is activated and controlling this scope.
  const scope = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.scope;
  });

  expect(scope, 'the worker did not take the whole origin').toBe(`${baseURL}/`);
  expect(errors, 'registering the service worker logged an error').toEqual([]);
});

for (const route of PUBLIC_ROUTES) {
  test(`PWA-03 @p2 ${route} logs no uncaught errors`, async ({ page }) => {
    const routes = new PublicRoutePage(page);
    const errors = collectPageErrors(page);

    await routes.goto(route);
    await expect(routes.ready(route)).toBeVisible();

    expect(errors).toEqual([]);
  });
}

/**
 * Console errors and uncaught exceptions, minus the ones the harness causes
 * itself.
 *
 * Aborting a request logs an error, so every host in `BLOCKED_HOSTS` would
 * otherwise fail this case for a reason no parent will ever meet. The list is
 * imported rather than restated: a hard-coded allowlist that a new blocked
 * host outgrows turns this case red on a change that had nothing to do with
 * it.
 */
function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (isFromBlockedHost(message)) return;
    // The URL is what makes a failure readable: "failed to load resource"
    // names nothing on its own.
    errors.push(`console.error: ${message.text()} [${message.location().url}]`);
  });
  page.on('pageerror', (error) => {
    errors.push(`uncaught: ${error.message}`);
  });

  return errors;
}

function isFromBlockedHost(message: ConsoleMessage): boolean {
  // A blocked subresource reports the URL as the message's location; a
  // rejected `fetch` reports it inside the text instead.
  return (
    isBlockedUrl(message.location().url) ||
    BLOCKED_HOSTS.some((host) => message.text().includes(host))
  );
}
