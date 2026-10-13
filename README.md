# LittleSteps Blueprint Benchmark

**English** · [繁體中文](README.zh-TW.md)

This repository is an independent [Blueprint](https://github.com/taco3064/blueprint)
validation project, forked from [LittleSteps](https://github.com/sean1093/LittleSteps)
by **Sean Chou**. Thank you to Sean Chou for agreeing to let us fork the project
for this benchmark. That permission does not imply that the original author
endorses, participates in, or recommends Blueprint. This is not an official
version of LittleSteps.

The benchmark will stress-test Blueprint's MF / LF folder-structure conversions
on a large, real-world application, keeping the original product code as the
comparison baseline. This initialization adds documentation and prepares the
branches only; no MF / LF conversion has been performed.

## Benchmark branches

| Branch | Purpose |
| --- | --- |
| `master` | Preserve the original product code; add benchmark documentation only. |
| `benchmark/mf` | Hold the MF conversion results and verification evidence. |
| `benchmark/lf` | Hold the LF conversion results and verification evidence. |

Both benchmark branches start from the same initialization commit on `master`.
Its parent is the original-code baseline
[`8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7`](https://github.com/sean1093/LittleSteps/commit/8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7).
**Never merge conversion results back into `master`.**

## Isolation and evidence

- Work only in this benchmark repository; do not modify the original repository.
- Do not change existing product functionality as part of initialization.
- Do not deploy to production or use the original project's production credentials.
- Preserve the original Git history, license materials, and attribution.
- For each future MF / LF run, record the exact Blueprint version, full baseline
  commit SHA, operation steps and commands, conversion results, and verification
  evidence (including failures and limitations) on the corresponding branch.
- The initialization commit uses `[skip ci]` to avoid triggering the inherited
  deployment workflows. This is not a permanent deployment safeguard: before
  future runs, ensure inherited production workflows cannot run and use isolated
  test services or emulators.

## Original project documentation

The original author's product documentation and usage instructions are preserved
unchanged below. Links to the live app, badges, deployment instructions, and
contribution/release procedures refer to the original project; they do not
authorize production access or deployment for this benchmark. The benchmark
isolation rules above take precedence for benchmark work.

---

# LittleSteps

**English** · [繁體中文](README.zh-TW.md)

> Six services for Taiwanese parents, from pregnancy through the toddler years.
> A mobile-first PWA covering pregnancy, the first year, the toddler years,
> finding somewhere to feed the baby when you are out, and what is going around
> in your county this week.

<div align="center">

[![Deploy to Firebase Hosting](https://github.com/sean1093/LittleSteps/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/sean1093/LittleSteps/actions/workflows/firebase-hosting-merge.yml)

[Live app](https://littlesteps-c6ab6.web.app) · [Issues](https://github.com/sean1093/LittleSteps/issues)

</div>

---

## The six services

One entry point at `/#/` lists six services. They share a design system, an
auth model and a data layer; each keeps its own palette and its own navigation
shape.

The entry page groups them the way the `Stage` column below does, because the
two halves are not the same kind of thing: three services follow the child's
age and a family uses one at a time, and three are usable at any age and are
fully public. A parent's first question there is "which one is mine", so the
group headings answer it rather than leaving six equal rows to be read through.

| | Service | Stage | Navigation |
|---|---|---|---|
| 🌸 | **LittleBloom** | Pregnancy · weeks 0-40 | hub + back button |
| 🍼 | **LittleSteps** | Newborn · 0-12 months | sidebar, 12 routes |
| ☀️ | **LittleExplorer** | Toddler · 1-3 years | 4 bottom tabs |
| 🌳 | **LittleOuting** | any | 3 in-page tabs |
| 📍 | **BabyOasis** | any | full-screen map |
| 🛡️ | **LittleGuard** | any | single board + drawer |

### LittleBloom — pregnancy companion
- **Weekly pregnancy guide** — week-by-week body changes and what to watch for
- **Prenatal schedule** — the 14 government-funded prenatal checkups, with dates and clinics recorded
- **Pregnancy knowledge base** — 25 articles: causes, what to do, when to see a doctor, including which vaccines pregnancy needs — influenza, Tdap, COVID-19 and the maternal RSV vaccine — with each one's funding status and the week window for Tdap
- **Birth registration** — converts a pregnancy profile into a baby profile, which is what moves a family from LittleBloom to LittleSteps

### LittleSteps — baby growth tracking
- **Growth overview** — one screen summarising milestones, vaccines, sleep, nappies and food
- **Milestone tracking** — 33 milestones across physical, motor, cognitive and feeding
- **Vaccine tracking** — 36 doses on Taiwan's MOHW schedule (21 government-funded,
  1 conditionally reimbursed by the NHI, 14 self-paid), each citing the CDC page it
  came from, with side-effect and emergency guidance. A dose that is due to change
  funding on a known date says so, and a test goes red once that date passes while
  the row still states the old funding
- **Publicly funded, but only for a named group** — one of those government-funded
  doses is the extra PCV13 dose at six months for high-risk children. It carries the
  CDC's own condition, so it shows on the vaccine page and in the calendar export but
  is never counted as owed: it is not in the due list, not the next dose, and not part
  of "doses still unrecorded". Every family sees it; no family is told they are behind.
  The calendar export is the one place it does prompt — every exported event carries a
  week's warning, so a family that exports gets an alarm for this dose like any other,
  with the condition in the event body
- **Calendar export** — the outstanding doses export as an ICS file, one action for
  everything still due and one per dose, each event naming the dose, its funding
  state and the recommended window, with a week's warning
- **Next dose** — the dashboard card and the clinic summary name only publicly funded
  doses, resolved by one shared implementation that also drops doses the child has
  aged past, so a dose the family would have to buy is never presented as the next
  scheduled one. With no next dose the card still gives a number rather than going
  quiet: how many publicly funded doses are unrecorded, or, once none are, how many
  doses sit outside the routine public schedule and remain available — a count and
  their availability, never a product to buy
- **Quick log** — feeding, sleep and nappies in a couple of taps, or one tap to repeat
  the last one. The form reopens with the values this child was logged with, scoped to
  the child rather than the account, so a parent of a formula-fed and a breastfed baby
  gets each one's own defaults. A sleep can be started and ended in one tap from the
  day view, with a live elapsed count; one left open past 14 hours is flagged as
  needing an end time and excluded from every sleep total, average and score
- **Pumping and bottled breast milk** — a pumping session records volume, minutes and
  optionally which side, and is kept out of every intake total, feed count and feeding
  alert, with its own section in the weekly report. Breast milk given by bottle counts
  as a feed with a measured volume and stays distinguishable from formula
- **Sleep analysis** — patterns, advice, and a quality score measuring how long each
  finished session lasted and how many night wakings the parent recorded. Night
  wakings are recordable on the sleep form and as a prompt straight after a one-tap
  close, so the weekly trend reflects real data
- **Sleep guide** — sleep needs from 0 to 3 years, safety rules and training methods
- **Growth charts** — WHO curves (P3/P15/P50/P85/P97) for weight, height and head circumference, plotted against corrected age for a preterm baby
- **Corrected age for prematurity** — a birth before 37 weeks shifts growth percentiles, the chart's x-axis, the milestone band and the toddler development checks by the weeks the baby was early, until a corrected 24 months. Publicly funded vaccines and health checks are deliberately left on the birth date, which is how the MOHW schedules them, and both of those screens say so
- **Weaning guide** — stage-based weaning plus the 4×3 allergen-introduction method and a per-food trial log
- **Care guide** — age-appropriate care and safety
- **Baby wiki** — 15 common health issues
- **Clinic summary** — generates a summary to hand to a paediatrician
- **Weekly / monthly report** — trends and development insight
- **Current child, named where you log** — the daily log, growth charts and milestone
  screens name the child they are about; with more than one eligible child that name
  is the switcher, one tap to reveal the others and one to choose. One-child accounts
  see no extra control

### LittleExplorer — toddler companion
- **Development checks** — 30 checks over 12-36 months in five stages, plus a primary-teeth chart
- **Care reminders** — health checks, vaccines and fluoride varnish scheduled from the birth date, exportable to a calendar
- **Growth diary** — free-text entries with a mood, for the things that never show up in data
- **Toddler wiki** — 45 articles on toilet training, language, emotions, fussy eating, illness
  and what to keep in the medicine cabinet, filtered by the child's age stage

### LittleOuting — places to take a child
- **234 public family centres across all 22 counties**, built by a committed
  script from the national list published by the MOHW Social and Family Affairs
  Administration, plus Taipei's 13 parenting-friendly rooms kept separate
  because they are a different programme
- Per-county access rules — free or paid, eligible ages, how to book, household
  registration limits — each with its own source and verification date, and an
  explicit "not verified" for the 18 counties whose rules are not published
- **12 family-friendly restaurants**, hand-verified and labelled as a sample
  rather than a directory: Taiwan has no official dataset of family-friendly
  restaurants and no certification scheme, and the Tourism Administration's
  national restaurant feed has a Kids-Friendly field that is empty in all 3,632
  records
- A before-you-go checklist — the eleven questions that decide whether a trip out works
- **Report a wrong record** — a parent standing at the venue can dispute what the app
  claims: gone, cannot get in, hours wrong, undisclosed registration, or wrong
  location, with the venue id, name and the disputed claim attached automatically. A
  signed-out parent sees the action and is told what signing in is for. Reports land
  in the feedback inbox and never change what the list shows
- No map, on purpose: no official family-centre source carries coordinates, and
  geocoding Taiwanese street addresses was tested and rejected (see below)

### BabyOasis — nursing-room map
- **3,852 nursing rooms across all 22 counties**, from MOHW open data
- Locate-me search returning the nearest 8 within 10 km, with real distances
- **Pick any of the 260 metro and light-rail stations and the map answers "what
  is near this one"** — the nearest 8 rooms within 800 m, with walking
  distances. That is the trip a parent actually plans, and the locate button
  cannot answer it: a phone only knows where you are now. Only 56 rooms name a
  metro station in their own registered name, far fewer than there are
  stations, so the station coordinates come from OpenStreetMap (ODbL) rather
  than from the room names. 800 m is measured, not guessed: 235 of the 260
  stations have at least one room inside it, 7.3 on average and 5 at the median
- County, then district, each district carrying its own room count: the 3,852
  rooms sit in 364 districts, so one flat list would be 364 chips
- Six venue-type chips: malls, stations and airports, hospitals and clinics,
  parks and outdoor spaces, libraries and exhibition halls, family centres and
  social welfare
- **2,792 of the 3,852 rooms are on the statutory public-venue list**; the other
  1,060 were provided voluntarily. The dataset carries no venue type and both
  kinds look identical on the map, so that list is the only source-backed way
  to tell a shopping centre from a factory canteen
- 474 rooms read as staff-or-student-only — 228 workplaces and 246 campuses,
  none of them on the statutory list. They are labelled as internal venues
  rather than hidden, because the venue type is inferred from the registered
  name and hiding a real room by default is the worse error. One tap on the
  exclude-internal-venues chip removes all 474
- 973 rooms whose remarks require a service desk are labelled as such, so a
  parent asks at the desk rather than looking for a door that is locked
- Facilities, opening hours, phone, and a one-tap Google Maps handoff
- Clustered markers with a spatial index, so the national dataset stays usable at any zoom
- **Report a wrong record** — the same action as LittleOuting, on the room sheet:
  a parent at a locked door can say so, with the room id, name and the claim being
  disputed attached automatically
- **Area and venue-type filters survive a reload.** The chosen metro station and the
  map viewport deliberately do not: a location anchor is about where you are standing
  now, not about who the family is

### LittleGuard — disease radar
- **Seven infectious diseases common in children**, one upstream dataset each (enterovirus, hand-foot-and-mouth disease, herpangina, influenza-like illness, COVID-19, diarrhoea, chickenpox): weekly outpatient visits, split across the 22 counties and three age bands (0-2 / 3-6 / 7-12)
- **Five rows on the board, not seven**: hand-foot-and-mouth disease and herpangina are the two clinical presentations of an enterovirus infection, and the upstream enterovirus dataset is exactly their sum — equal in all 66 cells (22 counties × 3 age bands), for visits, for rates and for each of the 8 sparkline weeks. Three rows side by side counted the same outpatient visits three times, so the board lists enterovirus once and breaks the two forms out inside its drawer, and a contract test goes red if upstream ever stops being an exact partition
- COVID-19 counts outpatient visits, which is a different thing from the notifiable disease: since 20 March 2023 only cases with complications have to be reported, and on 1 September 2024 the notifiable disease was renamed to cover the severe form only, so the CDC page the drawer links to describes that rather than the visits counted here. The dataset is current to the same week as the other six
- Status compares a county with **its own previous 8 weeks**, not with the same week in earlier years: the 2020-2022 control measures nearly erased enterovirus, so a five-year same-week baseline makes every week look abnormal
- Thresholds are percentiles of the measured distribution (P25 0.74 / P75 1.29 / P90 1.9, median 0.99, n=54,468), recomputed into the JSON on every rebuild, so a test goes red when the constants in code drift away from the data. Adding COVID-19 moved P90 from 1.77 to 1.9 and the test caught it — 12 of the 264 pre-existing board cells shifted one step at the boundary as a result, none by more
- Nine statuses, with `noBaseline` (not enough data to compare) deliberately separate from `none` (no recent cases): "the previous 8 weeks cannot produce a baseline" and "the baseline really is zero" are different things, and only the second one supports "this week it starts appearing"
- A cell whose denominator is too small says "small sample" or "not enough data" instead of being given an invented status — weekly visits for ages 0-2 in Lienchiang and Kinmen are two-digit numbers
- **The board explains itself before it counts**: a short explainer sits above the county picker, and one line above the rows answers the whole board for the selected county and age band — which diseases are above their usual level, that none of them are, or that the county is too small to tell either way. The line is withheld once the data is expired, because a board that old cannot support it, and it only says the rest are unchanged when every remaining row is genuinely comparable
- **A row leads with plain language, not with a rate**: the board shows the week's visits, and the drawer opens with two sentences — how many visits this county and age band had this week and how that compares with its own previous 8 weeks, then whether the county sits above or below the national figure for the same week. The rate per 10,000 outpatient visits, the previous-8-week median, the national rate and the denominator sit behind a "detailed numbers" disclosure, collapsed by default: a number like 423.0 per 10,000 visits is a health statistician's unit, and the sentence says the same thing without asking a parent to learn it. The national comparison has its own measured percentiles (P25 0.66 / P75 1.19)
- The tone is deliberately restrained: notice this, do not panic about it. Every "more than usual" comes with something a parent can do, and the strongest colour it reaches is `butter-dark`
- **Opens on the county you last chose.** For a signed-in parent the age band comes
  from the child's birthday rather than the stored value, because a child's age is the
  better answer and it updates itself

---

## Accounts and data

**Signing in is required for anything that reads or writes a child's records.**
Knowledge content is not.

What a parent *chooses to look at* is remembered on the device — county, age band,
tab and venue filters, in `src/common/preferences.ts` under a versioned key. That is
view state and nothing else: no child's name, birthday, id or records ever goes to
`localStorage`, the module's key set is closed on both read and write so a widened
caller cannot smuggle one in, and a test asserts it. It is the only client-storage
write in the product.

`src/common/routePolicy.ts` holds a **public allowlist**, deliberately not a
"needs auth" blocklist: this app stores children's health data, so forgetting to
mark a new page should fail closed. Public pages are the entry point, the about
page, the three knowledge bases, the care guide, the sleep guide, LittleOuting,
BabyOasis and LittleGuard. Everything else needs an account.

The about page at `/about` says all of this in a parent's words: where a child's
records live, who can read them, what the app does and does not do with them,
and which government, WHO or OpenStreetMap dataset every number on every other
page comes from. Its claims are data in `src/common/about/dataSources.ts` and
each one is held against the real thing by a test — the counts against the
data files, the source URLs against an official-host allowlist, the sentence
about what the device stores against the preference module's key set — so the
page cannot quietly fall behind the system it describes. It is reachable from
the entry page, the account sheet and the share sheet.

A signed-out visitor hitting a private route gets that service's intro page at
the same URL — the path is preserved, so after signing in they land where they
were going.

- **Auth**: Firebase Authentication, Google sign-in
- **Database**: Firebase Realtime Database (asia-southeast1)
- **Sync**: real-time across devices
- **Sharing**: a child profile is shared with family via a unique code, and the
  sharing is revocable — see below
- **Export**: a child's whole record — the profile plus every daily log, diary entry
  and growth measurement — downloads from the account sheet as one JSON file,
  `littlesteps-<child>-<date>.json`, shaped like the database below so it needs no
  schema of its own. The member list is the one thing left out: it is other
  accounts' ids, not the parent's data
- **Deletion**: the account sheet can delete the account itself — every child
  this parent is the only member of, their membership in the shared ones, their
  `users/$uid` node, then the Firebase Auth user
- **Limit**: 2 children per account on the free tier

The Firebase config in the bundle is public by design. Auth and the rules
bound *who* may read or write; nothing above bounds *from where*, so a script
that only holds the config can talk to the database directly. Firebase App
Check with reCAPTCHA v3 covers that half: when `VITE_FIREBASE_APPCHECK_SITE_KEY`
is set, every request carries a token attesting that it came from this web app
on an allowed origin, and a request without one is counted as unverified —
and, once enforcement is switched on in the console, refused. It is an origin
check, not authorisation: `database.rules.json` remains the only boundary that
decides what a signed-in user can touch.

The token comes from a script on `www.google.com`, and some of this app's
parents cannot load it: an ad blocker refuses it, and so do the LINE, Facebook
and Instagram in-app browsers that `isInAppBrowser()` in `AuthContext.tsx`
already exists for. `@firebase/app-check` 0.11.2 has no answer for that — its
loader sets `script.onload` and nothing else, so a failed load leaves the
token promise pending forever and the database waits on it. `src/lib/firebase.ts`
therefore loads the script itself, with an error handler and an 8 s timeout,
and initialises App Check only once `grecaptcha` is really there. A parent who
cannot load it loses their App Check token for that session and nothing else.
That is the right trade while App Check is in monitoring mode; before
enforcement is switched on, the share of unverified requests coming from those
browsers is the number to look at, because enforcement turns "unverified" into
"refused".

### Sharing, and taking it back

Membership lives in `children/$childId/members`, inside the child rather than
inside each account. That is the whole point of it: an existing member can
remove another member. `joinOpen` decides separately whether a holder of the
code may add themselves, so a code that has been passed around can be closed
without disturbing anyone already in.

What that adds up to, asserted by `npm run test:rules` against the emulator:

- an existing member can remove another member
- a removed member cannot re-add themselves while `joinOpen` is `false`
- a membership may be removed as long as one member remains after the write,
  the `createdBy` user's own included. Never zero members, and no member is
  unremovable: a child node with an empty member list is a health record
  nobody can read or delete, while naming one uid unremovable locked a parent
  into an account whenever they had created a child someone else still used
- the last remaining member cannot leave, whether or not they created the
  child. Deleting is the way out, and their "delete" removes the whole record
  rather than just their own membership
- any member is effectively an owner. Realtime Database cannot revoke a write
  granted at an ancestor node, so a member can write anything under the child,
  the member list included. This is a deliberate trade-off: two parents who can
  each take the other off a shared record is worth more here than a hierarchy
  of roles neither of them asked for.

### Database shape

```
users/$uid                 childrenIds, currentChildId, lastFeedbackAt
                           childrenIds is only this account's list of children
                           to subscribe to — authorisation is members, below
                           lastFeedbackAt is a server timestamp written in the
                           same update as a feedback row; the rules require it
                           to be at least 60 s after the previous one and
                           refuse to delete it inside that window, which caps
                           any account at one feedback a minute (a refused
                           write can still have other causes, such as a
                           disabled account). Deleting an account clears it
                           once the window has lapsed, so a deletion within
                           60 s of a feedback leaves that one integer behind
children/$childId          id, name, birthday, gender, createdAt, createdBy,
                           isPregnancy, pregnancyData
                           gestationalAgeWeeks, gestationalAgeDays
                                                   preterm, for corrected age
                           members/$uid: true      authorisation
                           joinOpen                may a code holder join?
                           milestoneProgress, vaccineProgress, toothProgress,
                           developmentProgress, prenatalProgress,
                           careTaskProgress, foodTrackingProgress
childRecords/$childId      dailyLogs/$logId        type (feeding|sleep|diaper),
                                                   timestamp, details
                           diaryEntries/$entryId   date, content, mood
                           growthRecords/$recordId date, weight, height,
                                                   percentile — legacy rows
                                                   only; derived on read now,
                                                   never written
childIndex/$childId        true — public existence index, so joining by code
                           never has to read a stranger's child node
feedbacks/$feedbackId      title, content, userId, timestamp
                           userName, userEmail     attached only when the
                                                   parent ticks the reply box
                                                   on the report form
```

The child node holds who the child is, plus progress against fixed lists — 33
milestones, 36 vaccine doses, 30 development checks — so it is bounded. The
three collections under `childRecords` are not: they grow by one row per nappy,
forever. They sit in a sibling subtree because the child listener subscribes to
the whole `children/$childId` node, so with the logs inside it one nappy change
re-downloaded the child's entire history to every family member.

Access is enforced by `database.rules.json` — `childRecords/$childId` and
`childIndex/$childId` both through `children/$childId/members`. See that file
for the authoritative rules and `scripts/testRules.cjs` for what they are
asserted to do.

---

## Design system

Everything visual comes from one place. The rule that matters most:

> **Pastel shades are fills. Text takes the ramp's readable partner: `-dark` in
> the four base ramps, `-ink` in `bloom.*` / `explorer.*` / `outing.*`.**

The pastels sit at roughly 2:1 against white. Used as text or as a bed for
white text they are unreadable, which is what they were before this was written
down — the primary buttons were the least legible text on screen.

`bloom.*` and `explorer.*` are the trap: there `-dark` is a *deeper fill* for
hover and borders and measures 2.44–3.72:1 on white (`explorer-sunbeam-dark`
2.44, `bloom-dusty-rose-dark` 2.98, `bloom-sage-dark` 3.01), so text in those
two palettes always takes `-ink`.

### Palette — `tailwind.config.js`

| Ramp | Fill (decoration, never text) | Text (≥4.5:1) | Used for |
|---|---|---|---|
| `primary` | `#FF9B9B` | `primary-dark` `#B84A50` | LittleSteps, and the app's own brand |
| `secondary` | `#7EC8E3` | `secondary-dark` `#2A7288` | BabyOasis, informational accents |
| `mint` | `#81C784` | `mint-dark` `#3F7D43` | vaccines, "done" and "safe" |
| `butter` | `#F0B357` | `butter-dark` `#9A6212` | food, nappies, gentle warnings |
| `bloom.*` | Morandi shades **and every `-dark`** | `*-ink` (`bloom-dusty-rose-ink` `#855F5F`), `*-deep` | LittleBloom |
| `outing.*` | `#5FC0B5` | `outing-ink` `#1F7A70`, `outing-deep` `#14655C` | LittleOuting |
| `explorer.*` | bright shades **and every `-dark`** | `*-ink`, `bark` | LittleExplorer |

`ink` / `ink-muted` / `ink-faint` are body, secondary and caption copy — warmer
than `gray-*` against the `warm-white` (`#FDFBF7`) background, which is the one
page background.

### Shared classes — `src/index.css`

- `.card` — a row in a list · `.panel` — a section of a page · `.card-tap` / `.panel-tap` for the interactive versions
- `.screen` + `.screen-body` / `.screen-body-wide` — page shell and column width
- `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.btn-icon` — all ≥44px
- `.chip` + `.chip-on` — filter chips, ≥44px
- `.tag`, `.row-bleed`, `.scrollbar-hide`, `.min-h-dscreen`
- `h1`–`h4` have base sizes, because Preflight resets headings to `inherit`

Two shadows (`shadow-soft`, `shadow-soft-lg`) and two radii (`rounded-2xl`,
`rounded-3xl`). If you need a third of either, the design is wrong.

### Shared components — `src/common/ui/`

| File | Purpose |
|---|---|
| `serviceTheme.ts` | `SERVICE_THEME[id]` — the only thing that varies per service |
| `AppBar.tsx` | the one page header, fixed `h-16`; stick things below it at `top-16` |
| `EmptyState.tsx` | the one "nothing here yet" block; draws **no icon** unless the moment earns one |
| `motion.ts` | `stagger` `listItem` `fadeInUp` `sheet` `backdrop` `collapse` `tap` `hoverLift` |

### Principles

- **Mobile-first.** Scale up from a phone; never write a desktop size as the base.
- **44px minimum** for anything tappable. No small target nested inside a large one.
- **Icons must earn their place.** An icon that repeats the adjacent text is noise. Keep them for buttons, nav destinations, toggles, status, and per-row markers in long lists. Do not put one beside a heading.
- **Type and spacing carry hierarchy**, not colour blocks and not badges.
- **Motion is felt, not watched.** Short entrances, small offsets, nothing looping. `prefers-reduced-motion` is honoured globally.
- **No hex literals in components.** If a colour isn't a token, add a token.

---

## Tech stack

**Frontend** — React 18, TypeScript (strict), Vite 5, Tailwind CSS, Framer
Motion, Lucide icons, React Hooks + Context, Leaflet with clustering.

**Backend** — Firebase Authentication, Realtime Database and Analytics.

**Tooling** — Vitest + Testing Library, Playwright, ESLint, Husky pre-commit,
`vite-plugin-pwa`, GitHub Actions.

---

## Getting started

Requires Node 18+.

```bash
git clone https://github.com/sean1093/LittleSteps.git
cd LittleSteps
npm install
```

Create `.env` (see `.env.example`; never commit it):

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_APPCHECK_SITE_KEY=
VITE_FIREBASE_APPCHECK_DEBUG=
```

`VITE_FIREBASE_APPCHECK_SITE_KEY` is the reCAPTCHA v3 site key: created in the
Google reCAPTCHA admin console, then registered under Firebase console → App
Check with its secret. Leave it empty and the app runs without App Check, which
is the expected state until the key is registered. With a key set, `localhost`
cannot get a real reCAPTCHA token, so to develop against App Check:

1. set `VITE_FIREBASE_APPCHECK_DEBUG=true` in `.env` — only `npm run dev` reads
   it; a production build drops the branch,
2. open the app and copy the token from the `App Check debug token: …` line
   the browser console prints,
3. register it under App Check → Apps → your web app → Manage debug tokens.

```bash
npm run dev            # http://localhost:5173
npm run build          # tsc && vite build
npm run preview
npm run lint           # tsc --noEmit, then eslint
npm run test           # watch
npm run test:coverage
npm run test:rules     # database.rules.json against the Database emulator
npm run test:e2e       # Playwright, at 390px and 320px
```

`npm run lint` typechecks before it lints. `tsconfig.json` pins `lib` to
ES2020, and the compiler is the only tool in the repo that knows it: esbuild
strips types without reading `lib`, and no ESLint rule knows what a built-in
is, so `.at()`, `findLast`, `toSorted` and the rest of the ES2021+ family used
to pass lint and the unit suite and fail only at `npm run build`. Running `tsc`
in the fast loop closes that without inventing a second list of banned
built-ins to drift away from `lib`.

`npm run test:rules` runs `scripts/testRules.cjs` against the Database emulator
via `firebase emulators:exec`, so it needs a JDK: `brew install openjdk`, and
because that formula is keg-only, `/opt/homebrew/opt/openjdk/bin` has to be on
`PATH` or the emulator will not find `java`. Run it after every change to
`database.rules.json` — it is the only way to find out that you have just cut a
family off from a child's health record, or opened one to a stranger. The same
suite runs in CI on every pull request (the `rules` job in
`.github/workflows/ci.yml`), so a contributor without a JDK is still covered:
a loosened rule goes red before it can merge.

`npm run test:e2e` builds the app and serves `dist/` before it opens Chromium,
so it takes a build's worth of time to start and asserts the production output
rather than the dev server. `e2e/README.md` covers how to run a subset and how
to add a case; `docs/E2E_TEST_PLAN.md` covers what belongs in the suite at all.

The nursing-room dataset lives at `public/data/nursingRooms.json` and is
regenerated by `scripts/buildNursingRooms.cjs`; the family-centre list is
`public/data/familyCentres.json` from `scripts/buildFamilyCentres.cjs`. It is excluded from the PWA
precache and fetched on first visit to the map instead — 1.1 MB should not be
downloaded by someone who never opens BabyOasis. The same script also writes
`src/babyoasis/data/nursingRoomsMeta.json`: the run's date, sources, licence
and row counts. The array itself carries no date, and this sidecar is where the
map's attribution and the about page both read the verification date from, so
they cannot disagree; a test holds its counts against the array so a
regenerated dataset with a stale sidecar goes red.

The metro-station list is `src/babyoasis/data/mrtStations.json`, regenerated by
`scripts/buildMrtStations.cjs` from the OpenStreetMap Overpass API. It sits in
`src/` and is imported rather than fetched: at 22 KB it belongs in the
lazy-loaded BabyOasis chunk, and the station picker has to open instantly. The
script keeps only stations that carry a `network` or `operator` tag, which is
what excludes lines that have not opened yet, and it publishes no line names —
OpenStreetMap models an interchange as a single node with a single line code,
so 13 of 21 known interchanges would have been labelled with half their lines.

Disease radar data lives at `public/data/diseaseRadar.json`, aggregated by
`scripts/buildDiseaseRadar.cjs` from seven Taiwan CDC CSV files (~51 MB) down to
79.1 KB. That is 17.0 KB gzipped, so it stays inside the PWA precache and the
board opens offline. The certificate chain served by `od.cdc.gov.tw` is
incomplete, so the script carries the two TWCA certificates under
`scripts/data/`; do not "fix" that by turning off TLS verification.

**Updating is manual, once a week.** Taiwan CDC publishes the previous week
early on Monday or Tuesday, so run this from Wednesday onwards:

```bash
node scripts/buildDiseaseRadar.cjs   # rebuild
node scripts/diffDiseaseRadar.cjs    # 0 same data / 1 changed / 2 cannot compare
```

Only exit 1 earns `git add public/data/diseaseRadar.json` and a commit. On exit
0 run `git checkout -- public/data/diseaseRadar.json` to drop the timestamps the
rebuild just wrote. The comparison strips `generatedAt` and `verifiedOn` first,
because they change on every run and would otherwise produce a weekly commit
that changes no data. Exit 2 means the comparison itself failed: stop and look,
never treat it as a 1.

`.github/workflows/refresh-disease-radar.yml` carries the same logic but is
**manual only, and only useful on a runner with a Taiwan route**.
`od.cdc.gov.tw` is unreachable from GitHub-hosted runners: two dispatches both
died with `connect ETIMEDOUT 35.229.205.172:443` without completing a TCP
handshake, while the same IP answers from a machine in Taiwan and resolves to
the same address from both, so this is the source IP being blocked and not DNS
geo-splitting. Dispatched on `ubuntu-latest` it now stops after about 20 seconds
with that explanation instead of hanging for over two minutes; dispatch it with
the `runner` input pointed at a self-hosted runner in Taiwan and the rest of the
job works unchanged.

Forgetting to update is safe: the board shows which week the data covers, and
once that is over a month old it says so and collapses every status line,
leaving only the numbers.

---

## Project structure

```
src/
├── common/                  shared across all six services
│   ├── ui/                  design system: serviceTheme, AppBar, EmptyState, motion
│   ├── components/          Sidebar, ModalFrame, modals, AppHomeButton, wiki browser
│   ├── landing/             entry point + per-service intro pages
│   ├── hooks/               useChildStore and the Firebase child hooks
│   ├── utils/               dates, summaries
│   ├── routePolicy.ts       the public allowlist
│   └── pregnancy.ts
├── littlesteps/             pages, components/{milestone,vaccine,sleep,growth,
│                            dailylog,food,dashboard,report,shared}, hooks, data
├── littlebloom/             pages, components (BloomShell), data, utils
├── littleexplorer/          pages, components (ExplorerShell, ExplorerTabBar,
│                            ToothChart, AgeBandPicker), hooks, data, utils
├── littleouting/            venue page + card, centre + restaurant data, checklist
├── babyoasis/               map page, spatial index, data
├── littleguard/             radar page, disease row + drawer, sparkline,
│                            status thresholds, county centroids
├── contexts/                AuthContext
├── lib/                     Firebase init
├── types/                   shared types and route unions
├── App.tsx                  routing, shell, lazy page loading
└── index.css                design tokens as classes
```

Routing is path-based (History API, with a SPA rewrite in `firebase.json`) so
every screen is shareable and crawlable. Sub-routes:
`littlesteps/{dashboard,milestones,vaccine-tracking,daily-log,growth-charts,sleep-training,sleep-analysis,complementary-food,care-guide,baby-wiki,clinic-summary,report}`,
`littlebloom/{prenatal,wiki}`, `littleexplorer/{reminders,diary,wiki}`,
`littleouting`, `babyoasis`, `littleguard`.

---

## PWA

Installable, works offline, updates itself. Brand assets are generated from
`public/favicon.svg` — one source for the favicon, the Apple touch icon, the
192/512 PWA icons, a separate maskable icon (launchers crop to a circle) and the
1200×630 share card.

**iOS** — Safari → Share → Add to Home Screen.
**Android** — Chrome → menu → Install app.

---

## Deployment

Push to `master` deploys to Firebase Hosting via GitHub Actions; pull requests
get a preview URL. Environment variables come from GitHub Secrets.

```bash
npm run build && firebase deploy --only hosting   # manual
```

### A new project needs its Hosting site created first

From **2026-10-15** Firebase stops creating a default Hosting site when a
project is created; the site is provisioned on demand instead. Nothing in this
repo creates one — the workflows only ever deploy to a site that already
exists, and `.firebaserc` names the *project*, not the site. So the first
deploy against a fresh project fails with `404 Site Not Found`, from CI, on a
pull request that has nothing to do with Hosting. That is the same failure
shape as the quota limits below: something nobody was told about, arriving as a
broken build.

Create it once, before the first deploy:

```bash
firebase hosting:sites:create littlesteps-c6ab6 --project littlesteps-c6ab6
```

Reuse the project id as the site id unless that subdomain is already taken — it
is what the referrer patterns below, the preview channel URLs and
`firebase-hosting-pr-cleanup.yml`'s channel names are all written against.

**The existing `littlesteps-c6ab6` project is unaffected.** Its site predates
the change, so deploys, preview channels and everything else carry on. This
matters only if the project is ever recreated, or a second one is stood up.

### Console settings that are not in this repo

Two settings live only in the Google Cloud console. Nothing in the repo, the
workflows or `firebase deploy` recreates them, so rotating the Web API key or
moving to a new project silently loses both. Redo this list whenever either
happens.

**The Web API key.** `VITE_FIREBASE_API_KEY` is public and not a secret — it
ships in the bundle, and Firebase says so. Realtime Database does not
authenticate with it either: the socket carries the Auth and App Check tokens,
and the rules decide. What the key does gate is Identity Toolkit — sign-in and
token refresh — so an unrestricted key lets any origin sign in against this
project. Restricting it costs nothing. In *APIs & Services → Credentials*, open
the key the variable points at:

1. **Application restriction: HTTP referrers.** The hosts below and nothing
   else. The third is the preview channel that
   `firebase-hosting-pull-request.yml` deploys to; without it every
   pull-request preview loses sign-in, and the first person to notice files it
   as a bug in the app.

   ```
   littlesteps-c6ab6.web.app/*
   littlesteps-c6ab6.firebaseapp.com/*
   littlesteps-c6ab6--*.web.app/*
   localhost:5173/*
   ```

   A custom domain added under Hosting joins this list the same day. Keep it
   identical to the domain list on the reCAPTCHA site key, which lives in the
   Google reCAPTCHA admin console (not in Firebase console, which only holds
   the key's secret) once one exists: the two guard different things, and a
   host missing from either one breaks sign-in.

2. **API restriction.** Only what the web SDK in `src/lib/firebase.ts` calls
   with the key:

   | API | Why |
   |---|---|
   | Identity Toolkit API | sign-in, `identitytoolkit.googleapis.com` |
   | Token Service API | ID-token refresh, `securetoken.googleapis.com` |
   | Firebase Installations API | Analytics identifies the install through it |
   | Firebase Management API | `getAnalytics()` fetches the app's web config from `firebase.googleapis.com` with the key before the first event — always, `measurementId` in the config only produces a mismatch warning |
   | Firebase App Check API | token exchange, once a site key is set |

   Check the console's list rather than trusting this one; an API missing here
   fails as a silent `403` in the browser. Analytics fails quietest of all: the
   events simply never arrive.

3. **Verify.** Sign-in works on production, on a preview channel deployed
   after the change, and on `localhost:5173`; and a request from a foreign
   origin is refused:

   ```bash
   curl -s -H 'Referer: https://example.com/' -H 'Content-Type: application/json' \
     -d '{"returnSecureToken":true}' \
     'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<VITE_FIREBASE_API_KEY>'
   # expect 403, "Requests from referer https://example.com/ are blocked."
   ```

**Usage alerts.** Spark has 1 GB stored, 10 GB download a month and 100
simultaneous connections, and the last is the ceiling that bites first. There
is no billing, so there is no billing alert: exhaustion shows up as parents
seeing the data-failed-to-load message, not as an email to the maintainer. In
*Monitoring → Alerting*, create an email notification channel and three
policies on the Realtime Database metrics, thresholds below the limit so the
email arrives while there is still time to act:

| Metric | Alert at | Spark limit |
|---|---|---|
| `firebasedatabase.googleapis.com/network/active_connections` | 80 | 100 at once |
| `firebasedatabase.googleapis.com/network/sent_bytes_count`, summed over 30 days | 8 GB | 10 GB a month |
| `firebasedatabase.googleapis.com/storage/total_bytes` | 800 MB | 1 GB |

If a policy turns out to need Blaze — the 30-day sum is the likely one — fall
back to a monthly reminder to open *Realtime Database → Usage* in the Firebase
console, and record which policy and why on issue #88. Verify by setting one
policy's threshold below the current value, receiving the email, and putting
the threshold back.

### Migrating a deployed database

`scripts/migrateChildRecords.cjs` is the one-shot migration that moved
authorisation into `children/$childId/members` and the three growing
collections out to `childRecords/$childId`. It reads the whole database and
writes `backups/rtdb-<timestamp>.json` (gitignored, mode 600) before touching
anything, and refuses to go on if that file cannot be written. Each child's
`members` is computed from whichever accounts hold the child in `childrenIds`;
each collection is copied, read back, compared to the source, re-checked that
the source has not changed underneath, and only then deleted. It will not
invent a member for a child that nobody has — that child is reported as an
orphan needing a human decision and skipped — and it will not overwrite a
`members` list that already exists, because recomputing that from `childrenIds`
would resurrect access somebody had revoked.

```bash
node scripts/migrateChildRecords.cjs           # dry run: every write it would make
node scripts/migrateChildRecords.cjs --apply   # writes
```

It is re-runnable. A child that already has `members` and no legacy collections
is reported as done and skipped, so an interrupted run is finished by running
the same command again.

The order matters:

```bash
node scripts/migrateChildRecords.cjs             # 0. dry run, read the output
firebase deploy --only database                  # 1. rules
node scripts/migrateChildRecords.cjs --apply     # 2. migrate
npm run build && firebase deploy --only hosting  # 3. app
```

Read the dry run before deploying the rules, because step 1 starts a window in
which nothing works: no child has a `members` list yet, so until step 2 writes
one the deployed app can neither read a child nor add one. Step 2 has to come
before step 3 because new code reading `childRecords` before the move finds no
logs at all, and step 3 has to follow immediately because a still-open old tab
writes logs back into `children/$childId`, where the new app does not look.
Running the migration once more after the deploy sweeps up whatever an old tab
wrote during the cutover; that is what being re-runnable is for.

One thing the new shape demands of the client: deleting a child MUST be a
single root fan-out update, with `children/<id>`, `childRecords/<id>`,
`childIndex/<id>` and `users/<uid>/childrenIds/<id>` all set to `null` in one
write. `childRecords` is authorised through `children/<id>/members`, and `root`
in a rules expression is the database *before* the write, so deleting the child
node in its own write leaves the records permanently unauthorised — unreadable
and undeletable. That the sequential order fails is a case in
`scripts/testRules.cjs`.

---

## Contributing

1. Read `.claude/CLAUDE.md` and the skills in `.claude/skills/`. Two of them are
   process, not code: `english-writing` (commit messages, PR text and docs are
   English; `README.md` and `README.zh-TW.md` change together) and
   `pr-self-merge` (branch, open a PR, review your own diff in writing, fix what
   it finds, merge it).
2. Follow the design system above. Adding a second way to draw a card is the
   main thing to avoid.
3. Conventional commits: `feat:` `fix:` `refactor:` `style:` `docs:` `test:`
   `chore:`.
4. CI runs lint, the unit suite and the P0/P1 end-to-end cases on every pull
   request, and deploys a preview. Run `npm run build`, `npm run lint` and
   `npx vitest run` yourself anyway — and look at the change on a 390px
   viewport — before opening the PR.

## Versioning

Every merge to `master` is tagged `vX.Y.Z` and published as a GitHub release,
so there is always an answer to *which version is live*. `package.json`'s
`version` is not that answer and never has been — this is a private package that
is never published, and nothing reads the field.

The tag is cut by `.github/workflows/release.yml` when **CI succeeds**, not when
the merge lands. A tag therefore means the commit was verified; a red `master`
is left untagged, and the next green merge bumps once for everything since the
last tag.

The size of the bump comes from the squash commit's conventional-commit subject
— which is the PR title, since this repo squash-merges:

| Subject | Bump |
|---|---|
| `feat:` | minor |
| anything else (`fix:`, `docs:`, `chore:`, …) | patch |
| `type!:` or `BREAKING CHANGE:` at the start of a line | major\* |

\* while the major version is still `0`, a breaking change bumps the **minor**
instead. Moving to `1.0.0` declares stability, which is a product decision
rather than something a commit message should make on someone's behalf.

The other deliberate choice: every merge gets a version, including a docs-only
one, because every merge to `master` is a deploy and a deploy should have a
name.

`BREAKING CHANGE:` is matched at the **start of a line**, anywhere in the
message. Restricting it to the last paragraph looks more correct and is not:
every commit here ends with a `Co-Authored-By:` trailer block and every squash
body ends with an attribution footer, so a real declaration above them would be
unreachable. The residual risk is a body that *begins a line* with the phrase
while only discussing it — that earns a bump it did not ask for. A spurious bump
is visible in the tag list; a missed one is silent.

The bump logic lives in `scripts/nextVersion.cjs` and is unit-tested, because a
wrong version number is still a valid tag: nothing fails, the number is just
wrong from then on.

## Roadmap

- **Now** — all six services live, multi-device sync, feedback reporting
- **Next** — premium tier, richer analytics, LittleBloom weekly content depth
- **Later** — milestone photos, community, English and Simplified Chinese, dark mode

## Acknowledgments

Medical and schedule information follows Taiwan Ministry of Health and Welfare
guidance; growth curves are the WHO Child Growth Standards; nursing-room data is
Taiwan government open data. Content is reference material and does not replace
a doctor.

MIT licensed.
