import { expect, test } from '../fixtures/test';
import { ALL_ROUTES, GATED_ROUTES, PUBLIC_ROUTES, currentPath, pathOf } from '../fixtures/routes';
import { PublicRoutePage } from '../pages/publicRoutePage';
import { ServiceIntroPage } from '../pages/serviceIntroPage';
import type { Page as BrowserPage } from '@playwright/test';

/**
 * AUTH-01…04 — the public allowlist, from the signed-out side.
 *
 * This app stores children's health data, and `routePolicy.ts` is a public
 * allowlist rather than a "needs auth" blocklist precisely so that a page
 * nobody classified fails closed. A unit test asserts the predicate; only a
 * browser proves what a signed-out visitor is actually shown at a gated URL.
 *
 * Every route list here is derived by importing `requiresAuth` and iterating
 * `ROUTE_PATH` (see `../fixtures/routes`). Hard-coding the paths would leave a
 * newly-added, unclassified route untested — the one thing the allowlist's
 * shape is designed to make impossible.
 */

/**
 * Waits until the app has rendered this route, whatever it decided to render.
 *
 * Needed because `goto` resolves on `load`, which is before React has painted:
 * asking "is the intro page here?" at that moment answers "no" for every
 * route, gated or not. Every route in `ROUTE_PATH` puts a heading on screen —
 * the intro pages their wordmark, the real pages their `AppBar` title or their
 * own hero — and the standalone routes render none until their lazy chunk has
 * arrived, so this waits for the decision rather than racing it.
 */
async function waitForRender(page: BrowserPage): Promise<void> {
  await expect(page.getByRole('heading').first()).toBeVisible();
}

test('AUTH-01 @p0 every gated route shows its service intro at the same URL', async ({ page }) => {
  const intro = new ServiceIntroPage(page);

  // Each cross-document navigation adds exactly one history entry, so tracking
  // the depth across the loop detects a gate that redirects by pushing state:
  // that would strand the visitor, because the browser's back button would
  // return them to the same wall they just came from.
  let expectedDepth = await page.evaluate(() => window.history.length);

  for (const route of GATED_ROUTES) {
    await test.step(pathOf(route), async () => {
      await intro.goto(route);

      await expect(intro.heading(route)).toBeVisible();
      // A sign-in path, not merely a wall: this page is the only route back in
      // for someone who arrived from a bookmark or a shared link.
      await expect(intro.signIn).toBeVisible();

      expect(currentPath(page.url()), 'the gate moved the visitor to another URL').toBe(
        pathOf(route),
      );

      expectedDepth += 1;
      expect(
        await page.evaluate(() => window.history.length),
        'the gate pushed a history entry instead of rendering in place',
      ).toBe(expectedDepth);
    });
  }
});

test('AUTH-02 @p0 no gated route leaks a child record while signed out', async ({ page }) => {
  const intro = new ServiceIntroPage(page);

  for (const route of GATED_ROUTES) {
    await test.step(pathOf(route), async () => {
      await intro.goto(route);

      // The two-sided oracle the catalogue specifies. "No child data" has no
      // locator of its own, so asserting absence alone would also pass on a
      // blank page or a crashed chunk: the intro heading being present is what
      // says the page rendered, and the empty counts are what say it rendered
      // nothing belonging to a child.
      await expect(intro.heading(route)).toBeVisible();

      for (const gated of intro.gatedContent) {
        await expect(gated).toHaveCount(0);
      }
    });
  }
});

test('AUTH-03 @p0 every public route renders itself, not an intro page', async ({ page }) => {
  const publicRoute = new PublicRoutePage(page);
  const intro = new ServiceIntroPage(page);

  for (const route of PUBLIC_ROUTES) {
    await test.step(pathOf(route), async () => {
      await publicRoute.goto(route);

      // Guards the allowlist against being narrowed by accident. Nothing
      // throws when a public page starts requiring an account — it just
      // quietly stops being readable by a parent who has not signed up, which
      // for 85 sourced wiki articles is the whole point of them being public.
      await expect(publicRoute.content(route)).toBeVisible();
      await expect(intro.signIn).toHaveCount(0);
    });
  }
});

test('AUTH-04 @p1 the routes reachable signed out are exactly the public ones', async ({
  page,
}) => {
  const intro = new ServiceIntroPage(page);
  const blocked: string[] = [];

  // Classified by observation over the whole of `ROUTE_PATH`, then compared
  // against the predicate. Adding a route and forgetting to classify it makes
  // it gated — `PUBLIC_PAGES` is an allowlist — so this stays green for that
  // case and red for the inverse: a route the predicate calls public that the
  // running app blocks anyway, or one it calls gated that the app lets through.
  for (const route of ALL_ROUTES) {
    await test.step(pathOf(route), async () => {
      await page.goto(pathOf(route));
      await waitForRender(page);

      if (await intro.signIn.isVisible()) blocked.push(pathOf(route));
    });
  }

  expect(blocked).toEqual(GATED_ROUTES.map(pathOf));
});
