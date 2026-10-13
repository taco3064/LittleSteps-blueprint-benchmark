import { expect, test } from '../fixtures/test';
import {
  expectModalFitsViewport,
  expectNoContentSpill,
  expectSomethingToMeasure,
  expectNoPageOverflow,
  expectReachableByScrolling,
  expectRowContainsItsOverflow,
  expectTapTargets,
} from '../fixtures/layout';
import { PUBLIC_ROUTES } from '../fixtures/routes';
import { SCROLL_ROW_SELECTOR } from '../fixtures/testIds';
import { BabyOasisPage } from '../pages/babyOasisPage';
import { PublicRoutePage } from '../pages/publicRoutePage';

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
  test(`RWD-01 @p1 ${route} keeps its horizontal overflow off the page body`, async ({ page }) => {
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
const ROUTES_WITH_NOTHING_TO_MEASURE = new Set(['home', 'littlesteps/sleep-training', 'about']);

for (const route of PUBLIC_ROUTES) {
  test(`RWD-04 @p1 ${route} keeps every nowrap label inside its own box`, async ({ page }) => {
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
    if (!ROUTES_WITH_NOTHING_TO_MEASURE.has(route)) await expectSomethingToMeasure(page);
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

test('RWD-03 @p1 an open modal fits the viewport and scrolls its own content', async ({ page }) => {
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
      () => oasis.areaPicker.evaluate((element) => element.scrollHeight - element.clientHeight),
      { message: 'the modal does not overflow, so nothing here exercises the cap, in px' },
    )
    .toBeGreaterThan(0);
  // Both ends of a modal taller than the screen stay reachable. The close
  // button is the half that goes first: `ModalFrame` is anchored to the bottom
  // edge, so an uncapped sheet grows past the top of the viewport and nothing
  // outside a fixed element can scroll it back down.
  await expectReachableByScrolling(lastDistrict);
  await expectReachableByScrolling(oasis.closeAreaPicker);
});
