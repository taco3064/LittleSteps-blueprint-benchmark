import { expect, test } from '../../e2e/fixtures/test';
import { GATED_ROUTES, PUBLIC_ROUTES } from '../../e2e/fixtures/routes';
import { PublicRoutePage } from '../../e2e/pages/publicRoutePage';
import { ServiceIntroPage } from '../../e2e/pages/serviceIntroPage';
import {
  expectModalFitsViewport,
  expectNoContentSpill,
  expectSomethingToMeasure,
  expectNoPageOverflow,
  expectReachableByScrolling,
  expectRowContainsItsOverflow,
  expectTapTargets,
} from '../../e2e/fixtures/layout';
import { SCROLL_ROW_SELECTOR } from '../../e2e/fixtures/testIds';
import { BabyOasisPage } from '../../e2e/pages/babyOasisPage';

test.describe('landmarks', () => {
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

    test(`A11Y-01 @p1 ${route} exposes ${expected} banner landmark`, async ({
      page,
    }) => {
      const routes = new PublicRoutePage(page);

      await routes.goto(route);
      await expect(routes.ready(route)).toBeVisible();

      await expect(
        page.getByRole('banner'),
        expected === 1
          ? ('the page header is not a banner landmark: it is probably nested '
            + 'inside <main>')
          : ('this route is listed as having no page header, but something '
            + 'exposed a banner'),
      ).toHaveCount(expected);
    });
  }

  for (const route of PUBLIC_ROUTES) {
    test(`A11Y-02 @p1 ${route} exposes exactly one main landmark`, async ({
      page,
    }) => {
      const routes = new PublicRoutePage(page);

      await routes.goto(route);
      await expect(routes.ready(route)).toBeVisible();

      // Two is as wrong as none: `<main>` may not have a `main` ancestor, and a
      // second one gives a landmark-navigating reader a choice with no meaning.
      await expect(
        page.getByRole('main'),
        ('a page has exactly one main landmark — two means the shell '
          + 'wrapped a page that brings its own'),
      ).toHaveCount(1);
    });
  }

  for (const route of GATED_ROUTES) {
    // Both counts in one case: they are two properties of a single page state,
    // and splitting them would navigate to every gated route twice per viewport
    // to assert nothing new.
    test(`A11Y-01/02 @p1 ${route} signed out exposes one main and no banner`, async ({
      page,
    }) => {
      const intro = new ServiceIntroPage(page);

      await intro.goto(route);
      // The intro heading is the oracle for "the gate decided and rendered":
      // `goto` resolves on `load`, which is before React has painted anything.
      await expect(intro.heading(route)).toBeVisible();

      await expect(
        page.getByRole('main'),
        ('the intro page a signed-out visitor gets here brings no main '
          + 'landmark, and it returns before the shell could supply one'),
      ).toHaveCount(1);

      await expect(
        page.getByRole('banner'),
        ('an intro page has no page header to expose — one link back to the '
          + 'hub is not a banner'),
      ).toHaveCount(0);
    });
  }
});

test.describe('rwd', () => {
  /**
   * RWD-01…04 — the layout invariants, at 390px and 320px.
   *
   * Measurements, never golden images (plan §2 and §7). A pixel baseline on a
   * Tailwind app churns on every token change and teaches a reviewer to accept
   * the diff; these four assert what a parent actually hits — a page that
   * scrolls sideways, a control too small to tap, a modal whose controls are off
   * the screen — and they survive a restyle that broke nothing.
   *
   * One test per route rather than one loop over all ten: the route is then in
   * the failure's title, and a broken page fails once instead of hiding the
   * nine behind it.
   */

  for (const route of PUBLIC_ROUTES) {
    test(`RWD-01 @p1 ${route} keeps its horizontal overflow off the page body`, async ({
      page,
    }) => {
      const routes = new PublicRoutePage(page);

      await routes.goto(route);
      await expect(routes.ready(route)).toBeVisible();

      await expectNoPageOverflow(page);

      // The chip rows that scroll on purpose are the exception, and they are
      // asserted on their own container: that each one absorbs its overflow
      // instead of pushing the body sideways. Deliberately not that it
      // overflows — whether three chips fit at 320px is a property of the
      // content on the day, and the age-band row does fit at both widths.
      for (const row of await page.locator(SCROLL_ROW_SELECTOR).all()) {
        await expectRowContainsItsOverflow(row);
      }
    });
  }

  for (const route of PUBLIC_ROUTES) {
    test(`RWD-02 @p1 ${route} has no control under 44px`, async ({ page }) => {
      const routes = new PublicRoutePage(page);

      await routes.goto(route);
      await expect(routes.ready(route)).toBeVisible();

      // Scoped to the controls the design system owns, and with everything
      // Leaflet draws excluded — see the helper. `.chip` and the `.btn-*` family
      // carry `min-h-tap` by construction, so what this catches is a control
      // that left the system: a bare `<button>`, or a token that lost its size.
      await expectTapTargets(page);
    });
  }

  /**
   * Routes with no non-wrapping content of their own, so RWD-04's candidate set
   * is legitimately empty there and the non-vacuity assertion would fail.
   *
   * Measured, not assumed: every other public route has between 4 and 26
   * candidates at both widths; these three have zero. The hub is a stack of
   * service cards, the sleep guide is prose, and the about page is prose and
   * source cards with nothing set to `nowrap`. Listed by name rather than skipped
   * silently, so a route that *stops* having chips is a decision someone makes
   * here rather than a green line that quietly stopped meaning anything.
   *
   * `about` earned its place the day the assertion landed: it arrived on master
   * between #76 being written and merged, joined the derived route list, and
   * turned RWD-04 red at both widths — which is precisely the outcome the
   * assertion exists for. Without it the route would have joined silently and
   * contributed two permanently-green instances instead.
   */
  const ROUTES_WITH_NOTHING_TO_MEASURE = new Set([
    'home',
    'littlesteps/sleep-training',
    'about',
  ]);

  for (const route of PUBLIC_ROUTES) {
    test(`RWD-04 @p1 ${route} keeps every nowrap label inside its own box`, async ({
      page,
    }) => {
      const routes = new PublicRoutePage(page);

      await routes.goto(route);
      await expect(routes.ready(route)).toBeVisible();

      // RWD-01 measures the document and is structurally unable to see this:
      // a `nowrap` chip squeezed below its own text by a sibling spills over
      // its neighbours *inside* a row that still fits the viewport, so the body
      // never widens. That is the defect PR #40 shipped and #12 reviewed past —
      // three pills reading as one illegible run at 320px, with the
      // document-level check green the whole time. See the helper for why it is
      // measured with a `Range` and not with `scrollWidth`.
      if (!ROUTES_WITH_NOTHING_TO_MEASURE.has(route)) {
        await expectSomethingToMeasure(page);
      }

      await expectNoContentSpill(page);
    });
  }

  /**
   * The county with the most districts in `nursingRooms.json`, so the area
   * picker is unarguably taller than the screen at both widths.
   *
   * The invariant RWD-03 is about only binds on a modal that overflows: a form
   * shorter than 85vh is inside the viewport whether or not `ModalFrame` caps
   * itself. This is the one `ModalFrame` a signed-out visitor can fill past the
   * fold — 22 county chips and then 36 districts. The report form, the other
   * modal Phase 1 can open, renders a sign-in notice at roughly 500px and is
   * therefore no test of the cap at all; that it opens signed out is OASIS-05's
   * subject, and asserting it again here would only be a second copy.
   */
  const CROWDED_COUNTY = '高雄市';

  test(('RWD-03 @p1 an open modal fits the viewport and scrolls its own '
    + 'content'), async ({
    page,
  }) => {
    const oasis = new BabyOasisPage(page);

    await oasis.goto();
    await expect(oasis.search).toBeVisible();

    await oasis.areaChip.click();
    await expect(oasis.areaPicker).toBeVisible();
    await oasis.cityChip(CROWDED_COUNTY).click();
    // Counties first, then the chosen county's districts, so the last control in
    // the dialog is the last district.
    const lastDistrict = oasis.areaPickerControls.last();

    await expect(lastDistrict).toBeVisible();

    await expectModalFitsViewport(oasis.areaPicker);

    // The case is vacuous on a modal that fits: a short form is inside the
    // viewport whether or not anything caps it. This says the one under test is
    // not short — and it is also what goes first if the cap is deleted, because
    // an uncapped sheet grows to its content instead of scrolling.
    await expect
      .poll(
        () =>
          oasis.areaPicker.evaluate(
            (element) => element.scrollHeight - element.clientHeight,
          ),
        {
          message:
            ('the modal does not overflow, so nothing here exercises the cap, '
              + 'in px'),
        },
      )
      .toBeGreaterThan(0);

    // Both ends of a modal taller than the screen stay reachable. The close
    // button is the half that goes first: `ModalFrame` is anchored to the bottom
    // edge, so an uncapped sheet grows past the top of the viewport and nothing
    // outside a fixed element can scroll it back down.
    await expectReachableByScrolling(lastDistrict);
    await expectReachableByScrolling(oasis.closeAreaPicker);
  });
});

test.describe('smoke', () => {
  /**
   * HARNESS-01 — the smoke check. It proves the harness, not the app.
   *
   * Deliberately the only spec in the tree until E2E-02 lands: it is the one
   * assertion that fails if the production build, the dummy Firebase
   * configuration, the preview server, the route blocking or either viewport
   * project is wrong.
   *
   * `/babyoasis` earns the job because it exercises the most of that chain: a
   * public route, a lazy chunk, a 1.1 MB runtime-fetched dataset, and a Leaflet
   * map whose tiles are blocked. The search input only renders once the dataset
   * has loaded, so its presence is a real signal rather than a shell check.
   *
   * The cluster assertion is here because `iconCreateFunction` is the one change
   * this harness made to shipped code, and nothing else exercises it: the unit
   * tests mock `react-leaflet-cluster` wholesale, so the function never runs
   * there. `.first()` is required — the map draws sixteen clusters at the
   * starting zoom, and a bare `getByTestId` would be a strict-mode violation.
   *
   * Tagged `@p0` so `npm run test:e2e:p0` has something to run; the priority
   * tags themselves are the plan's §10 mechanism.
   */
  test(('HARNESS-01 @p0 BabyOasis loads, with its search input and map '
    + 'clusters'), async ({
    page,
  }) => {
    const babyOasis = new BabyOasisPage(page);

    await babyOasis.goto();

    await expect(babyOasis.search).toBeVisible();
    await expect(babyOasis.cluster.first()).toBeVisible();
    // `/?` because a static handler that redirects to the directory-index form
    // has not changed which page a parent is looking at.
    await expect(page).toHaveURL(/\/babyoasis\/?$/);
  });
});
