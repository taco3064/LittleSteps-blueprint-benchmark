import { expect, test } from '../fixtures/test';
import { GATED_ROUTES, PUBLIC_ROUTES } from '../fixtures/routes';
import { PublicRoutePage } from '../pages/publicRoutePage';
import { ServiceIntroPage } from '../pages/serviceIntroPage';

/**
 * A11Y-01/02 — the banner and main counts of every route, public and gated.
 *
 * Why this is E2E and not a unit test. Both landmarks are properties of the
 * whole document, and both are produced by two files that never meet in a unit
 * test: `App.tsx` supplies the shell, and each standalone service supplies its
 * own `AppBar` and its own `<main>` from inside a lazily-imported page. The
 * defect this covers lived exactly in the seam — `<header>` maps to `banner`
 * only when it is *not* inside `main`/`section`/`article`/`aside`/`nav`, so an
 * `AppBar` rendered by a page that `App.tsx` wrapped in `<main>` silently
 * stopped being a landmark. Mounting either file alone shows nothing wrong.
 *
 * Counting rather than asserting presence is the point of the case. Both
 * failure modes are a count: zero banners on the five services that draw their
 * own header, and two `main` elements on the three that also draw their own
 * content landmark inside the shell's one. A `toBeVisible()` on the first
 * match would have passed through both.
 *
 * One test per route, as in `rwd.spec.ts`: the route is then in the failure's
 * title and one broken page does not hide the eight behind it.
 *
 * The gated routes are covered here too, in the state the signed-out suite
 * actually meets them: an intro page at the gated URL. That is a route/state
 * combination the rest of the matrix never visits — every other spec either
 * asks a public route what it renders, or asks a gated route whether it leaked
 * a child's record — which is exactly why both intro pages shipped with no
 * landmarks at all (#80).
 */

/**
 * The public routes that expose no `banner`, and why.
 *
 * Only the hub (`home`): it is a service chooser and deliberately renders no
 * `AppBar` — see `HubLanding`, and `publicRoutePage.ts`'s note that its `h1` is
 * the only one on the page. Naming it beats a `>= 0` assertion that would let
 * any other page lose its header quietly.
 *
 * Gated routes are not listed here, because having no header is a property of
 * the *state* rather than the route: signed out they render `StepsLanding` or
 * `ServiceLanding`, and signed in they render a real page with an `AppBar`.
 * The loop over `GATED_ROUTES` below therefore asserts zero for all of them
 * directly. The reason is the same as the hub's, though: an intro page's whole
 * chrome is one link back here, and the wordmark below it is the page's
 * content, so a `<header>` there would be a landmark naming nothing. They do
 * owe a `<main>`, and they return before the shell can supply one, so they
 * render their own (#80).
 */
const ROUTES_WITHOUT_A_HEADER = new Set<string>(['home']);

for (const route of PUBLIC_ROUTES) {
  const expected = ROUTES_WITHOUT_A_HEADER.has(route) ? 0 : 1;

  test(`A11Y-01 @p1 ${route} exposes ${expected} banner landmark`, async ({ page }) => {
    const routes = new PublicRoutePage(page);

    await routes.goto(route);
    await expect(routes.ready(route)).toBeVisible();

    await expect(
      page.getByRole('banner'),
      expected === 1
        ? 'the page header is not a banner landmark: it is probably nested inside <main>'
        : 'this route is listed as having no page header, but something exposed a banner',
    ).toHaveCount(expected);
  });
}

for (const route of PUBLIC_ROUTES) {
  test(`A11Y-02 @p1 ${route} exposes exactly one main landmark`, async ({ page }) => {
    const routes = new PublicRoutePage(page);

    await routes.goto(route);
    await expect(routes.ready(route)).toBeVisible();

    // Two is as wrong as none: `<main>` may not have a `main` ancestor, and a
    // second one gives a landmark-navigating reader a choice with no meaning.
    await expect(
      page.getByRole('main'),
      'a page has exactly one main landmark — two means the shell wrapped a page that brings its own',
    ).toHaveCount(1);
  });
}

for (const route of GATED_ROUTES) {
  // Both counts in one case: they are two properties of a single page state,
  // and splitting them would navigate to every gated route twice per viewport
  // to assert nothing new.
  test(`A11Y-01/02 @p1 ${route} signed out exposes one main and no banner`, async ({ page }) => {
    const intro = new ServiceIntroPage(page);

    await intro.goto(route);
    // The intro heading is the oracle for "the gate decided and rendered":
    // `goto` resolves on `load`, which is before React has painted anything.
    await expect(intro.heading(route)).toBeVisible();

    await expect(
      page.getByRole('main'),
      'the intro page a signed-out visitor gets here brings no main landmark, and it returns before the shell could supply one',
    ).toHaveCount(1);

    await expect(
      page.getByRole('banner'),
      'an intro page has no page header to expose — one link back to the hub is not a banner',
    ).toHaveCount(0);
  });
}
