# LittleSteps Blueprint Benchmark

[English](README.md) · **繁體中文**

本儲存庫是獨立的 [Blueprint](https://github.com/taco3064/blueprint) 驗證專案，
fork 自 **[Sean Chou](https://github.com/sean1093)** 的 [LittleSteps](https://github.com/sean1093/LittleSteps)。
感謝 [Sean Chou](https://github.com/sean1093) 同意我們 fork 專案，供本次測試使用。這項同意不代表原作者認可、
參與、推薦或背書 Blueprint。本專案並非 LittleSteps 的官方版本。

本次 Benchmark 將以大型真實應用程式，對 Blueprint 的 MF / LF 資料夾結構轉換
進行壓力測試，並保留原始產品程式碼作為對照基準。本輪初始化只新增文件說明並
準備分支，尚未執行任何 MF / LF 轉換。

## Benchmark 分支

| 分支 | 用途 |
| --- | --- |
| `master` | 保留原始產品程式碼，只新增 Benchmark 文件說明。 |
| `benchmark/mf` | 存放 MF 轉換結果與驗證證據。 |
| `benchmark/lf` | 存放 LF 轉換結果與驗證證據。 |

兩條測試分支皆從 `master` 上的同一個初始化 commit 建立。
該 commit 的前一個 commit 為原始程式碼基準
[`8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7`](https://github.com/sean1093/LittleSteps/commit/8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7)。
**禁止將轉換結果合併回 `master`。**

## 測試隔離與證據紀錄

- 只在本 Benchmark 儲存庫作業，不修改原始儲存庫。
- 初始化不修改既有產品功能。
- 不部署至正式環境，也不使用原專案的正式環境憑證。
- 保留原始 Git 歷史、授權文件與作者資訊。
- 後續每次 MF / LF 測試，都必須在對應分支記錄確切的 Blueprint 版本、完整基準
  commit SHA、操作步驟與指令、轉換結果，以及驗證證據（包含失敗與限制）。
- 初始化 commit 使用 `[skip ci]`，避免觸發沿用自原專案的部署流程。這不是永久的
  部署防護：後續測試前，須先確保原有正式環境工作流程不會執行，並使用隔離的
  測試服務或模擬器。
