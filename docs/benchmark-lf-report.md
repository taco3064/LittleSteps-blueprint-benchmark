# LittleSteps LF 轉換驗證

本次只進行 LF。原始產品來自 [Sean Chou](https://github.com/sean1093) 的
[LittleSteps](https://github.com/sean1093/LittleSteps)；這是獨立的 Blueprint
驗證，不代表原作者參與或背書。`master`、`benchmark/mf` 與 upstream 不接收此轉換。

## 基準與工具

| 項目 | 固定值 |
| --- | --- |
| LF／MF 共同基準 | `6bd4b1d98e971a290abf29423fb40ba5615264c4` |
| 保留的 upstream commit | `8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7` |
| Blueprint 基礎版本 | `@kekkai/blueprint` 4.1.0 |
| 本次實際工具 | 4.1.0 加尚未發布的規則修正候選；不是 npm 已發布版本 |
| 修正來源 | [Blueprint PR #546](https://github.com/taco3064/blueprint/pull/546) |
| 工具來源 commit | `fc8e5efcb221af34d16543f8cec0f4fc2e16b812` |
| 工具來源 tree | `fb3469d12c6176ed4ddf179591cdd388f468cb1a` |
| 專案安裝來源 | `vendor/kekkai-blueprint-4.1.0-lf-fc8e5efcb221.tgz` |
| 套件 SHA-256 | `2df03785292acd6f6fbdfc3d22cc83919e639efb960ddfdbbe46daaf9156fcd4` |

`package.json` 使用本地 tarball，lockfile 固定 integrity；乾淨安裝不依賴工作目錄中
手動修改的 `node_modules`。套件由上述已獨立審查、通過正常提交 hook 的 source tree
執行 `npm run build` 與 `npm pack --ignore-scripts` 產生。未發布 npm、未合併 Blueprint main。

正式 4.1.0 的兩項限制在真實專案中造成誤判，修正在工具層完成：

- 組合 hook：追蹤真正被呼叫的本地／匯入函式，直到 React／Vue primitive binding；
  無法解析、遮蔽、重新賦值、循環、歧義或 type-only 路徑仍拒絕。
- 測試命名：預設 sibling 規則保留。明確開啟 aspect suffix，並宣告
  `test/contracts`、`test/integration`、`e2e/specs` 的套件分類與必要後綴。
  這些是持續檢查的分類規則，不是忽略清單。

## 轉換結果與強制規範

依序為 `pages → containers → components → hooks → contexts → services → domain`。
每個單元採資料夾與 `index` 入口；跨層使用 `~app`，同層相對匯入。
Provider 組裝、context 定義、消費 hook、Firebase IO、純領域運算各自歸屬其責任。
超大元件按既有職責拆分，參數改為有意義的物件；未增加產品功能或假 hook 呼叫。

所有啟用規則均為 **error**，沿用 preset 的上限：檔案 400 行、函式 100 行、
參數 3、statement 15、complexity 12、行寬 90。沒有提高門檻、棘輪、baseline、
suppression ledger、停用註解或產品檔案排除。ESLint 開啟 `noInlineConfig`，
lint 使用 `--max-warnings 0`。`npm run check` 與 pre-commit／CI 都要求完整通過。

Blueprint 架構網涵蓋 726／728 個 source files；框架入口 `src/main.tsx` 與型別宣告
`src/vite-env.d.ts` 位於網外，仍接受全專案 ESLint。17／17 optional gates 啟用，
import analysis 全部成功。`inspect` 的三項 ownership notes 不是 lint warning 或豁免。
生成文件中的通用 `--baseline` 建議由 AGENTS／CLAUDE 開頭的 benchmark 規範明確禁止。

原始 337 個 source 檔案的主要目的地見
[source-mapping.json](benchmark-evidence/source-mapping.json)。這不是逐檔位元相等聲明；
新增拆分單元與全部變更由 Git diff 記錄。

## 操作與驗證

1. 記錄共同基準，確認原始 lint／build 與 1,962 個單元測試通過。
2. 安裝 Blueprint、建立 LF 拓樸與 alias，將 advisory tiers 提升至 error。
3. 依既有責任移動與拆分程式，同步 mock、路徑掃描器及測試分類；保留資料內容。
4. 修復工具誤判，以正例、反例、邊界案例及真正 ESLint adopter 測試驗證，再固定 tarball。
5. 重新生成架構手冊與 agent contract，啟用完整提交／CI 檢查。
6. 執行下列檢查、獨立程式碼審查與前後畫面比對，再透過 PR 交付 `benchmark/lf`。

```sh
npm ci
npm run check
npx vitest run
npm run build
npx playwright install --with-deps chromium
CI=1 npm run test:e2e
npm run test:rules
```

`npm run build` 本身不部署；瀏覽器測試由 `playwright.config.ts` 使用假 Firebase 設定建置。
資料庫規則測試只使用 `demo-littlesteps` emulator。未使用正式憑證、未部署，
原有部署／release／資料更新 workflow 已限制 upstream repository 才能執行。

| 驗證 | 本機結果／證據 |
| --- | --- |
| TypeScript、lint、inspect、doctor | [check.log](benchmark-evidence/check.log)；lint 0 error／0 warning，doctor 全部通過 |
| 單元測試 | [unit-tests.json](benchmark-evidence/unit-tests.json)：1,963／1,963 通過（保留原 1,962 項，加 1 項 Git hook 隔離回歸） |
| 完整瀏覽器測試 | [e2e.log](benchmark-evidence/e2e.log)：252／252 通過 |
| 前後畫面 | 25 條路由 × 390／320 寬度，50 組 PNG SHA-256 與全文完全相同，100 次導航無 pageerror |
| 獨立審查 | 未發現產品語意回歸；在隔離複本移除 Radar main，兩項 landmark 契約測試確實失敗 |
| 資料庫規則 | [database-rules.log](benchmark-evidence/database-rules.log)：Java 21、demo emulator，145 通過／0 失敗 |
| 真實 CI | LF PR #3 目前尚未產生 Actions run，不能視為通過；以 exact-head CI 結果為合併門檻 |

畫面詳細條件與限制見 [視覺報告](benchmark-evidence/visual-REPORT.md)、
[比較結果](benchmark-evidence/visual-comparison.json) 與
[逐圖雜湊](benchmark-evidence/visual-results.json)。可重播：

```sh
node scripts/benchmarkVisual.cjs BASELINE_ROOT CANDIDATE_ROOT OUTPUT_DIR
```

兩版須先使用 E2E 假設定完成建置，安裝 Playwright Chromium 與 Noto Sans CJK TC 字型。
重播固定時鐘、阻擋外部網路、禁用 service worker，兩版一致等待 2,500ms。
原始首輪等待 800ms，LittleOuting 尾端卡片動畫未結束造成像素差；一致延長等待後相同，
未修改產品或遮蔽像素。截圖只涵蓋匿名初始畫面，其中 15 條登入門控路由顯示介紹頁；
不宣稱驗證登入後畫面、真實地圖底圖或正式 Firebase。互動由另外的 252 項 E2E 驗證。

## 已解決的驗證問題

轉換過程曾出現路徑掃描器使用舊路徑、拆分 JSX 空白改變、套件解析漂移，以及
Blueprint 規則／metadata 測試不同步。加強提交 hook 後另發現原有版本號 CLI 測試
繼承外層 Git 環境，已隔離所有 `GIT_` 子程序變數並新增回歸案例；遠端未受影響。均修復原因後重新驗證，沒有刪除測試或放寬規則。
舊失敗 checkpoint 不是最終結果；本目錄保留最終成功證據。套件修正仍須通過其
PR 的 deterministic／mutation CI，並另行完成正式發布流程，才能稱為已發布版本。

工具首輪 mutation CI 發現 37 個 Survived 與 5 個 Timeout；第二輪剩 8 個 Survived
與 1 個 Timeout。修正區分「沒有匯出」與「存在但無法解析的 binding」，避免 wildcard
匯出吞掉歧義；增加反例／邊界測試及有限迭代，並在既有循環測試中直接約束重複遍歷。
獨立審查重現真實漏洞、擋下範圍過大的 mutation 標記；最終修正已完全移除那兩處
標記，沒有新增 mutation 豁免或 lint 停用。231 項針對性測試與正常提交的完整檢查通過。
新版 authoritative CI：[run 38381932788](https://github.com/taco3064/blueprint/actions/runs/38381932788)，
對應上述 commit；mutation shard 最長 25 分鐘。此處不將進行中的 run 宣稱為成功。
