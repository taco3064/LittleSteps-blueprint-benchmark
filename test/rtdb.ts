/**
 * Apply one `update()` payload to an in-memory record with the semantics of
 * Realtime Database, so a test can replay what two caregivers wrote and look
 * at what the database would hold afterwards.
 *
 * Every key of the payload is a path. The node at that path is replaced whole,
 * `null` deletes it, and nothing the payload does not name is touched. Two
 * details of the real store are reproduced on purpose:
 *
 * - An array on the way down becomes an index-keyed object, which is how the
 *   database stores one. It is what lets a legacy `trialDates` array grow a
 *   date key beside its indices and come back as a mixed object.
 * - A node left with no children ceases to exist, so a `percentile: {}` or a
 *   `trialDates` whose last date was removed reads back as absent.
 */
export function applyUpdatePaths<T extends object>(record: T, paths: Record<string, unknown>): T {
  const next = JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
  for (const [path, value] of Object.entries(paths)) {
    const segments = path.split('/');
    let node = next;
    for (const segment of segments.slice(0, -1)) {
      node[segment] = { ...(node[segment] as Record<string, unknown> | undefined) };
      node = node[segment] as Record<string, unknown>;
    }
    const leaf = segments[segments.length - 1];
    if (value === null) delete node[leaf];
    else node[leaf] = JSON.parse(JSON.stringify(value));
  }
  return pruneEmpty(next) as T;
}

function pruneEmpty(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  const entries = Object.entries(value)
    .map(([key, child]) => [key, pruneEmpty(child)] as const)
    .filter(([, child]) => child !== undefined);
  if (entries.length === 0) return undefined;
  return Array.isArray(value) ? entries.map(([, child]) => child) : Object.fromEntries(entries);
}
