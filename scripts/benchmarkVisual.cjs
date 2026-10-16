/**
 * Usage: node scripts/benchmarkVisual.cjs BASELINE_ROOT CANDIDATE_ROOT OUTPUT_DIR
 * Both roots must already have dist built with playwright.config.ts dummy env.
 * Install candidate Playwright Chromium and a Traditional Chinese system font.
 * Ports 4181/4182 must be free. No production credentials or deployment required.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { createRequire } = require('node:module');

function argumentsForRun() {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    throw new Error('Usage: benchmarkVisual.cjs BASELINE_ROOT CANDIDATE_ROOT OUTPUT_DIR');
  }
  const [baseline, candidate, output] = args.map((value) => path.resolve(value));
  if (baseline === candidate) throw new Error('Baseline and candidate must differ');
  for (const root of [baseline, candidate]) {
    if (!fs.existsSync(path.join(root, 'dist/index.html'))) {
      throw new Error(`Missing prebuilt dist/index.html: ${root}`);
    }
  }
  fs.mkdirSync(output, { recursive: true });
  return { baseline, candidate, output };
}

function routeManifest(root, ts) {
  const filename = path.join(root, 'src/portal/domain/routes/routes.ts');
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest, true);
  const statement = source.statements.find((node) => ts.isVariableStatement(node)
    && node.declarationList.declarations.some((entry) => entry.name.getText() === 'ROUTE_PATH'));
  const declaration = statement?.declarationList.declarations.find(
    (entry) => entry.name.getText() === 'ROUTE_PATH',
  );
  const initializer = declaration?.initializer;
  const object = initializer && ts.isAsExpression(initializer)
    ? initializer.expression : initializer;
  if (!object || !ts.isObjectLiteralExpression(object)) {
    throw new Error('Cannot read ROUTE_PATH object');
  }
  return object.properties.map((entry) => {
    if (!ts.isPropertyAssignment(entry) || !ts.isStringLiteral(entry.initializer)) {
      throw new Error('ROUTE_PATH must contain string-valued properties');
    }
    return [entry.name.text, entry.initializer.text];
  });
}

function startServer(root, port, output) {
  const requireRoot = createRequire(path.join(root, 'package.json'));
  const vite = path.join(path.dirname(requireRoot.resolve('vite/package.json')), 'bin/vite.js');
  const log = fs.openSync(path.join(output, `preview-${port}.log`), 'w');
  const server = spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1',
    '--port', String(port), '--strictPort'], { cwd: root, stdio: ['ignore', log, log] });
  fs.closeSync(log);
  server.on('error', (error) => { server.startError = error; });
  return server;
}

async function waitForServer(server, port) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.startError) throw server.startError;
    if (server.exitCode !== null) throw new Error(`Preview ${port} exited`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.ok) return;
    } catch { /* Preview may still be starting; bounded readiness polling. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Preview ${port} did not become ready`);
}

async function configurePage(page, evidence) {
  page.on('pageerror', (error) => evidence.errors.push(error.message));
  await page.route('**/*', (request) => {
    const url = new URL(request.request().url());
    if (url.hostname === '127.0.0.1') return request.continue();
    evidence.blocked.push(url.hostname);
    return request.abort('blockedbyclient');
  });
  await page.clock.setFixedTime(new Date('2026-04-15T04:00:00Z'));
}

async function capturePage(page, details) {
  const { label, width, name, route, port, output } = details;
  const evidence = { errors: [], blocked: [] };
  await configurePage(page, evidence);
  await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500);
  const file = `${label}-${width}-${name.replaceAll('/', '_')}.png`;
  const png = await page.screenshot({ path: path.join(output, file),
    fullPage: true, animations: 'disabled' });
  return { label, width, name, route, file,
    sha256: crypto.createHash('sha256').update(png).digest('hex'),
    size: [png.readUInt32BE(16), png.readUInt32BE(20)],
    errors: evidence.errors, blocked: [...new Set(evidence.blocked)],
    text: await page.locator('body').innerText() };
}

async function captureContext(browser, options) {
  const context = await browser.newContext({ ...options.device,
    viewport: { width: options.width, height: 844 }, serviceWorkers: 'block' });
  try {
    return await capturePage(await context.newPage(), options);
  } finally {
    await context.close();
  }
}

function saveJson(output, filename, value) {
  fs.writeFileSync(path.join(output, filename), `${JSON.stringify(value, null, 2)}\n`);
}

async function captureAll(browser, options) {
  const results = [];
  for (const width of [390, 320]) {
    for (const [name, route] of options.routes) {
      for (const [label, port] of [['baseline', 4181], ['candidate', 4182]]) {
        results.push(await captureContext(browser,
          { ...options, width, name, route, label, port }));
        saveJson(options.output, 'results.json', results);
        console.log(`${label} ${width} ${route}`);
      }
    }
  }
  return results;
}

function compare(results) {
  return results.filter((row) => row.label === 'candidate').map((after) => {
    const before = results.find((row) => row.label === 'baseline'
      && row.width === after.width && row.name === after.name);
    if (!before) throw new Error(`Missing baseline for ${after.name}`);
    return { width: after.width, route: after.route,
      identical: before.sha256 === after.sha256,
      sameText: before.text === after.text,
      beforeSize: before.size, afterSize: after.size,
      pageErrors: [...before.errors, ...after.errors] };
  });
}

async function runBrowser(options) {
  const requireCandidate = createRequire(path.join(options.candidate, 'package.json'));
  const { chromium, devices } = requireCandidate('playwright');
  const routes = routeManifest(options.candidate, requireCandidate('typescript'));
  if (routes.length !== 25) throw new Error(`Expected 25 routes, received ${routes.length}`);
  const browser = await chromium.launch({ headless: true });
  try {
    const results = await captureAll(browser,
      { ...options, routes, device: devices['Pixel 5'] });
    const comparison = compare(results);
    saveJson(options.output, 'comparison.json', comparison);
    if (comparison.some((row) => !row.identical || !row.sameText || row.pageErrors.length)) {
      throw new Error('Visual comparison failed; inspect results.json and comparison.json');
    }
    console.log(`PASS: ${comparison.length} identical screenshot pairs, no page errors`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = argumentsForRun();
  const servers = [startServer(options.baseline, 4181, options.output),
    startServer(options.candidate, 4182, options.output)];
  const stop = () => servers.forEach((server) => server.kill());
  process.once('exit', stop);
  try {
    await Promise.all(servers.map((server, index) => waitForServer(server, 4181 + index)));
    await runBrowser(options);
  } finally {
    stop();
    process.removeListener('exit', stop);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
