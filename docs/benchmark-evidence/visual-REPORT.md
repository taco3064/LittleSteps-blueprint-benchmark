# LF 視覺回歸驗證

- 原始版本：`6bd4b1d98e971a290abf29423fb40ba5615264c4`，隔離 worktree `/tmp/lf-visual-baseline`。
- 候選版本：`/tmp/littlesteps-lf-final` 的 source 快照，逐檔 SHA-256 見 `candidate-source-sha256.json`。
- 原始版本使用其 lockfile 執行乾淨 `npm ci --ignore-scripts`。兩版 `npm run build` 均成功；編譯紀錄附於此目錄。
- 使用 Playwright 1.56.0 / Chromium Headless Shell 141.0.7390.37 (1194)、Pixel 5 設定，390×844 與320×844、Noto Sans CJK TC 系統字型。
- 兩版均使用專案 E2E 的 dummy Firebase 設定，App Check 空值；所有非 localhost 請求皆中止，service worker 關閉，未登入。無正式環境憑證與部署。
- 固定時鐘 `2026-04-15T04:00:00Z`，保留計時器供動畫完成；截圖等網路閒置、字型載入與進場動畫。
- 依來源 `ROUTE_PATH` 取得全部25條路由，兩種寬度，共100張全頁圖、50組前後比較。公開內容10條，其餘15條驗證匿名訪客看到的介紹頁，不宣稱已驗證登入後產品畫面。

## 結果

**50/50組PNG SHA-256完全相同，50/50組全文相同，兩版本共100次導航均無pageerror。**

最終雜湊結果見 `comparison.json`，逐圖雜湊、body text、pageerror與阻擋的外部主機見 `results.json`。

人工檢視首頁全文，以及390與320寬度的首頁、關於資料、照護重點、孕期知識庫、幼兒百科、親子好去處、哺乳室地圖、疫情雷達首屏：中文字可讀、卡片與按鈕布局無新增異常。部分標題本來便有省略號，橫向分類條保留可捲動內容；地圖底圖刻意被網路隔離中止，地圖群聚標記仍顯示。

首輪LittleOuting兩種寬度的全頁圖尾端有像素差，其尺寸與全文相同；首屏及其餘路由相同。該頁有逐卡延遲進場動畫，800毫秒等待未涵蓋所有卡片，改為兩版一致等待2500毫秒後重新比較。原始差異圖保留於 `initial-*littleouting.png`，未修改產品或遮蔽像素。

## 限制

此證據針對匿名初始渲染；互動、登入後畫面、真實地圖底圖、正式 Firebase 行為不在此驗證範圍。完整E2E由主代理另執行。未執行遠端CI，因此不能宣稱CI通過。
