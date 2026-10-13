import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { ROUTE_PATH, type Page } from "~app/domain/routes";
import { isStandaloneSubApp } from "~app/domain/routePolicy";
import RadarPage from "~app/containers/RadarPage";

/**
 * The landmark contract for standalone routes, checked where the E2E suite
 * cannot go.
 *
 * `isStandaloneSubApp` (see `routePolicy.ts`) is a promise: `App.tsx` stops
 * supplying a `<main>`, so every page under those prefixes must bring its own.
 * A11Y-01/02 prove that in a browser, but the suite runs signed out and five of
 * these routes early-return an intro page while signed out, so those five are
 * never visited in the state the contract is about. This has already gone wrong
 * once: an `about` route joined the list while PR #79 was open, `AboutPage` had
 * no `<main>`, and only a merge conflict noticed.
 *
 * Why a source scan. The alternative is mounting each page, and each one wants
 * a child profile, a Firebase listener and a fetch of its own — a fixture per
 * service, for an assertion about one element. The scan is cheap and the thing
 * it guards is structural.
 *
 * What makes it worth having is that nothing here is written down twice. The
 * page list is `ROUTE_PATH` filtered through the predicate itself, and the
 * component each page renders is read out of `App.tsx`, so a seventh service
 * arrives in this test the moment it arrives in the product. A hand-copied
 * list would be a second vocabulary that goes stale on exactly the day it
 * matters, which is the failure this exists to catch — so a page this file
 * cannot resolve fails loudly rather than being skipped.
 */

const ROOT = process.cwd();
const APP = path.join(
  ROOT,
  "src/containers/ApplicationShell/ApplicationShell.tsx",
);

/**
 * How far to follow relative imports from the page module.
 *
 * One hop is what the shell-based services need (`LittleBloomPage` →
 * `BloomShell`); two leaves room for a page that reaches its shell through one
 * more component without turning this into a whole-graph walk.
 */
const MAX_IMPORT_HOPS = 2;

/** The file extensions a relative import can land on, in resolution order. */
const EXTENSIONS = [".tsx", ".ts"];

/**
 * Comments blanked out, so prose about the landmark cannot pass for one.
 * `App.tsx`, `RadarPage.tsx` and both intro pages all discuss `<main>` in
 * comments; without this the scan would find landmarks in the discussion.
 */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(?<![:/])\/\/[^\n]*/g, "");
}

const relative = (file: string) =>
  path.relative(ROOT, file).split(path.sep).join("/");

/** Where a relative import specifier actually points, or null if nowhere. */
function resolveImport(fromFile: string, specifier: string): string | null {
  const base = specifier.startsWith("~app/")
    ? path.join(ROOT, "src", specifier.slice(5))
    : path.resolve(path.dirname(fromFile), specifier);

  const candidates = [
    ...EXTENSIONS.map((extension) => base + extension),
    ...EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ];

  const resolved = candidates.find((candidate) => fs.existsSync(candidate));
  if (!resolved) return null;
  if (path.basename(resolved).startsWith("index.")) {
    const entry = fs.readFileSync(resolved, "utf8");
    const target = entry.match(
      /export \{\s*default\s*\} from ['"]([^'"]+)['"]/,
    );
    if (target) return resolveImport(resolved, target[1]);
  }
  return resolved;
}

const shellSource = withoutComments(fs.readFileSync(APP, "utf8"));
const routeModules = [...shellSource.matchAll(/from '(\.\/[^']+Routes)'/g)].map(
  ([, specifier]) => {
    const file = resolveImport(APP, specifier);
    if (!file) throw new Error(`Missing route module ${specifier}`);
    return { file, code: withoutComments(fs.readFileSync(file, "utf8")) };
  },
);
const APP_SOURCE = routeModules.map((module) => module.code).join("\n");

/**
 * The component `App.tsx` renders for a page, taken from the render
 * conditional. Requiring the `{` rules out the `if (currentPage === …)`
 * branches in `getPageTitle`, which decide a title rather than a page.
 */
function componentFor(page: Page): string {
  const conditional = new RegExp(
    `\\{currentPage === '${page}'[^<]*<([A-Z][A-Za-z0-9]*)`,
  );
  const match = APP_SOURCE.match(conditional);

  if (match === null) {
    throw new Error(
      `${page} is a standalone route, but src/App.tsx has no \`currentPage === '${page}'\` ` +
        "render conditional this guard can read. A route it cannot resolve is a route it " +
        "cannot check, which is the gap it exists to close — classify the page or teach " +
        "this test the new shape, but do not leave it unchecked.",
    );
  }

  return match[1];
}

/** The module behind that component's `lazy(() => import(…))` declaration. */
function moduleFor(page: Page, component: string): string {
  const declaration = new RegExp(
    `const ${component} = lazy\\(\\(\\) => import\\('([^']+)'\\)\\)`,
  );
  const match = APP_SOURCE.match(declaration);

  if (match === null) {
    throw new Error(
      `src/App.tsx renders <${component}> for ${page} but declares no ` +
        `lazy(() => import(…)) for it, so this guard cannot find the file to check.`,
    );
  }

  const owner = routeModules.find((module) => declaration.test(module.code));
  if (!owner) throw new Error(`Missing route owner for ${component}`);
  const resolved = resolveImport(owner.file, match[1]);

  if (resolved === null) {
    throw new Error(
      `${component} imports '${match[1]}', which resolves to no file on disk.`,
    );
  }

  return resolved;
}

/**
 * Every module reachable from a page that renders a `<main>`, following
 * relative imports only — the shells are all in-repo, and a landmark is never
 * going to arrive from `node_modules`.
 */
function modulesRenderingMain(entry: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  let frontier = [entry];

  for (let hop = 0; hop <= MAX_IMPORT_HOPS && frontier.length > 0; hop += 1) {
    const next: string[] = [];

    for (const file of frontier) {
      if (seen.has(file)) {
        continue;
      }

      seen.add(file);

      const code = withoutComments(fs.readFileSync(file, "utf8"));

      if (/<main[\s>]/.test(code)) {
        found.push(relative(file));
      }

      if (hop === MAX_IMPORT_HOPS) {
        continue;
      }

      for (const [, specifier] of code.matchAll(
        /\bfrom '((?:\.|~app\/)[^']*)'/g,
      )) {
        const resolved = resolveImport(file, specifier);

        if (resolved !== null) {
          next.push(resolved);
        }
      }
    }

    frontier = next;
  }

  return found;
}

const STANDALONE_PAGES = (Object.keys(ROUTE_PATH) as Page[]).filter(
  isStandaloneSubApp,
);

describe("standalone routes bring their own main landmark", () => {
  it("has pages to check at all", () => {
    // `it.each([])` registers no cases and reports success, so a predicate that
    // stopped matching anything would turn this whole file into a green line
    // that checks nothing — the exact shape of the defect being closed.
    expect(
      STANDALONE_PAGES.length,
      "isStandaloneSubApp matched no route, so every case below was skipped",
    ).toBeGreaterThan(0);
  });

  it.each(STANDALONE_PAGES)(
    "%s renders exactly one main of its own",
    (page) => {
      const component = componentFor(page);
      const module = moduleFor(page, component);
      const reached = modulesRenderingMain(module);

      expect(
        reached,
        `${page} renders <${component}> (${relative(module)}). App.tsx supplies no <main> for ` +
          "a standalone route, so exactly one module it reaches must render one: none leaves the " +
          "page with no landmark to jump to, two nests a <main> inside a <main>.",
      ).toHaveLength(1);
    },
  );
});

describe("the disease radar while its board is still loading", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes exactly one main landmark before the data arrives", () => {
    // The scan above cannot tell RadarPage's two return paths apart: it sees
    // both `<main>`s in one file and would stay green if the loading branch
    // lost its own. That branch is what every visitor sees first, and on a slow
    // connection it is the whole page for several seconds.
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {})),
    );

    render(<RadarPage />);

    // Two-sided: the pending copy says this really is the loading path rather
    // than the board or the "no data" fallback, which have their own <main>.
    expect(screen.getByText("載入中")).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });
});
