# LittleSteps Blueprint Benchmark

[English](README.md) · **繁體中文**

本儲存庫是獨立的 [Blueprint](https://github.com/taco3064/blueprint) 驗證專案，
fork 自 **[Sean Chou](https://github.com/sean1093)** 的 [LittleSteps](https://github.com/sean1093/LittleSteps)。
感謝 [Sean Chou](https://github.com/sean1093) 同意我們 fork 專案，供本次測試使用。這項同意不代表原作者認可、
參與、推薦或背書 Blueprint。本專案並非 LittleSteps 的官方版本。

本次 Benchmark 將以大型真實應用程式，對 Blueprint 的 MF / LF 資料夾結構轉換
進行壓力測試，並在 `master` 保留原始產品程式碼作為對照基準。
本分支進行 LF 轉換；MF 分支仍保留共同基準。

LF 的規則全部使用 `error`，禁止棘輪、停用註解與提高門檻。
操作紀錄、工具版本與驗證證據見 [LF 測試報告](docs/benchmark-lf-report.md)。

## Benchmark 分支

| 分支 | 用途 |
| --- | --- |
| `master` | 保留原始產品程式碼，只新增 Benchmark 文件說明。 |
| `benchmark/mf` | 存放 MF 轉換結果與驗證證據。 |
| `benchmark/lf` | 存放 LF 轉換結果與驗證證據。 |

兩條測試分支的共同基準為 `6bd4b1d98e971a290abf29423fb40ba5615264c4`。
保留的原始產品歷史可追溯至
[`8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7`](https://github.com/sean1093/LittleSteps/commit/8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7)。
**禁止將轉換結果合併回 `master`。**

## 測試隔離與證據紀錄

- 只在本 Benchmark 儲存庫作業，不修改原始儲存庫。
- LF 重構保留既有產品功能、資料與測試，不加入新的產品需求。
- 不部署至正式環境，也不使用原專案的正式環境憑證。
- 保留原始 Git 歷史、授權文件與作者資訊。
- 後續每次 MF / LF 測試，都必須在對應分支記錄確切的 Blueprint 版本、完整基準
  commit SHA、操作步驟與指令、轉換結果，以及驗證證據（包含失敗與限制）。
- 此分支已限制原有部署、發布與資料更新流程只能在原始儲存庫執行；本 fork 不會執行。
- 執行 `npm ci`、`npm run check`、`npx vitest run` 與 `npm run test:e2e` 驗證。
  瀏覽器測試使用明確的假 Firebase 設定，資料庫規則測試使用 `demo-` 模擬器。
