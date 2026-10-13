import { expect, test } from '../fixtures/test';
import { GATED_ROUTES, PUBLIC_ROUTES, pathOf } from '../fixtures/routes';
import { INDEXABLE_PAGES, SITE_ORIGIN, metaFor } from '../../src/domain/pageMeta';

/**
 * SEO-01, SEO-02, SEO-03 — the crawl boundary over gated routes.
 *
 * `robots.txt`, `sitemap.xml` and one prerendered `index.html` per public page
 * are written by a `closeBundle` hook in `vite.config.ts`. Nothing else in the
 * repo verifies that hook: `src/common/seo/` has no unit tests, and if the hook
 * silently no-ops the site ships with no `robots.txt`, every gated
 * child-health route becomes crawlable, and nothing goes red. These three
 * cases run against the built `dist/` the preview server is already serving,
 * so the check costs one HTTP request each.
 *
 * All three assert the bytes on the wire, before any JavaScript runs — a
 * different mechanism from NAV-01, which asserts what the app sets after
 * hydration.
 */

/** The `Disallow:` lines of a robots.txt, trimmed, in file order. */
function disallowLines(robots: string): string[] {
  return robots
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('Disallow:'));
}

test('SEO-01 @p0 robots.txt disallows every route that requires signing in', async ({ page }) => {
  const response = await page.request.get('/robots.txt');
  expect(response.status()).toBe(200);

  const robots = await response.text();
  const disallowed = disallowLines(robots);

  for (const route of GATED_ROUTES) {
    const path = pathOf(route);
    expect(disallows(disallowed, path), `no Disallow line for the gated route ${path}`).toBe(true);
  }

  for (const route of PUBLIC_ROUTES) {
    const path = pathOf(route);
    expect(blockedBy(disallowed, path), `the public route ${path} is disallowed`).toEqual([]);
  }
});

test('SEO-01 @p0 a gated service root with public pages below it is anchored', async ({ page }) => {
  const response = await page.request.get('/robots.txt');
  const disallowed = disallowLines(await response.text());

  // The `$` is the whole reason this file is generated rather than written by
  // hand. `/littlesteps` is gated and `/littlesteps/baby-wiki` is not, so an
  // unanchored `Disallow: /littlesteps` would hide 85 wiki articles — public
  // reference content — from search entirely. Which roots need the anchor is
  // derived the same way `renderRobotsTxt` derives it, so adding a public page
  // under a gated root is covered without editing this test.
  const rootsNeedingAnchor = GATED_ROUTES.map(pathOf).filter((gated) =>
    PUBLIC_ROUTES.map(pathOf).some((open) => open.startsWith(`${gated}/`)),
  );

  expect(rootsNeedingAnchor.length, 'no gated root has a public page below it').toBeGreaterThan(0);

  for (const path of rootsNeedingAnchor) {
    expect(disallowed, `${path} is not anchored, so it also blocks the public pages below it`)
      .toContain(`Disallow: ${path}$`);
  }
});

test('SEO-02 @p0 sitemap.xml lists exactly the indexable pages', async ({ page }) => {
  const response = await page.request.get('/sitemap.xml');
  expect(response.status()).toBe(200);

  const sitemap = await response.text();
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

  // Set equality, both directions: a gated route present is a child's health
  // record offered to a crawler, and a public route missing is content a
  // parent without an account cannot find.
  expect(listed.slice().sort()).toEqual(
    INDEXABLE_PAGES.map((route) => `${SITE_ORIGIN}${pathOf(route)}`).sort(),
  );
});

test('SEO-03 @p1 each public route is served its own prerendered head', async ({ page }) => {
  for (const route of PUBLIC_ROUTES) {
    const path = pathOf(route);
    // The directory-index form, deliberately. `vite preview` serves the root
    // `index.html` for any extensionless path, so `/littleouting` returns the
    // home page's title while `/littleouting/` returns the prerendered file.
    // Production has no such gap: `firebase.json` sets `cleanUrls: true`, so
    // both forms resolve to `dist/littleouting/index.html`. This is the one
    // case in the suite that can see the difference — everything else asserts
    // what the browser shows after hydration.
    const directoryIndex = path.endsWith('/') ? path : `${path}/`;

    await test.step(directoryIndex, async () => {
      const response = await page.request.get(directoryIndex);
      expect(response.status()).toBe(200);

      const html = await response.text();
      const meta = metaFor(route);

      expect(html).toContain(`<title>${meta.title}</title>`);
      expect(html).toContain(`<link rel="canonical" href="${meta.canonical}" />`);
      // Public, so the prerendered file must invite indexing. The gated routes
      // have no prerendered file at all — that is what SEO-01 and SEO-02 cover.
      expect(html).toContain('<meta name="robots" content="index, follow" />');
    });
  }
});

/**
 * Whether robots.txt blocks exactly this path.
 *
 * Containment per route, never line-exact equality against `ROUTE_PATH`:
 * `renderRobotsTxt` anchors a service root with `$` when a public page hangs
 * below it (`Disallow: /littlesteps$`), so the line is not always the bare
 * path. Matching a whole line with an optional trailing `$` also stops a route
 * passing on a different route's line — a plain
 * `robots.includes('Disallow: /littlesteps')` is satisfied by
 * `Disallow: /littlesteps/dashboard`, and would call an unprotected service
 * root protected.
 */
function disallows(lines: string[], path: string): boolean {
  const line = new RegExp(`^Disallow: ${escapeForRegExp(path)}\\$?$`);
  return lines.some((candidate) => line.test(candidate));
}

/**
 * The `Disallow` lines that keep a crawler off this path, by robots.txt's own
 * matching rules rather than by line equality.
 *
 * `disallows` answers "is there a line for exactly this route", which is the
 * question the gated half asks. It is the wrong question for the public half:
 * an unanchored `Disallow: /littlesteps` blocks `/littlesteps/baby-wiki` by
 * prefix, and a whole-line comparison says nothing about it — the public half
 * would pass while 85 wiki articles fell out of every index. So a public path
 * is checked against every line: an unanchored one blocks it when the path is
 * that value or sits under it, and an anchored one only when the two are
 * equal. Returning the offending lines rather than a boolean puts the line
 * that did it in the failure.
 *
 * This is deliberately not derived from `renderRobotsTxt`: the sibling case
 * below re-derives which roots need the anchor, which verifies the artifact
 * matches the generator. This one has to be able to fail when the generator
 * itself is wrong.
 */
function blockedBy(lines: string[], path: string): string[] {
  return lines.filter((line) => {
    const value = line.slice('Disallow:'.length).trim();
    // `Disallow:` with nothing after it is robots.txt for "allow everything".
    if (value === '') return false;
    if (value.endsWith('$')) return value.slice(0, -1) === path;
    return path === value || path.startsWith(`${value}/`);
  });
}

/** Escapes a path for use inside a `RegExp`; every route path contains `/`. */
function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
