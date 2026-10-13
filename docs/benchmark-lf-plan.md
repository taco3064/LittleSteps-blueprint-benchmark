# LF benchmark implementation plan

Baseline: 6bd4b1d98e971a290abf29423fb40ba5615264c4. Blueprint base: npm 4.1.0. Exact unreleased rule-repair candidate and artifact digest: see benchmark-lf-report.md.
Baseline verification: lint/build pass; Vitest 133 files / 1962 tests pass.

## Contract

- Deliver via a pull request targeting benchmark/lf; master and benchmark/mf remain the control.
- Use React LF preset, folder units and index entries; domain is a lower pure-policy/data layer.
- Keep all applicable preset rules; elevate advisory tiers to error using the preset thresholds.
- No baseline, suppressions, inline disable, business-file exclusion, higher thresholds, or rule relaxation.
- Retain product behavior, data values, test coverage and public routes. Extract from source, not memory.
- Separate provider composition, context definition, consuming hooks, and network IO.
- Keep inherited deployment/release/data-refresh jobs disabled on the benchmark fork.

## Work

1. Complete semantic LF placement and entry imports.
2. Correct component/feature decomposition and pure helper units to satisfy strict metrics.
3. Preserve and relocate tests, then verify typecheck, lint, inspect, doctor, unit, build and browser checks.
4. Publish LF commits with durable source mapping and verification evidence. Never merge into master.

## Verification risks

- Path-sensitive existing tests and mocks must follow moved ownership without weakening assertions.
- Published 4.1.0 cannot follow delegated hooks. Repair the rule with binding-aware evidence; do not add fake direct hook calls.
- Published 4.1.0 requires exact sibling test stems. Preserve every test through explicit, validated suite classification; never exclude suites.
- No test passing locally is evidence that GitHub Actions ran.
- Any impossible or semantically harmful rule collision must be reported, not silenced.
