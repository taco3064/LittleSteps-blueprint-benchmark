# LittleSteps Blueprint Benchmark

**English** · [繁體中文](README.zh-TW.md)

This repository is an independent [Blueprint](https://github.com/taco3064/blueprint)
validation project, forked from [LittleSteps](https://github.com/sean1093/LittleSteps)
by **[Sean Chou](https://github.com/sean1093)**. Thank you to [Sean Chou](https://github.com/sean1093) for agreeing to let us fork the project
for this benchmark. That permission does not imply that the original author
endorses, participates in, or recommends Blueprint. This is not an official
version of LittleSteps.

The benchmark will stress-test Blueprint's MF / LF folder-structure conversions
on a large, real-world application, keeping the original product code as the
comparison baseline on `master`. This branch performs the LF conversion; MF
remains at the common baseline.

Every configured rule uses `error`. Ratchets, inline suppressions, and increased
thresholds are prohibited. See the [LF report](docs/benchmark-lf-report.md) for
steps, tool provenance, and verification evidence.

## Benchmark branches

| Branch | Purpose |
| --- | --- |
| `master` | Preserve the original product code; add benchmark documentation only. |
| `benchmark/mf` | Hold the MF conversion results and verification evidence. |
| `benchmark/lf` | Hold the LF conversion results and verification evidence. |

Both benchmark branches share baseline `6bd4b1d98e971a290abf29423fb40ba5615264c4`.
The preserved product history traces back to
[`8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7`](https://github.com/sean1093/LittleSteps/commit/8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7).
**Never merge conversion results back into `master`.**

## Isolation and evidence

- Work only in this benchmark repository; do not modify the original repository.
- Preserve product behavior, data and tests during the LF refactor; add no new product requirements.
- Do not deploy to production or use the original project's production credentials.
- Preserve the original Git history, license materials, and attribution.
- For each future MF / LF run, record the exact Blueprint version, full baseline
  commit SHA, operation steps and commands, conversion results, and verification
  evidence (including failures and limitations) on the corresponding branch.
- Inherited deployment, release and data-refresh jobs are restricted to the upstream
  repository and cannot run in this fork.
- Verify with `npm ci`, `npm run check`, `npx vitest run`, and `npm run test:e2e`.
  Browser tests use explicit dummy Firebase settings; database-rule tests use a
  `demo-` emulator project.
