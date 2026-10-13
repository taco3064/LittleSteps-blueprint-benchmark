import { expect, test } from '../fixtures/test';
import { PUBLIC_ROUTES, currentPath, pathOf } from '../fixtures/routes';
import { HubPage } from '../pages/hubPage';
import { PublicRoutePage } from '../pages/publicRoutePage';
import { ServiceIntroPage } from '../pages/serviceIntroPage';
import { metaFor } from '../../src/domain/pageMeta';
import { SERVICE_ORDER } from '../../src/domain/serviceTheme';
import { ROUTE_PATH } from '../../src/domain/routes';

/**
 * NAV-01…07 — routing, deep links and lazy chunks.
 *
 * `ROUTE_PATH` is typed, and unit tests mount a page directly. Neither proves
 * that typing a path into the address bar boots the app on that route, that
 * the browser's back button restores the previous page, or that the dynamic
 * import behind it resolves. Only a real browser against the built app can.
 */

test('NAV-01 @p1 every public path boots on its own route', async ({ page }) => {
  const publicRoute = new PublicRoutePage(page);

  for (const route of PUBLIC_ROUTES) {
    await test.step(pathOf(route), async () => {
      await publicRoute.goto(route);

      // The oracle is `document.title`, which `useDocumentMeta` sets from
      // `pageMeta.ts` after hydration. That is the point: `vite preview`
      // serves the *root* `index.html` for an extensionless path, so the
      // prerendered title on the wire is the home page's for nine of these
      // ten routes. Only the running app can put the right one there, so
      // this asserts the app booted on this route rather than that a file
      // exists — the file is SEO-03's separate concern.
      await expect(page).toHaveTitle(metaFor(route).title);
      await expect(publicRoute.content(route)).toBeVisible();
      expect(currentPath(page.url()), 'the app moved the visitor off the URL they typed').toBe(
        pathOf(route),
      );
    });
  }
});

test('NAV-02 @p1 a deep link to a gated route keeps the URL it was given', async ({ page }) => {
  const intro = new ServiceIntroPage(page);

  await intro.goto('littlesteps/daily-log');

  // What the visitor is shown here is AUTH-01's case. This one asserts only
  // that the address bar still reads what they typed: the intro page renders
  // in place, so signing in lands them on the page they were going to.
  await expect(intro.signIn).toBeVisible();
  expect(currentPath(page.url())).toBe(ROUTE_PATH['littlesteps/daily-log']);
});

test('NAV-03 @p1 an unknown path renders the hub instead of a blank page', async ({ page }) => {
  const hub = new HubPage(page);
  const publicRoute = new PublicRoutePage(page);

  const thrown: Error[] = [];
  page.on('pageerror', (error) => thrown.push(error));

  for (const unknown of ['/nope', '/littlesteps/nope']) {
    await test.step(unknown, async () => {
      const response = await page.goto(unknown);

      // The preview server rewrites an unknown path to `index.html`, and
      // `pageFromPath` falls back to `home` — a mistyped or dead link should
      // land on the entry point, not on a 404 and not on an empty screen.
      expect(response?.status()).toBe(200);
      await expect(publicRoute.content('home')).toBeVisible();
      await expect(hub.card('littlesteps')).toBeVisible();
    });
  }

  expect(thrown.map((error) => error.message)).toEqual([]);
});

test('NAV-04 @p1 a legacy hash link lands on the path route', async ({ page }) => {
  const publicRoute = new PublicRoutePage(page);

  // Links shared before routing moved from hash to path — LINE messages,
  // bookmarks, social posts — all look like this. `redirectLegacyHash()`
  // rewrites them with `replaceState` before React mounts.
  await page.goto('/#/littleexplorer/wiki');

  await expect(publicRoute.content('littleexplorer/wiki')).toBeVisible();
  expect(currentPath(page.url())).toBe(ROUTE_PATH['littleexplorer/wiki']);
  expect(new URL(page.url()).hash, 'the hash survived the rewrite').toBe('');
});

test('NAV-05 @p1 every service opens from the hub and returns to it', async ({ page }) => {
  const hub = new HubPage(page);

  await hub.goto();

  for (const service of SERVICE_ORDER) {
    await test.step(service, async () => {
      await hub.card(service).click();
      await expect(hub.returnToHub).toBeVisible();
      expect(currentPath(page.url())).toBe(ROUTE_PATH[service]);

      await hub.returnToHub.click();

      // Back on the hub with the whole collection still listed: a service that
      // cannot be returned from is a dead end, and one missing from the hub
      // has no entry point at all.
      for (const listed of SERVICE_ORDER) {
        await expect(hub.card(listed)).toBeVisible();
      }
      expect(currentPath(page.url())).toBe(ROUTE_PATH.home);
    });
  }
});

test('NAV-06 @p0 back and forward restore the right page across three routes', async ({ page }) => {
  const hub = new HubPage(page);
  const publicRoute = new PublicRoutePage(page);

  // Built by in-app navigation, not by three `goto`s: this app pushes state
  // itself and re-renders from a `popstate` subscription, and the failure this
  // case exists for — a SPA that pushes but never listens — is invisible to a
  // sequence of full page loads.
  await hub.goto();
  await hub.card('littleouting').click();
  await expect(publicRoute.content('littleouting')).toBeVisible();

  await hub.returnToHub.click();
  await expect(publicRoute.content('home')).toBeVisible();

  await hub.card('babyoasis').click();
  await expect(publicRoute.content('babyoasis')).toBeVisible();

  await page.goBack();
  await expect(publicRoute.content('home')).toBeVisible();
  expect(currentPath(page.url())).toBe(ROUTE_PATH.home);

  await page.goBack();
  await expect(publicRoute.content('littleouting')).toBeVisible();
  expect(currentPath(page.url())).toBe(ROUTE_PATH.littleouting);

  await page.goForward();
  await expect(publicRoute.content('home')).toBeVisible();

  await page.goForward();
  await expect(publicRoute.content('babyoasis')).toBeVisible();
  expect(currentPath(page.url())).toBe(ROUTE_PATH.babyoasis);
});

test('NAV-07 @p2 reloading a deep route re-renders the same page', async ({ page }) => {
  const publicRoute = new PublicRoutePage(page);
  const intro = new ServiceIntroPage(page);

  await publicRoute.goto('littleexplorer/wiki');
  await expect(publicRoute.content('littleexplorer/wiki')).toBeVisible();

  const reloaded = await page.reload();
  expect(reloaded?.status()).toBe(200);
  await expect(publicRoute.content('littleexplorer/wiki')).toBeVisible();
  expect(currentPath(page.url())).toBe(ROUTE_PATH['littleexplorer/wiki']);

  // A gated route as well, because it is the only deep-route shape with no
  // prerendered file: `pagesToPrerender()` writes one `index.html` per public
  // page, so reloading `/littlesteps/daily-log` can only be answered by the
  // preview server's SPA rewrite. A public deep route is served its own file
  // and proves nothing about that rewrite.
  await intro.goto('littlesteps/daily-log');
  await expect(intro.signIn).toBeVisible();

  const rewritten = await page.reload();
  expect(rewritten?.status(), 'the deep route 404s on reload instead of being rewritten').toBe(200);
  await expect(intro.signIn).toBeVisible();
  expect(currentPath(page.url())).toBe(ROUTE_PATH['littlesteps/daily-log']);
});
