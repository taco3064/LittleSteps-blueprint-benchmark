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
comparison baseline. This branch contains the MF conversion using published Blueprint **4.2.0**.
See [the MF report](docs/MF_BENCHMARK.md) for architecture decisions, verification,
failures found and remaining limitations. The LF run is separate.

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
