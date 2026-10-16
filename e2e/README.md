# End-to-end tests

Playwright, Chromium only, against the **production build** at two phone
widths. `docs/E2E_TEST_PLAN.md` says why the suite exists and what may not go
in it; `docs/E2E_TEST_CASES.md` is the case list. This file is how to work in
the directory.

Traditional Chinese appears below only where a string is the literal UI copy a
selector matches. Everything a contributor writes is English, per
`.claude/skills/english-writing`.

## Running it

```bash
npm run test:e2e                      # both viewports, headless
npm run test:e2e:p0                   # the merge-blocking subset
npm run test:e2e -- --ui              # pick and step through cases locally
npm run test:e2e -- --project mobile-320
npm run test:e2e -- --grep 'smoke'
npx playwright show-report            # the HTML report from the last run
```

`playwright.config.ts` owns the server: it runs `vite build` and then
`vite preview` on port 4173, with dummy `VITE_FIREBASE_*` values, and shuts the
server down afterwards. The first run of a session therefore pays for a build.
Nothing is asserted against the dev server — three of the six gaps the suite
exists for only appear in the built output.

**Never run `playwright install`.** Chromium is pre-installed in the sandbox
and in the CI container, and the `@playwright/test` version is pinned exactly
so it matches that build. If you bump the dependency, bump the container image
tag in `.github/workflows/ci.yml` in the same commit.

## Layout

Browser specs live beside the application source or configuration they exercise.
`e2e/testFiles.ts` lists their paths for Playwright and excludes those same files
from Vitest. This keeps both runners explicit while retaining all 252 cases.
`e2e/fixtures/` owns the test object, route blocking, clock and layout helpers;
`e2e/pages/` owns selectors and navigation.

Import `test` and `expect` from `e2e/fixtures/test` (using the relative path from the spec), never from
`@playwright/test`. That object blocks the third-party hosts in
`fixtures/blockedHosts.ts` — map tiles, `firebase.googleapis.com`,
`*.google-analytics.com`, `apis.google.com` and the reCAPTCHA paths on
`www.google.com` and `www.gstatic.com` — before a spec can navigate anywhere,
and supplies the `pinClock` fixture.

## Adding a case

1. **Find its ID in `docs/E2E_TEST_CASES.md`.** A spec with no catalogue entry,
   or an entry with no spec, is a defect in the suite. If the case is not in
   the catalogue, add it there first and say what risk it covers.
2. **Check it is not a unit test.** If it can be asserted against a function or
   a single component in Vitest, it belongs there — E2E is slower and flakier
   per assertion, and the catalogue's §1 table is the bar it has to clear.
3. **Name the test with its ID and priority tag:**
   `test('OASIS-04 @p1 …', …)`. `@p0` is merge-blocking, `@p1` runs on every
   pull request, `@p2` is cosmetic. The tags are selected with `--grep`, so a
   missing tag means the case runs nowhere.
4. **Put selectors in a page object and assertions in the spec**, so a reader
   can see what is being claimed without opening a second file.
5. **Pin the clock** with the `pinClock` fixture for anything date-dependent,
   before the navigation that renders it.
6. **Use the layout helpers** in `fixtures/layout.ts` rather than measuring by
   hand: page overflow, a scrolling row containing its own overflow, a nowrap
   label spilling out of its own box, tap targets, name/tag overlap, and
   whether a control is inside the viewport.
   They poll, so they survive a sheet that is still animating in — which is the
   only reason a spec never needs `waitForTimeout` around one.

## Selector policy, short form

1. **Role and accessible name first** —
   `getByRole('button', { name: '排除內部場所' })`. It asserts accessibility and
   behaviour in one line.
2. **Label, placeholder or text** for content.
3. **`data-testid` only where no accessible name can exist.** The whole list is
   in `fixtures/testIds.ts`: the Leaflet map container, its cluster icons, and
   the chip rows that scroll on purpose. Adding to it is a change to `src/` and
   needs a comment in that diff saying why a role was not usable.

Forbidden: CSS classes (`.card`, `.chip`, `.row-bleed`), Tailwind utilities,
`nth-child`, XPath. Those are design-system tokens that get restyled, and a
test bound to one fails on a refactor that changed nothing a parent can see.

Where a Traditional Chinese string has a canonical source in `src/` —
`ACCESS_LABEL`, `CATEGORY_LABEL`, `getDiaperTypeLabel`, `ROUTE_PATH` — import
it instead of retyping it. A hard-coded copy is a second vocabulary, which is
the defect issues #38 and #48 were opened about.

## Determinism

- **No `waitForTimeout`.** Wait on a role, a URL or a response. A sleep in a
  test is a bug report about a missing signal.
- **No retries**, here or in CI. A failing test is never skipped, quarantined
  or retried into passing; fix it, or delete it if the risk it covered is gone.
- **Third-party network is blocked by declaration**, not discovered as a
  timeout. If you add a blocked host, add it to `BLOCKED_HOSTS` — PWA-03's
  console allowlist imports that list rather than restating it.
