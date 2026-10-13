'use strict';

/**
 * `nextVersion.cjs` decides what every merge's tag is called. Getting it wrong
 * is invisible: a wrong number is still a valid tag, the release still
 * publishes, and nothing anywhere goes red — it just stops matching what
 * shipped.
 *
 * The first version of these tests passed while the workflow was broken,
 * because the CLI case fed `messages.join('\0')` — a shape `git log` never
 * emits. So the CLI cases here drive the script from **real `git log` output**
 * over a fixture repository, and the multi-commit case deliberately puts the
 * `feat:` somewhere other than the newest position, which is the one place the
 * old bug could not hide.
 *
 * CommonJS, next to the file under test; `describe` / `it` / `expect` come from
 * `test.globals: true` in vitest.config.ts.
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { bumpOfCommit, bumpOf, nextVersion, FIRST_VERSION } = require('./nextVersion.cjs');

const SCRIPT = path.join(__dirname, 'nextVersion.cjs');

/** Sampled from squash subjects this repo has actually merged. */
const REAL_SUBJECTS = {
  feat: 'feat: add a share code a family member can join with',
  fix: 'fix: let the repeat buttons size to their labels instead of spilling',
  docs: 'docs: adopt an E2E test plan and case catalogue (#54)',
  test: 'test: cover routing, the auth gate and the crawl boundary (#64)',
  refactor: 'refactor: one vocabulary per enum, one place per derived label (#53)',
  chore: 'chore(e2e): close the gaps Phase 1 left in its own infrastructure (#67)',
};

describe('bumpOfCommit', () => {
  it('treats feat as minor and everything else as patch', () => {
    expect(bumpOfCommit(REAL_SUBJECTS.feat)).toBe('minor');
    expect(bumpOfCommit(REAL_SUBJECTS.fix)).toBe('patch');
    expect(bumpOfCommit(REAL_SUBJECTS.docs)).toBe('patch');
    expect(bumpOfCommit(REAL_SUBJECTS.test)).toBe('patch');
    expect(bumpOfCommit(REAL_SUBJECTS.refactor)).toBe('patch');
    expect(bumpOfCommit(REAL_SUBJECTS.chore)).toBe('patch');
  });

  it('reads the ! before the colon, with or without a scope', () => {
    expect(bumpOfCommit('feat!: drop the LocalStorage guest mode')).toBe('major');
    expect(bumpOfCommit('refactor(auth)!: require sign-in for the care guide')).toBe('major');
  });

  it('does not read a ! that is only in the description', () => {
    // An exclamation in prose is not a declaration, and reading it as one burns
    // a major version.
    expect(bumpOfCommit('fix: stop the timeline wrapping at 320px!')).toBe('patch');
  });

  it('survives leading whitespace, which is how git log -z hands messages over', () => {
    // The bug this file exists to prevent: a message whose first line is blank
    // scored patch, so every commit but the newest was misread.
    expect(bumpOfCommit('\nfeat: add a share code')).toBe('minor');
    expect(bumpOfCommit('\n\nfeat!: drop guest mode')).toBe('major');
  });

  it('is not fooled by a capitalised type', () => {
    expect(bumpOfCommit('Feat: add a share code')).toBe('minor');
  });

  it('reads BREAKING CHANGE from the footer, in both spellings', () => {
    expect(bumpOfCommit('feat: move the logs\n\nBREAKING CHANGE: childRecords moved')).toBe('major');
    expect(bumpOfCommit('feat: move the logs\n\nBREAKING-CHANGE: childRecords moved')).toBe('major');
  });

  it('does not read a BREAKING CHANGE that is only quoted mid-line', () => {
    expect(bumpOfCommit('docs: explain what BREAKING CHANGE: means here')).toBe('patch');
  });

  it('reads a breaking footer sitting above this repo\'s commit trailers', () => {
    // Every commit here ends with these two lines. An earlier version matched
    // only the last paragraph, so the declaration above them was unreachable
    // and every real breaking change scored a level too low.
    const message = [
      'feat: move the logs out of the child node',
      '',
      'BREAKING CHANGE: childRecords moved out of children/$childId',
      '',
      'Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>',
      'Claude-Session: https://claude.ai/code/session_01',
    ].join('\n');

    expect(bumpOfCommit(message)).toBe('major');
  });

  it('reads a breaking footer above a squash body\'s attribution footer', () => {
    // What the workflow actually sees on master: the body is the pull request
    // description, which ends with the Claude Code footer and a session URL.
    const message = [
      'feat: move the logs out of the child node (#42)',
      '',
      'The profile listener downloads the whole node, so every diaper entry',
      're-sent the child\'s entire history to every family member.',
      '',
      'BREAKING CHANGE: childRecords moved out of children/$childId',
      '',
      '🤖 Generated with [Claude Code](https://claude.com/claude-code)',
      '',
      'https://claude.ai/code/session_01',
    ].join('\n');

    expect(bumpOfCommit(message)).toBe('major');
  });

  it('falls back to patch for a subject that is not conventional at all', () => {
    // Better to under-bump than to stall the whole batch on an unreadable line.
    expect(bumpOfCommit('Merge master into e2e/wiki-rwd-pwa')).toBe('patch');
    expect(bumpOfCommit('')).toBe('patch');
  });
});

describe('bumpOf', () => {
  it('takes the highest bump in the batch, not the last', () => {
    expect(bumpOf([REAL_SUBJECTS.docs, REAL_SUBJECTS.feat, REAL_SUBJECTS.fix])).toBe('minor');
    expect(bumpOf([REAL_SUBJECTS.feat, 'fix!: rename the share code field'])).toBe('major');
  });

  it('is patch when there is nothing to read', () => {
    expect(bumpOf([])).toBe('patch');
  });
});

describe('nextVersion', () => {
  it('starts at the first version when no tag exists yet', () => {
    expect(nextVersion('', [REAL_SUBJECTS.feat])).toBe(FIRST_VERSION);
    expect(nextVersion(undefined, [REAL_SUBJECTS.fix])).toBe(FIRST_VERSION);
  });

  it('applies each bump to the previous tag', () => {
    expect(nextVersion('v0.4.2', [REAL_SUBJECTS.fix])).toBe('0.4.3');
    expect(nextVersion('v0.4.2', [REAL_SUBJECTS.feat])).toBe('0.5.0');
    expect(nextVersion('v1.4.2', ['feat!: drop guest mode'])).toBe('2.0.0');
  });

  it('resets the lower fields, rather than carrying them', () => {
    expect(nextVersion('v0.4.9', [REAL_SUBJECTS.feat])).toBe('0.5.0');
    expect(nextVersion('v1.4.9', ['feat!: drop guest mode'])).toBe('2.0.0');
  });

  it('keeps a breaking change inside 0.x instead of declaring 1.0.0', () => {
    // Reaching 1.0.0 declares stability, which is a product decision.
    expect(nextVersion('v0.4.2', ['feat!: drop guest mode'])).toBe('0.5.0');
  });

  it('rejects a tag it cannot parse rather than guessing', () => {
    // Guessing would carry the mistake forward from then on.
    expect(() => nextVersion('0.4.2', [])).toThrow(/not a version tag/);
    expect(() => nextVersion('v1.2', [])).toThrow(/not a version tag/);
    expect(() => nextVersion('v01.2.3', [])).toThrow(/not a version tag/);
  });
});

/**
 * The CLI is what the workflow actually runs, so these cases build a real
 * repository and pipe real `git log` output through the script. Anything less
 * tests a shape git does not produce — which is exactly how the first version
 * of this file passed while the pipeline was broken.
 *
 * Every case here spawns six or more processes: `git init`, a `git commit` per
 * message, sometimes `git tag`, then `git log` and `node`. Vitest allows a
 * test 5 s, which is generous for a pure function and not always enough for
 * that — on a machine that is also building, or running several suites at
 * once, these time out one after another while the behaviour they check has
 * not moved. A suite that goes red because the machine is busy is a suite
 * people learn to ignore, so the limit here matches the work rather than the
 * default. It applies to the whole file; the pure cases above finish in
 * milliseconds and never come near it.
 */
vi.setConfig({ testTimeout: 30_000 });

describe('the CLI contract, against real git log output', () => {
  let repo;

  const git = (...args) =>
    execFileSync('git', args, {
      cwd: repo,
      env: Object.fromEntries(Object.entries(process.env)
        .filter(([key]) => !key.startsWith('GIT_'))),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

  const commit = (message) => {
    fs.appendFileSync(path.join(repo, 'log.txt'), `${message}\n`);
    git('add', '-A');
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-m', message);
  };

  /** The exact pipeline in .github/workflows/release.yml. */
  const release = (latestTag) => {
    const range = latestTag ? `${latestTag}..HEAD` : 'HEAD';
    const log = git('log', '-z', '--format=%B', range);
    return execFileSync('node', [SCRIPT, latestTag], { input: log, encoding: 'utf8' });
  };

  beforeEach(() => {
    repo = fs.mkdtempSync(path.join(os.tmpdir(), 'nextversion-'));
    git('init', '-q', '-b', 'master');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(repo, { recursive: true, force: true });
  });

  it('keeps hook Git settings outside the fixture repository', () => {
    vi.stubEnv('GIT_DIR', path.join(repo, 'foreign.git'));
    vi.stubEnv('GIT_WORK_TREE', path.join(repo, 'foreign-tree'));
    vi.stubEnv('GIT_INDEX_FILE', path.join(repo, 'foreign-index'));
    commit(REAL_SUBJECTS.feat);
    git('tag', 'v0.4.2');
    commit(REAL_SUBJECTS.fix);

    expect(git('rev-parse', '--show-toplevel').trim()).toBe(repo);
    expect(release('v0.4.2')).toBe('0.4.3');
    expect(fs.existsSync(path.join(repo, 'foreign.git'))).toBe(false);
    expect(fs.existsSync(path.join(repo, 'foreign-tree'))).toBe(false);
    expect(fs.existsSync(path.join(repo, 'foreign-index'))).toBe(false);
  });

  it('prints the bare version, with no v and no trailing newline', () => {
    // The workflow interpolates this straight into `v$VERSION`, so a newline
    // would produce a tag name with a newline in it.
    commit(REAL_SUBJECTS.feat);
    git('tag', 'v0.4.2');
    commit(REAL_SUBJECTS.fix);

    expect(release('v0.4.2')).toBe('0.4.3');
  });

  it('finds a feat that is not the newest commit in the range', () => {
    // The regression case. `git log --format=%B%x00` gave every entry after the
    // first a leading newline, so this returned 0.4.3 while claiming to read
    // the whole range.
    commit(REAL_SUBJECTS.chore);
    git('tag', 'v0.4.2');
    commit(REAL_SUBJECTS.feat);
    commit(REAL_SUBJECTS.docs);
    commit(REAL_SUBJECTS.fix);

    expect(release('v0.4.2')).toBe('0.5.0');
  });

  it('finds a breaking change that is not the newest commit either', () => {
    commit(REAL_SUBJECTS.chore);
    git('tag', 'v1.4.2');
    commit('feat!: drop the LocalStorage guest mode');
    commit(REAL_SUBJECTS.docs);

    expect(release('v1.4.2')).toBe('2.0.0');
  });

  it('keeps a multi-line body attached to its own subject', () => {
    // A body line that would parse as its own subject if the messages were
    // split on newlines instead of NUL. Detached, `feat:` would score minor;
    // attached, this whole commit is a docs patch.
    commit(REAL_SUBJECTS.chore);
    git('tag', 'v1.0.0');
    commit('docs: note the release plan\n\nfeat: this line is body, not a subject');

    expect(release('v1.0.0')).toBe('1.0.1');
  });

  it('reads the older --format=%B%x00 shape identically', () => {
    // The release workflow uses `git log -z`, and these cases mirror it — so a
    // workflow edited back to `--format=%B%x00` would not fail them. That shape
    // terminates every entry with its own newline, which is what broke this
    // script the first time. Pin the tolerance here rather than trusting the
    // workflow to keep saying `-z`.
    commit(REAL_SUBJECTS.chore);
    git('tag', 'v0.4.2');
    commit(REAL_SUBJECTS.feat);
    commit(REAL_SUBJECTS.docs);

    const log = git('log', '--format=%B%x00', 'v0.4.2..HEAD');
    const version = execFileSync('node', [SCRIPT, 'v0.4.2'], { input: log, encoding: 'utf8' });

    expect(version).toBe('0.5.0');
  });

  it('returns the first version when the repository has no tags', () => {
    commit(REAL_SUBJECTS.fix);

    expect(release('')).toBe(FIRST_VERSION);
  });

  it('is a patch when the range is empty, which is a re-run', () => {
    // The workflow must not act on this: see the already-tagged guard there.
    commit(REAL_SUBJECTS.feat);
    git('tag', 'v0.4.2');

    expect(release('v0.4.2')).toBe('0.4.3');
  });
});
