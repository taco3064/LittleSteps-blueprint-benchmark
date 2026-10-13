import { expect, test } from '../fixtures/test';
import { BabyOasisPage } from '../pages/babyOasisPage';

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
test('HARNESS-01 @p0 BabyOasis loads, with its search input and map clusters', async ({
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
