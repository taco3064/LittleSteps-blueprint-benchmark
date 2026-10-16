# LittleSteps — AI Assistant Guide

A mobile-first PWA for Taiwanese parents, covering pregnancy through the toddler
years. Traditional Chinese UI. React 18 + TypeScript (strict) + Vite + Tailwind
+ Framer Motion, on Firebase Auth and Realtime Database.

**Read `README.md` first.** It is the source of truth for the six services, the
auth model, the database shape and the design system. This file covers only how
to work in the repo.

---

## Architecture

Six services share one shell, one design system and one data layer. Each keeps
its own palette and its own navigation shape.

The architecture contract is `blueprint.config.mjs`; read `AGENTS.md`,
`docs/architecture-handbook.md` and the installed Blueprint agent contract before
changing placement. Module roots compose use cases; inner layers are
`components → hooks → contexts → services → domain`.

The six product modules own their workflows. `family` owns shared family records
and access policy, `account` owns account management, `feedback` owns submissions,
`knowledge` owns parenting reference content, and `portal` owns product entry,
navigation and discovery. `platform` contains product-neutral infrastructure and
presentation primitives. `app` composes providers and routes.

Presentation-only code belongs in components even with a single consumer.
Cross-boundary imports use `~app` public unit entries. Shared consumption does not
make domain-owned code neutral. Do not recreate `common/`, `utils/` or a shared
business catch-all.

## Auth model

**Signing in is required for anything reading or writing a child's records.**
There is no guest mode and no LocalStorage fallback for child data — do not add
one.

`portal/domain/routePolicy` is a **public allowlist**, not a "needs auth" blocklist.
This app stores children's health data, so a page nobody classified must fail
closed. Only the entry point, the about page, the three knowledge bases, the
care guide, the sleep guide, LittleOuting, BabyOasis and LittleGuard are public.

A blocked visitor sees that service's intro page **at the same URL** — the path
is preserved so signing in lands them where they were going. Never redirect.

### Where authorisation actually lives

`database.rules.json` is the only real boundary — `routePolicy.ts` decides what
a page *shows*, not what the database *gives out*. Two rules govern everything:

- A child's record is readable and writable by `children/$childId/members/$uid`.
  Membership lives inside the child, not under the user, so an existing member
  can remove another — that is what makes a share code revocable. `joinOpen`
  decides whether a holder of the code may add themselves; it is `false` by
  default, so a code that has not been deliberately shared does nothing.
- The unbounded logs live in `childRecords/$childId/{dailyLogs,diaryEntries,
  growthRecords}`, authorised through the child's `members`. They are outside
  `children/$childId` because the profile listener downloads that whole node:
  with the logs inside it, every diaper entry re-sent the child's entire history
  to every family member.

Two consequences worth knowing before you touch the data layer:

- **Deleting is one root fan-out**, never a sequence. `root` in a rules
  expression is the *pre-write* database, so `childRecords` stops being
  authorised the moment the child node goes. `children/$id`, `childRecords/$id`,
  `childIndex/$id` and your own `childrenIds` entry all go null in one
  `update()`.
- **Any member is effectively an owner.** RTDB cannot revoke a write granted at
  an ancestor node, so a member can write anything under the child, the member
  list included. What the rules hold is the member count: a membership may go
  only when at least one member remains after the write. Never zero members —
  an empty member list is a health record nobody can read or delete — and no
  member is unremovable, `createdBy` included, so a parent is never locked into
  an account by a child they created for somebody else.

`npm run test:rules` proves all of it against the real Database emulator
(`scripts/testRules.cjs`, 145 assertions). It needs a JDK. Change
`database.rules.json` without running it and you are guessing.

---

## Rules for UI work

The design system is in `tailwind.config.js`, `src/index.css` and
`src/platform/components/`. The single most important rule:

> **Pastel shades are fills. Only `-dark` / `-ink` shades carry text.**

The pastels are ~2:1 against white. As text, or behind white text, they are
unreadable. Text on white → `primary-dark`, `secondary-dark`, `mint-dark`,
`butter-dark`, `bloom-*-ink`, `explorer-*-ink`. Body copy → `ink`, `ink-muted`,
`ink-faint` (not `gray-*`).

**Never write a hex literal in a className.** If a colour is not a token, add a
token. The only exception is markup built as an HTML string outside Tailwind's
reach, e.g. Leaflet `divIcon`s — comment the token name there.

### Use what exists

| Need | Use |
|---|---|
| a row in a list | `.card` / `.card-tap` |
| a section of a page | `.panel` / `.panel-tap` |
| page shell | `.screen` + `.screen-body` or `.screen-body-wide` |
| button | `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.btn-icon` |
| filter chip | `.chip` + `.chip-on` |
| page header | `platform/components/AppBar` |
| "nothing here yet" | `platform/components/EmptyState` |
| animation | `platform/components/Motion` |
| per-service colour | `SERVICE_THEME[id]` from `portal/components/ServiceTheme` |

Two shadows, two radii, one page background, one column width per role. Adding
a third of any of those is the failure mode this system exists to prevent — the
codebase previously had five card recipes, five shadow tokens and five
container widths for the same jobs.

`h1`–`h4` are sized in `@layer base`; prefer deleting a `text-*` class over
adding one. Never make a heading visually smaller than one nested beneath it.

### Icons

An icon **earns its place** when it is the only thing carrying meaning: a
button's whole label, a nav or tab destination, a toggle, a status or trend
indicator, or a per-row marker in a long scrollable list.

Otherwise **delete it**. Specifically, do not add:
- an icon beside a page title or section heading — the words are already there
- a big muted glyph in an empty or loading state
- a tinted or gradient badge wrapping a glyph to decorate a card header
- an icon prefixing a form-field label
- sparkles, stars, party poppers
- emoji standing in for an icon, or appended to a sentence
- the same icon on every item in a set

Hierarchy comes from type, spacing and one accent colour.

### Mobile-first

- Scale **up** from a phone. A desktop size as the base is a bug.
- **44px minimum** for anything tappable (`min-h-tap`, `w-tap`, `.btn-icon`).
- Never nest a small tap target inside a large one that does the same thing.
- No table of prose on a phone — use a card list.
- **Do not combine `flex-1` with an explicit `min-width` on a `nowrap` item.**
  Either alone is fine — `RepeatLastLog` ships `chip min-w-tap` on purpose. It
  is the pair: `flex-1` is `flex: 1 1 0%`, and `min-width: auto` is the only
  thing flooring such an item at its own text. `min-w-tap` replaces that floor
  with 44px, and `.chip` is `nowrap` with `overflow: visible`, so the label
  spills over its neighbours instead of clipping. The page does not widen and
  the tap target is still 44px, so every document-level check stays green.
  **The fix is to drop `flex-1`** and let the chips size to their labels, which
  is what #40's correction did — `flex-wrap` does not help, because line
  breaking uses the hypothetical main size and the explicit `min-width` pins
  that at 44px (`NightWakingsPrompt` has both and still shares a line). RWD-04
  measures it at both widths, **on the public routes only** — every live
  instance of this recipe is behind the auth gate, which is Phase 2.
- Charts need `viewBox` + `w-full`, never fixed pixel `width`/`height`.
- `min-h-dscreen` / `h-dscreen` for full-bleed screens; `100vh` includes the
  browser chrome covering the bottom of the screen.
- Modals: `max-h-[85vh] overflow-y-auto`, or the submit button is unreachable
  with the keyboard open.
- Check every change at 390px width. 320px for anything in a grid.

### Motion

Short entrances, small offsets, nothing looping. Import from `platform/components/Motion`
— never define local variants. `prefers-reduced-motion` is handled globally in
`index.css`.

---

## Workflow

```bash
npm run dev            # localhost:5173
npm run build          # tsc && vite build — must pass
npm run lint           # tsc --noEmit, then eslint; zero warnings allowed
npm run test           # watch mode; `npx vitest run` for one pass
npm run test:rules     # database.rules.json against the real emulator (needs a JDK)
```

`npm run lint` typechecks before it lints, and that ordering is the point.
`tsconfig.json` pins `lib` to ES2020, but esbuild strips types without reading
it and no ESLint rule knows what a built-in is, so `.at()`, `findLast`,
`toSorted`, `Object.groupBy` and the rest of the ES2021+ family used to run
green under Vitest and lint clean while only `tsc` objected. The compiler is
the only thing that knows the ceiling, so the fast loop runs the compiler —
rather than a second, hand-maintained list of banned built-ins that would drift
away from `lib` the day it was written. When `tsc` suggests raising `lib`,
index the array instead; widening the ceiling repo-wide to compile one line is
damage left for the next reader.

Before claiming a UI change works, **look at it** at 390px. Type-checking is not
verification for visual work.

### Commits

Conventional commits: `feat:` `fix:` `refactor:` `style:` `docs:` `test:`
`chore:`.

Each commit must be independently deployable — it should build, typecheck and
pass tests on its own. Group by concern, not by file count: one commit per
coherent change, not one giant commit and not twenty tiny ones. When a type
contract spans several areas, the contract change and its call sites belong in
the same commit.

Push after committing.

### Tests

Vitest + Testing Library. Test observable behaviour — boundaries, invariants,
transitions, real error paths. Do not test source text, styling, or plumbing.
Deleting tests that assert deleted code is correct; narrowing a test to make it
pass is not.

---

## Superseded documents

`.claude/skills/*.md` predate the design-system consolidation.
`styling-guide.md`, `ux-design.md` and the dual-mode sections of
`firebase-integration.md` describe the **old** palette (`#F472B6`/`#60A5FA`),
the old 80×80px touch-target rule, an "icons over text" principle that is now
reversed, and a LocalStorage guest mode that no longer exists. Where they
conflict with this file or `README.md`, this file and the README win.
`component-patterns.md` and `typescript-conventions.md` are still broadly
accurate on structure and typing.

## Reference data

Static reference datasets live in each owning `domain/<unit>/data.ts` and are
exported through the unit entry. The reference-date audit discovers these files
recursively; new datasets must retain this convention and supply verification
dates or a justified existing exception. Do not freeze the scan to an old file list.
