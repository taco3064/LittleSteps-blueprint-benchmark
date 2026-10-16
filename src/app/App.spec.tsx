import { render, screen } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RadarPage } from '~app/littleguard';
import ts from 'typescript';
import { isStandaloneSubApp } from '~app/portal/domain/routePolicy/routePolicy';
import { ROUTE_PATH, type Page } from '~app/portal/domain/routes/routes';

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
const APP = path.join(ROOT, 'src/app/AppRoutes.tsx');

/** The file extensions a relative import can land on, in resolution order. */
const EXTENSIONS = ['.tsx', '.ts'];

/**
 * Comments blanked out, so prose about the landmark cannot pass for one.
 * `App.tsx`, `RadarPage.tsx` and both intro pages all discuss `<main>` in
 * comments; without this the scan would find landmarks in the discussion.
 */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(?<![:/])\/\/[^\n]*/g, '');
}

const relative = (file: string) =>
  path.relative(ROOT, file).split(path.sep).join('/');

/** Where a relative import specifier actually points, or null if nowhere. */
function resolveImport(fromFile: string, specifier: string): string | null {
  const base = specifier.startsWith('~app/')
    ? path.join(ROOT, 'src', specifier.slice(5))
    : path.resolve(path.dirname(fromFile), specifier);

  const candidates = [
    ...EXTENSIONS.map((extension) => base + extension),
    ...EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

const APP_SOURCE = withoutComments(fs.readFileSync(APP, 'utf8'));

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
      `${page} is a standalone route, but src/app/AppRoutes.tsx has no \`currentPage === '${page}'\` `
      + ('render conditional this guard can read. A route it cannot resolve '
        + 'is a route it ')
      + ('cannot check, which is the gap it exists to close — classify the '
        + 'page or teach ')
      + 'this test the new shape, but do not leave it unchecked.',
    );
  }

  return match[1];
}

interface SymbolTarget {
  file: string;
  name: string;
}

function parse(file: string) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function requireImport(file: string, specifier: string): string {
  const resolved = resolveImport(file, specifier);

  if (!resolved) {
    throw new Error(`${relative(file)}: unresolved source import ${specifier}`);
  }

  return resolved;
}

/** Resolve only the selected export; a barrel's other pages prove nothing. */
function implementation(
  target: SymbolTarget,
  seen = new Set<string>(),
): SymbolTarget {
  const key = `${target.file}#${target.name}`;

  if (seen.has(key)) {
    throw new Error(`Export cycle while resolving ${key}`);
  }

  seen.add(key);
  const source = parse(target.file);

  for (const node of source.statements) {
    if (
      !ts.isExportDeclaration(node)
      || !node.moduleSpecifier
      || !ts.isStringLiteral(node.moduleSpecifier)
    ) {
      continue;
    }

    const next = requireImport(target.file, node.moduleSpecifier.text);

    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      const entry = node.exportClause.elements.find(
        (entry) => entry.name.text === target.name,
      );

      if (entry) {
        return implementation(
          { file: next, name: (entry.propertyName ?? entry.name).text },
          seen,
        );
      }
    }
  }

  const direct = source.statements.some((node) => {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : [];

    const exported = modifiers?.some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    );

    const isDefault = modifiers?.some(
      (m) => m.kind === ts.SyntaxKind.DefaultKeyword,
    );

    if (target.name === 'default') {
      return Boolean(isDefault || ts.isExportAssignment(node));
    }

    return (
      exported
      && (((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node))
        && node.name?.text === target.name)
      || (ts.isVariableStatement(node)
        && node.declarationList.declarations.some(
          (item) =>
            ts.isIdentifier(item.name) && item.name.text === target.name,
        )))
    );
  });

  if (direct) {
    return target;
  }

  const stars = source.statements
    .filter(ts.isExportDeclaration)
    .filter(
      (node) =>
        !node.exportClause
        && node.moduleSpecifier
        && ts.isStringLiteral(node.moduleSpecifier),
    );

  if (stars.length === 1) {
    const specifier = stars[0].moduleSpecifier as ts.StringLiteral;

    return implementation(
      { file: requireImport(target.file, specifier.text), name: target.name },
      seen,
    );
  }

  throw new Error(`Cannot resolve exported component ${key}`);
}

/** Read both lazy default imports and selected named exports from source. */
function moduleFor(page: Page, component: string): SymbolTarget {
  let target: SymbolTarget | undefined;

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === component
      && node.initializer
    ) {
      let specifier: string | undefined;
      let name = 'default';

      const inspect = (child: ts.Node) => {
        if (
          ts.isCallExpression(child)
          && child.expression.kind === ts.SyntaxKind.ImportKeyword
          && ts.isStringLiteral(child.arguments[0])
        ) {
          specifier = child.arguments[0].text;
        }

        if (
          ts.isPropertyAssignment(child)
          && child.name.getText() === 'default'
          && ts.isPropertyAccessExpression(child.initializer)
        ) {
          name = child.initializer.name.text;
        }

        ts.forEachChild(child, inspect);
      };

      inspect(node.initializer);

      if (specifier) {
        target = { file: requireImport(APP, specifier), name };
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(parse(APP));

  if (!target) {
    throw new Error(`${page}: cannot resolve lazy component ${component}`);
  }

  return implementation(target);
}

type Bindings = Map<string, SymbolTarget>;

function importsFor(file: string): Bindings {
  const bindings: Bindings = new Map();

  for (const node of parse(file).statements.filter(ts.isImportDeclaration)) {
    if (!ts.isStringLiteral(node.moduleSpecifier) || !node.importClause) {
      continue;
    }

    const specifier = node.moduleSpecifier.text;

    if (!specifier.startsWith('.') && !specifier.startsWith('~app/')) {
      continue;
    }

    const importedFile = requireImport(file, specifier);

    if (node.importClause.name) {
      bindings.set(node.importClause.name.text, {
        file: importedFile,
        name: 'default',
      });
    }

    const named = node.importClause.namedBindings;

    if (named && ts.isNamedImports(named)) {
      for (const entry of named.elements) {
        bindings.set(entry.name.text, {
          file: importedFile,
          name: (entry.propertyName ?? entry.name).text,
        });
      }
    }
  }

  return bindings;
}

const sum = (left: number[], right: number[]) => [
  ...new Set(left.flatMap((a) => right.map((b) => a + b))),
];

/** Each return branch must supply one landmark, including delegated shells. */
function landmarkCounts(
  input: SymbolTarget,
  injected: Bindings = new Map(),
  ancestry = new Set<string>(),
): number[] {
  const target = implementation(input);
  const key = `${target.file}#${target.name}`;

  if (ancestry.has(key)) {
    throw new Error(`Recursive render cannot be checked: ${key}`);
  }

  const nextAncestry = new Set([...ancestry, key]);
  const source = parse(target.file);
  const imports = importsFor(target.file);
  const locals = new Map<string, ts.Node>();

  const collect = (node: ts.Node) => {
    if (
      (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node))
      && node.name
      && ts.isIdentifier(node.name)
    ) {
      locals.set(node.name.text, node);
    }

    ts.forEachChild(node, collect);
  };

  collect(source);

  const selected
    = target.name === 'default'
      ? source.statements.find(
          (node) =>
            ts.canHaveModifiers(node)
            && ts
              .getModifiers(node)
              ?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword),
        )
      : locals.get(target.name);

  if (!selected) {
    throw new Error(`Cannot locate component body ${key}`);
  }

  const evaluate = (node: ts.Node | undefined): number[] => {
    if (!node) {
      return [0];
    }

    if (ts.isParenthesizedExpression(node) || ts.isJsxExpression(node)) {
      return evaluate(node.expression);
    }

    if (ts.isConditionalExpression(node)) {
      return [...evaluate(node.whenTrue), ...evaluate(node.whenFalse)];
    }

    if (
      ts.isBinaryExpression(node)
      && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      return [0, ...evaluate(node.right)];
    }

    if (ts.isIdentifier(node)) {
      const local = locals.get(node.text);

      return local && ts.isVariableDeclaration(local)
        ? evaluate(local.initializer)
        : [0];
    }

    if (ts.isJsxFragment(node)) {
      return node.children.reduce(
        (counts, child) => sum(counts, evaluate(child)),
        [0],
      );
    }

    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const name = opening.tagName.getText(source);
      const supplied = new Map(injected);
      let counts = name === 'main' ? [1] : [0];

      for (const attr of opening.attributes.properties) {
        if (
          !ts.isJsxAttribute(attr)
          || !attr.initializer
          || !ts.isJsxExpression(attr.initializer)
        ) {
          continue;
        }

        const value = attr.initializer.expression;

        if (value && ts.isIdentifier(value) && imports.has(value.text)) {
          supplied.set(attr.name.getText(source), imports.get(value.text)!);
        } else {
          counts = sum(counts, evaluate(value));
        }
      }

      const dependency
        = imports.get(name) ?? injected.get(name.split('.').at(-1)!);

      if (dependency) {
        counts = sum(
          counts,
          landmarkCounts(dependency, supplied, nextAncestry),
        );
      } else if (locals.has(name)) {
        counts = sum(counts, returns(locals.get(name)!));
      }

      return ts.isJsxElement(node)
        ? node.children.reduce(
            (total, child) => sum(total, evaluate(child)),
            counts,
          )
        : counts;
    }

    return [0];
  };

  const returns = (body: ts.Node): number[] => {
    const result: number[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isReturnStatement(node)) {
        result.push(...evaluate(node.expression));
      } else if (node === body || !ts.isFunctionLike(node)) {
        ts.forEachChild(node, visit);
      }
    };

    visit(body);

    return result.length ? result : [0];
  };

  return [...new Set(returns(selected))];
}

const STANDALONE_PAGES = (Object.keys(ROUTE_PATH) as Page[]).filter(
  isStandaloneSubApp,
);

describe('standalone routes bring their own main landmark', () => {
  it('has pages to check at all', () => {
    // `it.each([])` registers no cases and reports success, so a predicate that
    // stopped matching anything would turn this whole file into a green line
    // that checks nothing — the exact shape of the defect being closed.
    expect(
      STANDALONE_PAGES.length,
      'isStandaloneSubApp matched no route, so every case below was '
      + 'skipped',
    ).toBeGreaterThan(0);
  });

  it.each(STANDALONE_PAGES)(
    '%s renders exactly one main of its own',
    (page) => {
      const component = componentFor(page);
      const module = moduleFor(page, component);
      const reached = landmarkCounts(module);

      expect(
        reached,
        `${page} renders <${component}> (${relative(module.file)}). App.tsx supplies no <main> for `
        + ('a standalone route, so each possible return path must render '
          + 'one main: none leaves the ')
        + ('page with no landmark to jump to, two nests a <main> inside a '
          + '<main>.'),
      ).toEqual([1]);
    },
  );
});

describe('landmark scanner failure witnesses', () => {
  function withFixture(source: string, check: (target: SymbolTarget) => void) {
    const directory = fs.mkdtempSync(path.join(tmpdir(), 'mf-landmarks-'));
    const file = path.join(directory, 'Page.tsx');

    try {
      fs.writeFileSync(file, source);
      check({ file, name: 'default' });
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }

  it('detects a missing main and a nested second main', () => {
    withFixture(
      'export default function Page() { return <div />; }',
      (target) => expect(landmarkCounts(target)).toEqual([0]),
    );

    withFixture(
      'export default function Page() { return <main><main /></main>; }',
      (target) => expect(landmarkCounts(target)).toEqual([2]),
    );
  });

  it('checks alternate return branches independently', () => {
    withFixture(
      `export default function Page({ failed }) {
      if (failed) return <main>Failure</main>;
      return <main>Ready</main>;
    }`,
      (target) => expect(landmarkCounts(target)).toEqual([1]),
    );

    withFixture(
      `export default function Page({ failed }) {
      if (failed) return <div>Failure</div>;
      return <main>Ready</main>;
    }`,
      (target) => expect(landmarkCounts(target)).toEqual([0, 1]),
    );
  });

  it('fails instead of skipping an unresolved source component', () => {
    withFixture(
      `import Shell from './Missing';
      export default function Page() { return <Shell />; }`,
      (target) => expect(() => landmarkCounts(target)).toThrow('unresolved'),
    );
  });
});

describe('the disease radar while its board is still loading', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes exactly one main landmark before the data arrives', () => {
    // The scan above cannot tell RadarPage's two return paths apart: it sees
    // both `<main>`s in one file and would stay green if the loading branch
    // lost its own. That branch is what every visitor sees first, and on a slow
    // connection it is the whole page for several seconds.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );

    render(<RadarPage />);

    // Two-sided: the pending copy says this really is the loading path rather
    // than the board or the "no data" fallback, which have their own <main>.
    expect(screen.getByText('載入中')).toBeInTheDocument();
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});
