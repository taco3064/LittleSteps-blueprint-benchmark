# Blueprint 4.2.0 MF benchmark

本分支重新從 `master` 的 `6bd4b1d98e971a290abf29423fb40ba5615264c4` 建立；
儲存庫沒有 `main`。原始產品父提交為
`8e7e2c766cd421f8c8e919bbde1d86c8f4ffb0b7`。沒有沿用已刪除分支的轉換成果。
改造僅交付至 `benchmark/mf`，不合併回預設分支、不建立 PR、不部署正式環境。

## 套件與規則

- 使用 npm 正式套件 `@kekkai/blueprint@4.2.0`，精確版本與完整 integrity
  固定在 `package-lock.json`；沒有修改套件實作。
- 以 React preset 建立 MF 模組／分層，所有 preset 規則提升為 `error`，保留
  原門檻：每檔 400 行、函式 100 行／15 statements／12 complexity／3 params、
  行寬 90。額外啟用 `moduleDependencySync: error`。
- 使用 `emitLint` 的實際輸出，保留反繞過規則。沒有 suppression baseline、
  降級、私有入口豁免或額外排除產品程式碼。
- 加入純 `domain` 層及可執行禁令：禁止 UI、React 狀態／生命週期、瀏覽器、
  網路、路由與 Leaflet；components 禁止直接網路／路由操作。
- `npm run lint` 的 prelint 執行型別檢查，lint 單獨執行 ESLint，postlint
  執行 Inspect 與 Knip。單一 ESLint 入口讓 Doctor 能安全重播；沒有減少檢查。
- preset 的 dead-code 宣告不是完整機器證明。另以 Knip 的 `--files` 檢查
  不可達檔案；這不代表所有未使用 export 都已證明不存在。

## 責任與依賴

| 模組 | 責任 |
| --- | --- |
| platform | 產品中立的瀏覽器、Firebase、session、日期與顯示基礎設施；不依賴產品模組 |
| knowledge | 共用育兒參考資料與知識搜尋 |
| family | 家庭／孕期檔案、共同紀錄、資料存取政策 |
| portal | 產品目錄、入口政策、導覽及公開 metadata |
| account | 帳戶操作及帳戶／資料刪除順序 |
| feedback | 回饋與地點修正流程 |
| littlesteps | 嬰兒照護、成長、疫苗、試敏與日常紀錄 |
| littlebloom | 孕期與產檢流程 |
| littleexplorer | 幼兒發展、提醒與生活紀錄 |
| babyoasis | 哺乳室搜尋、地圖與地點互動 |
| littleouting | 親子地點與出遊流程 |
| littleguard | 疫情雷達與年齡／縣市篩選 |
| app | provider 與路由組裝 |

模組根目錄協調使用案例；components 呈現資料並回報意圖；hooks 管理狀態與
生命週期；contexts 提供情境；services 執行 IO；domain 保存純資料與政策。
每個 layer unit 經 `index.ts` 公開入口引用，專案別名為 `~app`。
實際直接依賴與 config 宣告須完全相符；相符不代表領域責任自動正確。
設定完整內容見 `blueprint.config.mjs`，生成契約見 `architecture-handbook.md`。

不把平台當成共用雜物箱：一般日曆函式放 platform，年齡／孕週政策留 family；
Outing 不因日期顯示依賴家庭業務。產品特有的時間表、試敏完成條件與雷達政策
均留在各自 domain。地圖 icon／繪製留在呈現層。

## 驗證方法與修復

原始 base 在獨立 worktree 建置並執行測試；候選採相同假 Firebase 環境、
Chromium 與手機尺寸。資料庫測試使用 `demo-littlesteps` emulator。

| 驗證 | 原始 base | MF 候選 |
| --- | --- | --- |
| Vitest | 1,962 tests／133 files 通過 | 1,999 tests／139 files 通過 |
| Playwright | 252 通過 | 最終修復後 252 通過 |
| Database rules | 145 通過 | 145 通過 |
| TypeScript／ESLint／Inspect／Knip | 原始配置 | 嚴格新配置全部通過 |
| 公開頁畫面 | 25 路由 × 390／320px | 50 組文字與 PNG 完全一致、0 page errors |

新增測試包含 executable architecture 的正反例、取消／確認行為、搜尋生命週期、
路由 landmark 掃描失敗見證、試敏 2→3／5→6／8→9 及今天已記錄的邊界。
保留原有行為案例；E2E 與產品來源同名共置，共用 `e2e/testFiles.ts` 讓兩個
runner 分工，沒有把瀏覽器案例當 Vitest 執行，也沒有以忽略來規避檔名規則。
參考資料稽核從實際 `domain/**/data.ts` 探索，保留未查證清單與非空斷言，
不固定舊來源目錄、不捏造日期。地點三份 JSON 與 baseline 深度比較無差異。

審查曾發現並修復：

- Feedback、Wiki、帳戶與地點回報元件仍協調 IO／導覽，移到模組工作流程。
- app 的照護提醒計數、portal 的入口判斷移到各自領域政策。
- 試敏追蹤元件仍決定九次完成、三次階段、今日記錄資格與排序；移至
  `littlesteps/domain/foodTrialProgress`，由元件呈現準備好的資料。
- 舊路徑稽核不能解析新公開入口；改為追蹤實際來源與具名匯出，加入能失敗的例子。
- 首輪 50 組畫面中 45 組 PNG 相同、46 組文字相同；About／CareGuide 的空白
  遺失與 Radar 文字節點分割均修正。另比較產出 CSS，發現 Tailwind class 被字串
  拆斷而漏產生 `max-h-[38vh]`、`focus:outline-none`，已恢復完整 class token。
- 一次重驗與 E2E 建置同時寫入 dist，產生空白截圖；整次結果不採用，等待建置
  結束後重新跑滿 50 組，文字與 PNG 全部一致並逐檔重算 SHA-256。

## 可重現指令

```sh
npm ci
npm run lint
npx tsc -p tsconfig.node.json
npx blueprint doctor --json
npx vitest run
npm run test:e2e
npm run test:rules
node scripts/benchmarkVisual.cjs ../baseline . /tmp/mf-visual
```

最後一項要求兩份 worktree 已用 `playwright.config.ts` 的假 Firebase 值建置，
安裝 Chromium／繁體中文字型，且 4181／4182 port 空閒。它固定時間、封鎖外部
網路，從路由 manifest 取樣並保留所有截圖雜湊與文字；不容許差異自動通過。

## 證據的邊界

Doctor 的 gate verdict 與語意結論須分開閱讀：可執行 carrier 驗證成功不代表
103 項責任／宣告都經機器證明。`source-unverified` 提醒來源語意仍需 review；
本輪以獨立來源碼審查及具體失敗見證補足，沒有把標題改寫成全面自動認證。
空 layer 的 runway、無引用的 preset 套件宣告也不算行為保護。

畫面與 E2E 主要覆蓋未登入公開狀態；不證明所有登入資料組合、真實 Firebase、
外部地圖服務或正式環境都沒有差異。沒有執行 Stryker，也沒有宣稱 mutation
coverage。原始與候選單元測試皆有 localhost:3000 fixture 連線診斷，測試結果
須看 assertion 與 exit code，而非把日誌無聲當正確。

本輪不是效能最佳化。初次比較的入口 JS 由 712,049 bytes 增至 813,661 bytes
（約 14.3%）；MF 公開入口與 chunk 組裝有成本，不能宣稱載入效能提升。
最終產物大小與驗證摘要另存 `benchmark/mf/evidence.json`。
遠端 exact-head CI 必須在 push 後核對；本檔的本地通過不能代替遠端綠燈。
