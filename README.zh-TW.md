# LittleSteps Blueprint Benchmark

[English](README.md) · **繁體中文**

本儲存庫是獨立的 [Blueprint](https://github.com/taco3064/blueprint) 驗證專案，
fork 自 **Sean Chou** 的 [LittleSteps](https://github.com/sean1093/LittleSteps)。
感謝 Sean Chou 同意我們 fork 專案，供本次測試使用。這項同意不代表原作者認可、
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

## 原始專案文件

以下完整保留原作者的產品文件與使用說明。線上版連結、徽章、部署指示，以及
貢獻與發版流程皆屬於原始專案，不代表本 Benchmark 獲准存取或部署正式環境。
進行 Benchmark 作業時，以上測試隔離規則優先適用。

---

# LittleSteps

[English](README.md) · **繁體中文**

> 六個服務，陪台灣的爸媽從懷孕一路走到幼兒期。
> 一個 mobile-first 的 PWA，涵蓋孕期、寶寶的第一年、幼兒階段、出門在外要找
> 地方餵奶時該去哪，以及這禮拜你住的縣市正在流行什麼。

<div align="center">

[![Deploy to Firebase Hosting](https://github.com/sean1093/LittleSteps/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/sean1093/LittleSteps/actions/workflows/firebase-hosting-merge.yml)

[線上版](https://littlesteps-c6ab6.web.app) · [問題回報](https://github.com/sean1093/LittleSteps/issues)

</div>

---

## 六個服務

`/#/` 這個入口頁列出六個服務。它們共用一套設計系統、一套登入授權模型和一層
資料層；各自保有自己的配色與導覽形狀。

入口頁把六個服務照下表的「階段」分成兩組，因為兩半不是同一種東西：三個跟著
孩子的年齡走，一個家庭一次只用得到一個；另外三個不分年齡，而且完全公開。家長
在那一頁的第一個問題是「哪一個是我的」，所以由組標題回答，而不是丟六列等寬的
卡片讓人逐列讀完。

| | 服務 | 階段 | 導覽 |
|---|---|---|---|
| 🌸 | **LittleBloom** | 孕期 · 第 0-40 週 | 中心頁 + 返回鍵 |
| 🍼 | **LittleSteps** | 新生兒 · 0-12 個月 | 側邊欄，12 條路由 |
| ☀️ | **LittleExplorer** | 幼兒 · 1-3 歲 | 4 個底部分頁 |
| 🌳 | **LittleOuting** | 不限 | 頁內 3 個分頁 |
| 📍 | **BabyOasis** | 不限 | 全螢幕地圖 |
| 🛡️ | **LittleGuard** | 不限 | 單一看板 + 抽屜 |

### LittleBloom — 孕期陪伴
- **每週孕期指南** — 逐週的身體變化，以及該注意什麼
- **產檢時程** — 14 次公費產檢，可記下日期與院所
- **孕期知識庫** — 25 篇文章：原因、該怎麼做、什麼時候要就醫，含「孕期該打哪些疫苗」：流感、Tdap、COVID-19 與孕婦 RSV 疫苗，各自的公費/自費狀態，以及 Tdap 的施打週數與理由
- **登記出生** — 把孕期檔案轉成寶寶檔案，一個家庭就是靠這一步從 LittleBloom 走到 LittleSteps

### LittleSteps — 寶寶成長追蹤
- **成長總覽** — 一個畫面總結里程碑、疫苗、睡眠、尿布與飲食
- **里程碑追蹤** — 33 個里程碑，涵蓋身體、動作、認知與餵食
- **疫苗追蹤** — 依衛福部時程的 36 劑（21 劑公費、1 劑健保有條件給付、14 劑自費），
  每一劑都標明出處的疾管署頁面，附副作用與緊急處理指引。已公告未來會改變公費身分的
  劑次會直接寫出改變日期，日期過了而該列還寫舊狀態時，測試就會紅
- **公費，但只給名單上的孩子** — 那 21 劑公費裡有一劑是高危險群幼兒出生滿 6 個月
  可增加接種的 13 價肺炎鏈球菌。這一劑帶著疾管署寫的條件，所以疫苗頁與行事曆匯出
  都看得到它，但它永遠不算「欠的」：不進提醒清單、不會變成「下一劑」，也不算進
  「還有幾劑公費疫苗沒記錄」。每個家庭都看得到，沒有家庭被告知自己落後。唯一會主動
  響的地方是行事曆匯出——匯出的每個事件都帶提前一週的提醒，這一劑也不例外，條件寫在
  事件內容裡
- **匯出行事曆** — 把還沒接種的劑次匯成 ICS：一鍵匯出全部，或單獨匯出一劑。每個事件
  都寫出劑次名稱、屬於哪一種給付方式（公費、健保有條件給付、自費、各縣市不同）、建議
  接種期間，並提前一週提醒
- **下一劑** — 首頁卡片與看診摘要只認公費常規時程，由同一個實作決定，並排除孩子已經
  超出補接種範圍的劑次，所以自費或健保有條件給付的劑次都不會被當成「下一劑」。沒有
  下一劑時卡片仍然給得出數字，不會安靜下來：還有幾劑公費疫苗沒有記錄，或是公費一劑
  不欠之後，還有幾劑不在公費常規時程內（部分有年齡上限，未必還來得及）— 只給數量與
  可得性，不推薦任何一支要自己買的產品
- **快速日誌** — 餵奶、睡眠、尿布，點兩下就記完，或是一鍵重複上一筆。表單打開時會帶出
  這個孩子上次記的值，而且是跟著孩子而不是跟著帳號，所以一個喝配方奶、一個喝母乳的兩
  寶家庭，各自有各自的預設。睡眠可以在當日畫面上一鍵開始、一鍵結束，中間顯示已睡多
  久；超過 14 小時沒結束的那一段會標成需要補結束時間，並且不計入任何睡眠總量、平均與
  評分
- **擠奶與母乳瓶餵** — 擠奶可以記下擠出量、時間長度，也可以選擇要不要記哪一邊，而且不
  會被算進任何一項寶寶的攝取總量、餵奶次數與餵奶提醒，在週報裡有自己的一段。用瓶子餵
  的母乳算一次餵奶，有實際毫升數，而且跟配方奶分得開
- **睡眠分析** — 作息型態、建議，以及只根據「已結束的每段睡多久」與「家長真的記下的
  夜醒次數」計算的品質評分。夜醒次數可以在睡眠表單上記，也可以在一鍵結束後的提示裡
  記，所以每週的夜醒趨勢反映的是真實資料
- **睡眠指南** — 0 到 3 歲的睡眠需求、安全守則與訓練方法
- **成長曲線圖** — 體重、身高、頭圍的 WHO 曲線（P3/P15/P50/P85/P97）；早產寶寶畫在矯正年齡上
- **早產矯正年齡** — 未滿 37 週出生的話，生長百分位、曲線橫軸、里程碑區間與幼兒發展檢核都往回推早產的週數，直到矯正年齡滿 24 個月。公費疫苗與兒童健檢刻意照實際出生日期算（衛福部的時程就是這樣排的），那兩頁會把這件事寫出來
- **副食品指南** — 分階段的副食品進程，加上 4×3 過敏原導入法與逐項食物的嘗試記錄
- **照顧重點** — 依月齡該做的照顧與安全提醒
- **寶寶百科** — 15 個常見健康問題
- **看診摘要** — 產出一份可以直接交給小兒科醫師的摘要
- **週報 / 月報** — 趨勢與發展洞察
- **在記錄的畫面上就看得到是哪個寶寶** — 每日日誌、成長曲線與里程碑三頁都會寫出
  當前的寶寶；帳號下有兩個以上可切換的寶寶時，那個名字就是切換器，點一下展開、
  再點一下選定。只有一個寶寶的帳號完全不會多出任何控制項

### LittleExplorer — 幼兒陪伴
- **成長檢核** — 12-36 個月分五個階段共 30 項檢核，另有一張乳牙圖
- **照護提醒** — 從出生日期排出健檢、疫苗與塗氟的時程，可匯出到行事曆
- **成長日記** — 可以寫自由文字並標上心情，記那些永遠不會變成資料的事
- **幼兒百科** — 45 篇文章，談如廁訓練、語言、情緒、挑食、生病，以及家庭醫藥箱
  該備什麼，並依孩子的年齡階段篩選

### LittleOuting — 帶孩子出門的地方
- **全台 22 縣市共 234 間公共親子館**，由一支納入版控的腳本，從衛福部社家署
  公布的全國名單建出來，另外把台北市的 13 間育兒友善園單獨列開，因為那是
  不同的計畫
- 各縣市的使用規則 — 免費或收費、可入場年齡、怎麼預約、設籍限制 — 每一條都
  有自己的來源與查核日期，而那 18 個沒有公布規則的縣市，會明確標成「未查核」
- **12 間親子餐廳**，逐間人工查核，並且明講這是樣本而不是名錄：台灣沒有官方的
  親子餐廳資料集，也沒有認證制度，而觀光署的全國餐廳資料裡那個 Kids-Friendly
  欄位，3,632 筆全部是空的
- 一份出發前檢查清單 — 決定一趟出門順不順的那十一個問題
- **回報資料有錯** — 家長站在現場就能說出這裡不對：已經沒有了、進不去、開放時間
  不對、需要登記但沒寫、位置不對。場所編號、名稱與被質疑的那一項會自動附上。沒
  登入也看得到這個入口，並且會說明為什麼需要登入。回報進的是意見信箱，不會改動
  清單上顯示的內容
- 刻意不做地圖：官方的親子館資料來源都不帶座標，而把台灣的門牌地址拿去做
  地理編碼，試過之後被否決了（見下）

### BabyOasis — 哺乳室地圖
- **全台 22 縣市共 3,852 間哺乳室**，來自衛福部開放資料
- 定位搜尋會回傳 10 公里內最近的 8 間，附上實際距離
- **選一站就回答「這一站附近有什麼」**：全台 260 個捷運與輕軌車站，選定之後
  列出 800 公尺內最近的 8 處，附上步行距離。那才是家長真正在排的行程，而定位
  鈕回答不了——手機只知道你現在在哪。哺乳室資料裡只有 56 處的登記名稱帶
  「捷運」，遠少於實際站數，所以站點座標取自 OpenStreetMap（ODbL），不是從
  場所名稱推。800 公尺是量出來的：260 站裡有 235 站在這個半徑內至少有一處，
  平均 7.3 處、中位數 5 處
- 先選縣市再選鄉鎮市區，每一區都帶著自己的哺乳室筆數：3,852 處分佈在 364 個
  鄉鎮市區，攤成一張平面清單就是 364 顆 chip
- 六顆場所類型 chip：百貨・賣場、車站・機場、醫院・衛生所、公園・戶外、
  圖書館・展館、親子館・社福
- **3,852 處裡有 2,792 處在依法應設置哺集乳室公共場所名單上**，其餘 1,060 處
  是自願設置。資料本身沒有場所類型欄位，兩類在地圖上長得一模一樣，所以那份
  名單是唯一有來源可依據、分得出百貨公司與工廠員工餐廳的方式
- 474 處讀起來只給員工或學生用 — 228 處公司行號、246 處校園，而且全都不在名單
  上。它們會標成「內部場所」而不是藏起來：場所類型是從登記名稱推論出來的，
  預設就藏掉一間真實存在的哺乳室是更糟的那種錯。按一下「排除內部場所」就會把
  這 474 處收掉
- 973 處的注意事項寫著要洽服務台，會標成「需洽服務台」，家長因此知道要先問人，
  而不是去找一扇打不開的門
- 設備、開放時間、電話，以及一鍵轉手給 Google Maps
- 標記分群搭配空間索引，所以全國這麼大的資料量在任何縮放層級都還能用
- **回報資料有錯** — 和 LittleOuting 同一個入口，放在哺乳室的詳細頁：家長站在打不開
  的門前面就能說出來，哺乳室編號、名稱與被質疑的那一項會自動附上
- **縣市、行政區與場所類型的篩選，重新載入之後還在。** 選定的捷運站與地圖視野刻意
  不記：定位是「我現在站在哪裡」，不是「我們家是誰」

### LittleGuard — 疫情雷達
- **七種兒童常見傳染病**，上游各一支資料（腸病毒、手足口病、疱疹性咽峽炎、類流感、COVID-19、腹瀉、水痘）：每週門診就診數，分成 22 個縣市與三個年齡層（0-2 / 3-6 / 7-12）
- **板上是五列，不是七列**：手足口病與疱疹性咽峽炎是腸病毒感染的兩種臨床表現，而上游腸病毒那一支剛好就是兩者相加 — 66 格（22 縣市 × 3 年齡層）裡的人次、率與 8 週折線的每一點都相同。三列並排等於把同一批門診就診人次數了三次，所以板上只列腸病毒一列，兩種表現收在它的抽屜裡；哪天上游不再是精確的拆分，守著這個關係的測試會先變紅，而不是讓板繼續說一句錯的話
- COVID-19 這一列算的是門診就診人次，和法定傳染病是兩件事：2023 年 3 月 20 日起只有併發症個案須通報，法定傳染病名稱在 2024 年 9 月 1 日改為「新冠併發重症」，所以抽屜連出去的疾管署那一頁講的是重症。這支資料的最新一週和另外六支相同
- 狀態是拿一個縣市跟**它自己的前 8 週**比，而不是跟往年的同一週比：2020-2022 年的防疫措施幾乎把腸病毒抹平，所以用五年同週當基準線，會讓每一週都看起來不正常
- 門檻是實測分布的百分位數（P25 0.74 / P75 1.29 / P90 1.9、中位數 0.99，n=54,468），每次重建都會重新算進 JSON，所以程式裡的常數一旦跟資料脫節，測試就會變紅。加進 COVID-19 把 P90 從 1.77 推到 1.9，而測試確實擋下來了 — 原有的 264 個板上格子裡有 12 個因此在邊界上移動了一階，沒有一個移動更多
- 九種狀態，其中 `noBaseline`（資料不足以比較）刻意跟 `none`（近期沒有病例）分開：「前 8 週算不出基準線」和「基準線真的是零」是兩件不同的事，而只有後者才撐得起「這禮拜開始出現」這句話
- 分母太小的格子會顯示「樣本過小」或「資料不足」，而不是硬給它一個編出來的狀態 — 連江縣和金門 0-2 歲的每週就診數是兩位數
- **板會先解釋自己，才開始給數字**：縣市籤上面有一段簡短的說明，板上面有一句話直接回答所選縣市與年齡層的整塊板 — 哪幾種比平常多、都沒有，或是這個縣市小到根本比不出來。資料過期時這句話就不給，因為過期的板撐不起它；而只有在剩下每一列都真的比得出來的時候，它才會說「其他沒有變多」
- **一列先講白話，不是先給率**：板上給的是這一週的就診人次，抽屜一打開是兩句話 — 這個縣市、這個年齡層這一週有幾次就診、跟它自己的前 8 週比多還是少，以及跟全國同一週相比偏多還是偏少。率（每萬次門診）、前 8 週中位數、全國同一週與分母都收在預設收起來的「詳細數字」裡：「423.0/萬」是統計人員的單位，同一件事不用它也講得清楚。跟全國比的門檻一樣是實測百分位數（P25 0.66 / P75 1.19）
- 語氣是刻意收斂的：請注意這件事，但不必為它慌張。每一句「比平常多」都會附上一件家長可以做的事，而它用到最重的顏色就是 `butter-dark`
- **打開就是上次選的縣市。** 已登入而且有孩子的家長，年齡層改用孩子的生日推算，而不
  是用記下來的那個值 — 孩子的年紀是更好的答案，而且它自己會變

---

## 帳號與資料

**凡是讀取或寫入孩子紀錄的功能，都必須登入。** 知識類的內容不用。

家長**選擇要看什麼**會記在這台裝置上 — 縣市、年齡層、分頁與場所篩選，放在
`src/common/preferences.ts`，key 帶版本號。那只是瀏覽狀態：孩子的姓名、生日、id 與
任何紀錄都不會寫進 `localStorage`，這個模組的欄位清單在讀與寫兩邊都是封閉的，所以
就算呼叫端多塞欄位也進不去，而且有測試守著。這是整個產品唯一一處寫入裝置端儲存。

`src/common/routePolicy.ts` 放的是一份**公開頁允許清單**，刻意不是一份「需要
登入」的封鎖清單：這個 app 存的是孩子的健康資料，所以新頁面忘了標記時，應該
要往關閉的那一邊倒。公開的頁面是入口頁、關於資料頁、三個知識庫、照顧重點、
睡眠指南、LittleOuting、BabyOasis 和 LittleGuard。其他全部都要帳號。

`/about` 的關於資料頁用家長的話把這些講一遍：孩子的紀錄存在哪裡、誰看得到、
app 會拿它做什麼與不做什麼，以及其他每一頁的每個數字出自哪一份政府、WHO 或
OpenStreetMap 的資料。它的每一句宣稱都是 `src/common/about/dataSources.ts` 裡的
資料，而且各有測試對著真正的東西比：數量對資料檔、來源網址對官方網域白名單、
「裝置上存了什麼」那句話對偏好模組的欄位清單 — 所以這一頁不會悄悄落後於它描述
的系統。從入口頁、帳號視窗與分享視窗都到得了。

未登入的訪客走到需要登入的路由時，會在同一個 URL 上看到那個服務的介紹頁 —
路徑被保留下來，所以登入之後他們就直接落在原本要去的地方。

- **登入**：Firebase Authentication，Google 登入
- **資料庫**：Firebase Realtime Database（asia-southeast1）
- **同步**：跨裝置即時同步
- **分享**：孩子的檔案透過一組專屬代碼分享給家人，而且分享可以收回 — 見下
- **匯出**：一個孩子的整份紀錄 — 檔案本身，加上每一筆日誌、日記與成長紀錄 — 可以
  從帳號視窗下載成一個 JSON 檔 `littlesteps-<孩子>-<日期>.json`，形狀就照下面那張
  資料庫結構，不需要另外一套格式。唯一沒有帶走的是成員名單：那是其他帳號的 id，
  不是這位家長的資料
- **刪除**：帳號視窗可以刪掉帳號本身 — 只有這位家長一個人是成員的孩子整份消失、
  共用的只退出成員名單、自己的 `users/$uid` 節點，最後是 Firebase Auth 使用者
- **限制**：免費方案每個帳號 2 個孩子

bundle 裡的 Firebase 設定本來就是公開的。Auth 和規則管的是**誰**能讀寫；
上面沒有任何東西管**從哪裡**，所以一支只拿著這份設定的腳本就能直接對資料庫
講話。用 reCAPTCHA v3 的 Firebase App Check 補上這一半：設了
`VITE_FIREBASE_APPCHECK_SITE_KEY` 之後，每個請求都會帶著一個 token，證明它
是從這個 web app、在允許的網域上發出的；沒有 token 的請求會被算成未驗證 —
而在主控台打開強制執行之後，就會被拒絕。這是來源檢查，不是授權：
`database.rules.json` 仍然是唯一決定登入的使用者能碰什麼的邊界。

那個 token 來自 `www.google.com` 上的一支腳本，而這個 app 的家長裡有一部分
載不到它：擋廣告的擴充套件會拒絕它，`AuthContext.tsx` 的 `isInAppBrowser()`
本來就是為之存在的 LINE、Facebook、Instagram 內建瀏覽器也一樣。
`@firebase/app-check` 0.11.2 對這件事沒有答案 — 它的載入函式只掛
`script.onload`，載不進來時 token 的 promise 永遠不會 settle，而資料庫就等在
那裡。所以 `src/lib/firebase.ts` 自己載那支腳本，掛上錯誤處理與 8 秒逾時，
確定 `grecaptcha` 真的在了才初始化 App Check。載不到的家長就是這次沒有
App Check token，其他什麼都不受影響。在 App Check 還是監控模式的階段，這是
對的取捨；打開強制執行之前，要看的數字就是那幾種瀏覽器送出的未驗證請求佔
多少，因為強制執行會把「未驗證」變成「被拒絕」。

### 分享，以及把它收回

成員名單放在 `children/$childId/members`，是在孩子節點裡面，而不是在各個帳號
裡面。這正是它的重點所在：既有成員可以移除另一個成員。`joinOpen` 則另外決定
拿到代碼的人能不能把自己加進來，所以一組已經被傳出去的代碼可以被關掉，而不會
動到任何已經在裡面的人。

這些加起來的結果，由 `npm run test:rules` 對著模擬器逐條驗證：

- 既有成員可以移除另一個成員
- 被移除的成員在 `joinOpen` 是 `false` 的時候，無法把自己重新加回來
- 只要寫入之後名單上還有人，任何一位成員的成員身分都可以被移除，包含 `createdBy`
  自己的那一筆。成員數永遠不歸零，也沒有誰是移不掉的：名單空掉的孩子節點就是
  一份沒有人讀得到、也沒有人刪得掉的健康紀錄；而點名一個 uid 不可移除，只會把
  家長綁在他為別人建的檔案上
- 名單上最後一位成員走不掉，是不是建立者都一樣。他要離開只有整份刪除這條路，
  所以他按下的「刪除」刪的是整份紀錄，而不只是自己的成員身分
- 任何成員實際上都等於擁有者。Realtime Database 無法收回在上層節點已經授予的
  寫入權限，所以一個成員可以寫孩子底下的任何東西，包括成員名單本身。這是刻意
  的取捨：讓兩個家長各自都能把對方從共用的紀錄上移除，在這裡的價值大於給他們
  一套誰都沒要求過的角色階層。

### 資料庫結構

```
users/$uid                 childrenIds, currentChildId, lastFeedbackAt
                           childrenIds 只是這個帳號要訂閱的孩子清單，
                           授權看的是下面的 members
                           lastFeedbackAt 是伺服器時間戳，與回饋在同一筆更新裡
                           寫入；規則要求它比上一次晚至少 60 秒，而且在那段
                           時間內不准刪除，所以任何帳號一分鐘最多一則回饋
                           （寫入被拒仍可能有別的原因，例如帳號被停用）。
                           刪帳號會在窗口過了之後把它清掉，所以在送出回饋後的
                           60 秒內刪帳號，會留下那一個整數
children/$childId          id, name, birthday, gender, createdAt, createdBy,
                           isPregnancy, pregnancyData
                           gestationalAgeWeeks, gestationalAgeDays
                                                   早產週數，用來算矯正年齡
                           members/$uid: true      授權
                           joinOpen                持有代碼的人可以加入嗎？
                           milestoneProgress, vaccineProgress, toothProgress,
                           developmentProgress, prenatalProgress,
                           careTaskProgress, foodTrackingProgress
childRecords/$childId      dailyLogs/$logId        type (feeding|sleep|diaper),
                                                   timestamp, details
                           diaryEntries/$entryId   date, content, mood
                           growthRecords/$recordId date, weight, height,
                                                   percentile — 只有舊紀錄
                                                   才有；現在讀取時算，
                                                   不再寫入
childIndex/$childId        true — 公開的存在索引，讓用代碼加入時
                           永遠不必去讀陌生人的孩子節點
feedbacks/$feedbackId      title, content, userId, timestamp
                           userName, userEmail     只有家長在回報表單上勾了
                                                   讓我們回覆他，才會附上
```

孩子節點放的是「這個孩子是誰」，再加上對固定清單的進度 — 33 個里程碑、36 劑
疫苗、30 項成長檢核 — 所以它的大小是有上限的。`childRecords` 底下那三個集合
沒有上限：每換一次尿布就多一列，永無止盡。它們被放在旁邊的兄弟子樹裡，因為
孩子的監聽器訂閱的是整個 `children/$childId` 節點，日誌放在裡面的時候，換一次
尿布就會把這個孩子的全部歷史重新下載給每一位家人。

存取權限由 `database.rules.json` 落實 — `childRecords/$childId` 和
`childIndex/$childId` 兩者都是透過 `children/$childId/members` 判斷。權威的
規則看那個檔案，而這些規則被斷言要做到什麼，看 `scripts/testRules.cjs`。

---

## 設計系統

所有視覺都出自同一個地方。其中最重要的一條規則：

> **粉彩色階是填色。文字要用該色階可讀的那一支：四組基礎色階用 `-dark`，
> `bloom.*` / `explorer.*` / `outing.*` 用 `-ink`。**

粉彩色對白色大約只有 2:1。拿來當文字、或者拿來墊白字，都是讀不出來的，而在這
條規則被寫下來之前，它們就是這樣被用的 — 主要按鈕上的字是整個畫面上最難讀的
文字。

`bloom.*` 和 `explorer.*` 是陷阱：在那裡 `-dark` 是給 hover 和邊框用的*更深的
填色*，在白底上量出來是 2.44–3.72:1（`explorer-sunbeam-dark` 2.44、
`bloom-dusty-rose-dark` 2.98、`bloom-sage-dark` 3.01），所以這兩套配色裡的文字
一律用 `-ink`。

### 配色 — `tailwind.config.js`

| 色階 | 填色（裝飾用，絕不當文字） | 文字（≥4.5:1） | 用於 |
|---|---|---|---|
| `primary` | `#FF9B9B` | `primary-dark` `#B84A50` | LittleSteps，以及 app 自己的品牌色 |
| `secondary` | `#7EC8E3` | `secondary-dark` `#2A7288` | BabyOasis、資訊性的強調 |
| `mint` | `#81C784` | `mint-dark` `#3F7D43` | 疫苗、「完成」與「安全」 |
| `butter` | `#F0B357` | `butter-dark` `#9A6212` | 飲食、尿布、溫和的警示 |
| `bloom.*` | 莫蘭迪色**以及每一個 `-dark`** | `*-ink`（`bloom-dusty-rose-ink` `#855F5F`）、`*-deep` | LittleBloom |
| `outing.*` | `#5FC0B5` | `outing-ink` `#1F7A70`、`outing-deep` `#14655C` | LittleOuting |
| `explorer.*` | 明亮色**以及每一個 `-dark`** | `*-ink`、`bark` | LittleExplorer |

`ink` / `ink-muted` / `ink-faint` 分別是正文、次要與說明文字 — 在 `warm-white`
（`#FDFBF7`）這個唯一的頁面底色上，它們比 `gray-*` 更暖。

### 共用 class — `src/index.css`

- `.card` — 清單裡的一列 · `.panel` — 頁面裡的一個區塊 · 互動版本用 `.card-tap` / `.panel-tap`
- `.screen` + `.screen-body` / `.screen-body-wide` — 頁面外殼與欄寬
- `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.btn-icon` — 全部 ≥44px
- `.chip` + `.chip-on` — 篩選 chip，≥44px
- `.tag`、`.row-bleed`、`.scrollbar-hide`、`.min-h-dscreen`
- `h1`–`h4` 都有基礎字級，因為 Preflight 會把標題重設成 `inherit`

兩種陰影（`shadow-soft`、`shadow-soft-lg`）和兩種圓角（`rounded-2xl`、
`rounded-3xl`）。如果你需要第三種，那是設計錯了。

### 共用元件 — `src/common/ui/`

| 檔案 | 用途 |
|---|---|
| `serviceTheme.ts` | `SERVICE_THEME[id]` — 唯一一個會依服務而變的東西 |
| `AppBar.tsx` | 唯一的頁面標題列，固定 `h-16`；要黏在它下面的東西用 `top-16` |
| `EmptyState.tsx` | 唯一的「這裡還沒有東西」區塊；除非那個時刻值得，否則**不畫任何 icon** |
| `motion.ts` | `stagger` `listItem` `fadeInUp` `sheet` `backdrop` `collapse` `tap` `hoverLift` |

### 原則

- **Mobile-first。** 從手機往上放大；絕不把桌機尺寸寫成基準。
- 任何可點擊的東西**最小 44px**。不要把小的點擊目標包在大的裡面。
- **icon 必須自己掙到位置。** 重複旁邊文字的 icon 就是雜訊。把它們留給按鈕、導覽目的地、開關、狀態，以及長清單裡每一列的標記。不要在標題旁邊放一個。
- **層級靠字體與間距撐起來**，不是靠色塊，也不是靠徽章。
- **動效是被感覺到的，不是被觀賞的。** 進場要短、位移要小、不要有東西一直循環。`prefers-reduced-motion` 在全域就被尊重。
- **元件裡不寫 hex 字面值。** 如果一個顏色不是 token，就去加一個 token。

---

## 技術堆疊

**前端** — React 18、TypeScript（strict）、Vite 5、Tailwind CSS、Framer
Motion、Lucide icons、React Hooks + Context、Leaflet 加上分群。

**後端** — Firebase Authentication、Realtime Database 與 Analytics。

**工具** — Vitest + Testing Library、Playwright、ESLint、Husky pre-commit、
`vite-plugin-pwa`、GitHub Actions。

---

## 開始開發

需要 Node 18+。

```bash
git clone https://github.com/sean1093/LittleSteps.git
cd LittleSteps
npm install
```

建立 `.env`（範例看 `.env.example`；絕對不要 commit 它）：

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_APPCHECK_SITE_KEY=
VITE_FIREBASE_APPCHECK_DEBUG=
```

`VITE_FIREBASE_APPCHECK_SITE_KEY` 是 reCAPTCHA v3 site key：在 Google
reCAPTCHA 管理主控台建立，再連同它的 secret 註冊到 Firebase 主控台 → App
Check。留空的話 app 就在沒有 App Check 的狀態下跑，在 key
註冊好之前這是預期的狀態。設了 key 之後，`localhost` 拿不到真的 reCAPTCHA
token，所以要在本機對著 App Check 開發：

1. 在 `.env` 裡設 `VITE_FIREBASE_APPCHECK_DEBUG=true` — 只有 `npm run dev`
   會讀它；正式建置會把這段丟掉，
2. 打開 app，從瀏覽器 console 印出的 `App Check debug token: …` 那一行把
   token 複製下來，
3. 到 App Check → Apps → 你的 web app → Manage debug tokens 把它登記進去。

```bash
npm run dev            # http://localhost:5173
npm run build          # tsc && vite build
npm run preview
npm run lint           # 先 tsc --noEmit，再 eslint
npm run test           # watch 模式
npm run test:coverage
npm run test:rules     # 用 Database 模擬器驗 database.rules.json
npm run test:e2e       # Playwright，390px 與 320px 各跑一次
```

`npm run lint` 會先型別檢查再 lint。`tsconfig.json` 把 `lib` 釘在 ES2020，而
整個 repo 只有編譯器知道這件事：esbuild 剝掉型別時不會讀 `lib`，也沒有任何
ESLint 規則認得內建方法，所以 `.at()`、`findLast`、`toSorted` 這一整族 ES2021+
的方法以前都能通過 lint 和單元測試，只在 `npm run build` 才失敗。把 `tsc` 放進
快速迴圈就補上了這個洞，也不必再多一份會跟 `lib` 走位的禁用清單。

`npm run test:rules` 會透過 `firebase emulators:exec`，把 `scripts/testRules.cjs`
跑在 Database 模擬器上，所以它需要 JDK：`brew install openjdk`，而因為那個
formula 是 keg-only，`/opt/homebrew/opt/openjdk/bin` 必須在 `PATH` 上，不然
模擬器會找不到 `java`。每次改完 `database.rules.json` 都要跑一次 — 這是唯一能
讓你發現自己剛剛把一家人擋在孩子的健康紀錄外面、或是把紀錄開放給陌生人的方法。
同一套測試也會在 CI 上對每一個 pull request 跑一次（`.github/workflows/ci.yml`
裡的 `rules` job），所以沒有 JDK 的貢獻者一樣有保障：規則一放鬆，合併前就會
先變紅。

`npm run test:e2e` 會先 build 再把 `dist/` 服務起來才開 Chromium，所以啟動時
要等一次 build 的時間，驗的也是正式建置的輸出，而不是 dev server。怎麼只跑一
部分、怎麼加一個案例寫在 `e2e/README.md`；哪些東西才該進這個測試套件則寫在
`docs/E2E_TEST_PLAN.md`。

哺乳室資料集在 `public/data/nursingRooms.json`，由
`scripts/buildNursingRooms.cjs` 重新產生；親子館名單是
`public/data/familyCentres.json`，來自 `scripts/buildFamilyCentres.cjs`。它被
排除在 PWA 預快取之外，改成第一次進地圖時才抓 — 1.1 MB 不該讓一個從來不開
BabyOasis 的人下載。同一支腳本也會寫出
`src/babyoasis/data/nursingRoomsMeta.json`：這次執行的日期、來源、授權與筆數。
陣列本身沒有日期，地圖的資料來源標註與關於頁的查證日期都從這個 sidecar 讀，
所以兩邊不可能不一致；有測試拿它的筆數對著陣列比，資料重新產生了而 sidecar
沒跟上就會轉紅。

捷運站清單在 `src/babyoasis/data/mrtStations.json`，由
`scripts/buildMrtStations.cjs` 從 OpenStreetMap 的 Overpass API 重新產生。它
放在 `src/` 裡直接 import 而不是另外抓：22 KB 本來就該待在 BabyOasis 那個
lazy chunk 裡，而選站的選單必須立刻打開。腳本只留帶有 `network` 或 `operator`
標記的車站，未通車的路線因此被排除；輸出裡也刻意沒有路線名 — OpenStreetMap
把轉乘站記成一個節點、只帶一條線的代號，21 個已知轉乘站有 13 個會被標成只有
一半的路線。

疫情雷達的資料在 `public/data/diseaseRadar.json`，由
`scripts/buildDiseaseRadar.cjs` 把衛生福利部疾病管制署（疾管署）的七個 CSV
檔（約 51 MB）彙總成 79.1 KB。gzip 後是 17.0 KB，所以它留在 PWA 預快取裡，
看板可以離線打開。`od.cdc.gov.tw` 送出的憑證鏈不完整，所以腳本自己帶著
`scripts/data/` 底下那兩張 TWCA 憑證；不要用關掉 TLS 驗證的方式來「修」它。

**更新是手動的，一週一次。** 疾管署會在週一或週二一早公布上一週的資料，所以
從週三之後再跑：

```bash
node scripts/buildDiseaseRadar.cjs   # 重建
node scripts/diffDiseaseRadar.cjs    # 0 資料相同 / 1 有變動 / 2 無法比較
```

只有 exit 1 才值得 `git add public/data/diseaseRadar.json` 並 commit。exit 0
的時候跑 `git checkout -- public/data/diseaseRadar.json`，把重建剛剛寫進去的
時間戳丟掉。比較會先把 `generatedAt` 和 `verifiedOn` 剝掉，因為它們每跑一次
就會變，否則每週都會產生一個沒有改到任何資料的 commit。exit 2 代表比較本身
失敗了：停下來看清楚，絕對不要把它當成 1。

`.github/workflows/refresh-disease-radar.yml` 帶著同一套邏輯，但**只能手動
觸發，而且只有在有台灣線路的 runner 上才有用**。從 GitHub 託管的 runner 連
不到 `od.cdc.gov.tw`：兩次 dispatch 都以
`connect ETIMEDOUT 35.229.205.172:443` 收場，連 TCP 握手都沒完成，而同一個
IP 從台灣的機器上是有回應的，兩邊也都解析到同一個位址，所以這是來源 IP 被
封鎖，不是 DNS 依地區分流。現在在 `ubuntu-latest` 上觸發時，它會在大約
20 秒後帶著這個說明停下來，而不是卡上兩分多鐘；把 `runner` 這個輸入指向
台灣的自架 runner 再觸發，這個 job 的其他部分照樣可以跑。

忘記更新是安全的：看板會顯示資料涵蓋到哪一週，而一旦那個時間超過一個月，它會
把這件事講出來，並收掉每一行狀態，只留下數字。

---

## 專案結構

```
src/
├── common/                  六個服務共用
│   ├── ui/                  設計系統：serviceTheme、AppBar、EmptyState、motion
│   ├── components/          Sidebar、ModalFrame、對話框、AppHomeButton、百科瀏覽器
│   ├── landing/             入口頁 + 各服務的介紹頁
│   ├── hooks/               useChildStore 與 Firebase 的孩子資料 hooks
│   ├── utils/               日期、摘要
│   ├── routePolicy.ts       公開頁允許清單
│   └── pregnancy.ts
├── littlesteps/             pages, components/{milestone,vaccine,sleep,growth,
│                            dailylog,food,dashboard,report,shared}, hooks, data
├── littlebloom/             pages, components (BloomShell), data, utils
├── littleexplorer/          pages, components (ExplorerShell, ExplorerTabBar,
│                            ToothChart, AgeBandPicker), hooks, data, utils
├── littleouting/            場館頁 + 卡片、親子館 + 親子餐廳資料、檢查清單
├── babyoasis/               地圖頁、空間索引、資料
├── littleguard/             雷達頁、疾病列 + 抽屜、走勢圖、
│                            狀態門檻、縣市中心點
├── contexts/                AuthContext
├── lib/                     Firebase 初始化
├── types/                   共用型別與路由 union
├── App.tsx                  路由、外殼、頁面 lazy 載入
└── index.css                設計 token 化成 class
```

路由是路徑式的（History API，`firebase.json` 裡有 SPA rewrite），所以每一個
畫面都能分享、也能被爬取。子路由：
`littlesteps/{dashboard,milestones,vaccine-tracking,daily-log,growth-charts,sleep-training,sleep-analysis,complementary-food,care-guide,baby-wiki,clinic-summary,report}`、
`littlebloom/{prenatal,wiki}`、`littleexplorer/{reminders,diary,wiki}`、
`littleouting`、`babyoasis`、`littleguard`。

---

## PWA

可安裝、能離線用、會自己更新。品牌圖檔全部從 `public/favicon.svg` 產生 — 一個
來源生出 favicon、Apple touch icon、192/512 的 PWA 圖示、一個獨立的 maskable
圖示（啟動器會裁成圓形），以及 1200×630 的分享卡。

**iOS** — Safari → 分享 → 加入主畫面。
**Android** — Chrome → 選單 → 安裝應用程式。

---

## 部署

推到 `master` 會透過 GitHub Actions 部署到 Firebase Hosting；pull request 會
拿到一個預覽 URL。環境變數來自 GitHub Secrets。

```bash
npm run build && firebase deploy --only hosting   # 手動
```

### 新專案要先自己建 Hosting 站台

從 **2026-10-15** 起，Firebase 不再於建立專案時一併建立預設的 Hosting 站台，
改成用到才開。這個 repo 不會建站台——workflow 只會部署到「已經存在」的站台，
而 `.firebaserc` 寫的是*專案*、不是站台。所以對一個全新專案的第一次部署會以
`404 Site Not Found` 失敗，發生在 CI 上、掛在一個跟 Hosting 毫無關係的 pull
request 上。那跟下面那些配額限制是同一種壞法：沒有人被事先告知，最後以「build
壞了」的樣子出現。

第一次部署之前，建一次就好：

```bash
firebase hosting:sites:create littlesteps-c6ab6 --project littlesteps-c6ab6
```

站台 id 就沿用專案 id，除非那個子網域已經被別人佔走——下面的 referrer 清單、
預覽頻道的網址，以及 `firebase-hosting-pr-cleanup.yml` 算出來的頻道名稱，都是
照著它寫的。

**現有的 `littlesteps-c6ab6` 專案不受影響。** 它的站台早於這次改動，部署、預覽
頻道和其他一切照常。只有在專案被重建、或是要再開第二個專案時，這件事才用得上。

### 不在這個 repo 裡的主控台設定

有兩項設定只存在於 Google Cloud 主控台。repo、workflow 和 `firebase deploy`
都不會重建它們，所以換掉 Web API key 或搬到新專案時，兩項都會無聲無息地
消失。只要其中一件發生，就把這份清單重做一次。

**Web API key。** `VITE_FIREBASE_API_KEY` 是公開的，不是秘密 — 它就包在
bundle 裡，Firebase 自己也這麼說。Realtime Database 也不靠它驗證：socket 上
帶的是 Auth 和 App Check 的 token，由規則決定。這把 key 真正把關的是
Identity Toolkit — 登入與 token 更新 — 所以一把不設限的 key，等於讓任何來源
都能對這個專案登入。限制它不花任何成本。到 *APIs & Services → Credentials*
打開那個變數指到的 key：

1. **Application restriction：HTTP referrers。** 只放下面這些主機，其他都不
   放。第三個是 `firebase-hosting-pull-request.yml` 部署到的預覽頻道；少了
   它，每個 pull request 的預覽都會登不進去，而第一個發現的人會把它當成 app
   的 bug 回報。

   ```
   littlesteps-c6ab6.web.app/*
   littlesteps-c6ab6.firebaseapp.com/*
   littlesteps-c6ab6--*.web.app/*
   localhost:5173/*
   ```

   在 Hosting 底下新增的自訂網域，當天就要加進這份清單。等 reCAPTCHA site key
   建好之後，讓它和那把 key 的網域清單保持完全一致——清單在 Google reCAPTCHA
   管理主控台上，不在 Firebase 主控台（那裡只放 key 的 secret）：兩邊守的是
   不同的東西，任何一邊少了一個主機，登入都會壞掉。

2. **API restriction。** 只放 `src/lib/firebase.ts` 裡的 web SDK 會帶著這把
   key 去呼叫的：

   | API | 用途 |
   |---|---|
   | Identity Toolkit API | 登入，`identitytoolkit.googleapis.com` |
   | Token Service API | 更新 ID token，`securetoken.googleapis.com` |
   | Firebase Installations API | Analytics 用它辨識這個安裝 |
   | Firebase Management API | `getAnalytics()` 在第一個事件之前會帶著 key 到 `firebase.googleapis.com` 抓 app 的 web 設定 — 一律會抓，設定裡的 `measurementId` 只會在不一致時印一則警告 |
   | Firebase App Check API | 交換 token，設了 site key 之後才用得到 |

   以主控台的清單為準，不要照抄這份；這裡少放一個 API，在瀏覽器裡會變成一個
   無聲的 `403`。Analytics 壞得最安靜：事件就是再也送不到。

3. **驗證。** 正式站、改完之後才部署的預覽頻道、以及 `localhost:5173` 都能
   登入；而從外部來源發出的請求會被拒絕：

   ```bash
   curl -s -H 'Referer: https://example.com/' -H 'Content-Type: application/json' \
     -d '{"returnSecureToken":true}' \
     'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<VITE_FIREBASE_API_KEY>'
   # expect 403, "Requests from referer https://example.com/ are blocked."
   ```

**用量警示。** Spark 方案有 1 GB 儲存、每月 10 GB 下載，以及 100 個同時連線，
而最後那一項是最先撞到的天花板。沒有帳單，所以也沒有帳單警示：額度用完時，
出現的是家長看到資料載入失敗的訊息，而不是維護者收到一封 email。到
*Monitoring → Alerting* 建立一個 email 通知管道，再對 Realtime Database 的
指標建三條 policy，門檻設在上限之下，讓 email 在還來得及處理的時候就送到：

| 指標 | 警示於 | Spark 上限 |
|---|---|---|
| `firebasedatabase.googleapis.com/network/active_connections` | 80 | 同時 100 個 |
| `firebasedatabase.googleapis.com/network/sent_bytes_count`，30 天加總 | 8 GB | 每月 10 GB |
| `firebasedatabase.googleapis.com/storage/total_bytes` | 800 MB | 1 GB |

如果某條 policy 結果需要 Blaze — 最可能的是 30 天加總那一條 — 就退回每月
一次的提醒，去 Firebase 主控台打開 *Realtime Database → Usage*，並把是哪一條、
為什麼記在 issue #88 上。驗證方式：把其中一條 policy 的門檻設到低於目前的值，
收到 email，再把門檻改回去。

### 遷移已上線的資料庫

`scripts/migrateChildRecords.cjs` 是那支一次性的遷移腳本，它把授權搬進
`children/$childId/members`，並把三個會一直長大的集合搬到
`childRecords/$childId`。它在動任何東西之前，會先讀完整個資料庫並寫出
`backups/rtdb-<timestamp>.json`（已 gitignore，權限 600），而且如果那個檔案
寫不出來就拒絕繼續。每個孩子的 `members` 是從「哪些帳號的 `childrenIds` 裡有
這個孩子」算出來的；每個集合都會被複製、讀回、跟來源比對、再確認來源沒有在
這期間被改掉，然後才刪除。它不會替沒有任何人擁有的孩子憑空生出一個成員 —
那個孩子會被回報成需要由人來判斷的孤兒並跳過 — 它也不會覆寫已經存在的
`members` 名單，因為從 `childrenIds` 重算會把某人已經收回的存取權復活。

```bash
node scripts/migrateChildRecords.cjs           # dry run：列出它會做的每一次寫入
node scripts/migrateChildRecords.cjs --apply   # 實際寫入
```

它可以重複執行。已經有 `members`、也沒有舊集合的孩子，會被回報成完成並跳過，
所以被中斷的一次執行，只要再跑同一個指令就能收尾。

順序很重要：

```bash
node scripts/migrateChildRecords.cjs             # 0. dry run，把輸出讀過
firebase deploy --only database                  # 1. 規則
node scripts/migrateChildRecords.cjs --apply     # 2. 遷移
npm run build && firebase deploy --only hosting  # 3. app
```

在部署規則之前先把 dry run 讀過，因為第 1 步會開啟一段什麼都不能用的空窗：
此時還沒有任何孩子有 `members` 名單，所以在第 2 步把它寫進去之前，已上線的
app 既讀不到孩子、也加不了孩子。第 2 步必須在第 3 步之前，因為新版程式在資料
搬完之前去讀 `childRecords`，會完全找不到日誌；而第 3 步必須緊接著做，因為
還開著的舊分頁會把日誌寫回 `children/$childId`，那是新版 app 不會去看的地方。
部署完之後再把遷移跑一次，就會把舊分頁在切換期間寫進去的東西掃乾淨；這就是
「可以重複執行」的用途。

新結構對前端有一個要求：刪除一個孩子**必須**是單一次從根節點展開的 fan-out
更新，在同一次寫入裡把 `children/<id>`、`childRecords/<id>`、
`childIndex/<id>` 和 `users/<uid>/childrenIds/<id>` 全部設成 `null`。
`childRecords` 的授權是透過 `children/<id>/members` 判斷的，而規則運算式裡的
`root` 是寫入*之前*的資料庫，所以把孩子節點放在它自己那一次寫入裡刪掉，會讓
那些紀錄永久失去授權 — 讀不到，也刪不掉。依序分開執行會失敗這件事，在
`scripts/testRules.cjs` 裡有一個測試案例。

---

## 參與貢獻

1. 先讀 `.claude/CLAUDE.md` 和 `.claude/skills/` 裡的 skills。其中兩個講的是
   流程，不是程式：`english-writing`（commit message、PR 內文和文件都用英文；
   `README.md` 和 `README.zh-TW.md` 要一起改）以及 `pr-self-merge`（開分支、
   開 PR、用文字審自己的 diff、修掉它找出來的問題、然後合併）。
2. 遵守上面的設計系統。最該避免的，就是多出第二種畫卡片的方法。
3. Conventional commits：`feat:` `fix:` `refactor:` `style:` `docs:` `test:`
   `chore:`。
4. 每個 PR，CI 都會跑 lint、單元測試與 P0/P1 的端對端案例，並部署一個預覽。
   開 PR 之前，`npm run build`、`npm run lint` 和 `npx vitest run` 仍然要自己
   跑過 — 而且要在 390px 的視窗寬度下看過改動。

## 版本

每一次 merge 進 `master` 都會打上 `vX.Y.Z` 的 tag 並發佈成 GitHub release，
所以「線上跑的是哪一版」永遠有答案。`package.json` 的 `version` 不是那個答案，
從來也不是 — 這是一個 private 套件，不會發佈，沒有任何東西讀那個欄位。

tag 由 `.github/workflows/release.yml` 在 **CI 通過時**打上，而不是在 merge
落地時。所以有 tag 就代表那個 commit 驗證過了；`master` 紅燈時不會有 tag，
下一次綠燈的 merge 會把上一個 tag 之後的所有 commit 一起算，只跳一次。

跳幾級由 squash commit 的 conventional commit 標題決定 — 因為這個 repo 一律
squash merge，那個標題就是 PR 標題：

| 標題 | 級距 |
|---|---|
| `feat:` | minor |
| 其他（`fix:`、`docs:`、`chore:` …） | patch |
| `type!:` 或行首的 `BREAKING CHANGE:` | major\* |

\* 主版號還是 `0` 的時候，破壞相容性的改動只升 **minor**。升上 `1.0.0` 是在
宣告穩定，那是產品決定，不該由一則 commit 訊息代替人做。

另一個刻意的選擇：每一次 merge 都會有版本，連只改文件的也是，因為每一次 merge
進 `master` 就是一次部署，而部署就該有名字。

`BREAKING CHANGE:` 比對的是**行首**，位置不限。只讀最後一段看起來比較正確，
其實不是：這個 repo 每一則 commit 結尾都有 `Co-Authored-By:` 的 trailer 區塊，
每一則 squash body 結尾也都有署名 footer，所以真正的宣告永遠在它們上面、永遠讀
不到。剩下的風險是有人在 body 裡**用行首**寫這個詞卻只是在討論它 — 那會多跳一
級。多跳一級在 tag 清單上看得見；漏掉一級是靜默的。

級距的邏輯放在 `scripts/nextVersion.cjs` 並且有單元測試，因為版號印錯了照樣是
一個合法的 tag：不會有任何東西壞掉，只是從此對不上。

## 發展藍圖

- **現在** — 六個服務全部上線、多裝置同步、意見回報
- **接下來** — 付費方案、更豐富的分析、LittleBloom 每週內容的深度
- **再之後** — 里程碑照片、社群、英文與簡體中文、深色模式

## 致謝

醫療與時程資訊依循衛生福利部的指引；成長曲線採用 WHO 兒童生長標準；哺乳室
資料來自台灣政府開放資料。內容屬於參考資料，不能取代醫師。

採用 MIT 授權。
