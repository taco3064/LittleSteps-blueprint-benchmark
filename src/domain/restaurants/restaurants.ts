import type { Venue } from '../records';

/**
 * 親子餐廳樣本（12 筆，查證日 2026-08-28）。
 *
 * ─────────────────────────────────────────────────────────────
 * 這是一份樣本，不是名錄
 * ─────────────────────────────────────────────────────────────
 * 台灣沒有任何官方的親子餐廳資料集，也沒有任何親子友善的認證制度。查證過交通部
 * 觀光署在政府資料開放平臺的全國餐廳資料（dataset 7779，查證時 3,632 筆）：它的
 * RestaurantFeatures 欄位在規格上允許「Kids Friendly」這個值（代碼 4），但
 * 3,632 筆記錄裡這個欄位全部是空的，Facilities 欄位同樣全空。也就是說，連政府
 * 自己都沒有在收這個資訊——欄位存在不等於資料存在。
 *
 * 所以親子餐廳只能人工查證，而人工查證的量能有限。這 12 筆是逐筆打開 sourceUrl
 * 對過名稱、地址、行政區、電話與設施敘述的樣本，必須以「樣本」呈現，永遠不能
 * 借用親子館那份政府來源資料的權威感——親子館來自衛福部與各縣市的公開名單，
 * 這 12 筆來自部落格、媒體與一個地方政府的觀光導覽頁。UI 上兩者必須看得出差別。
 *
 * 為什麼不做成大清單
 *   研究時抓到的具體失敗案例：WooHoo 遊戲屋（新北樹林）已於 2020-02-27 結束
 *   營業，但一篇 2018 年寫它「好玩、推薦」的部落格文章至今仍排在搜尋結果前面。
 *   一份沒人維護的人工清單就是在大量複製這個現象：條目越多，倒店、搬遷、改制的
 *   比例越高，而家長是帶著孩子照著清單出門的。寧可 12 筆有查證日期，不要 200 筆
 *   來源不明。這也是每一筆都有 verifiedOn 的原因——它是給家長看的保存期限，不是
 *   給我們看的紀錄。
 *
 * 2026-08-30 重新查證過能不能改成管線，結論仍是不行，但理由比原本細一層：
 *   * dataset 7779 現在是 3,631 筆（少了 1 筆，資料集是活的）。
 *     RestaurantFeatures 與 Facilities 依然 100% 為空——欄位不是最近才停收，
 *     是從來沒收。
 *   * 但 Description 欄位有 3,109/3,631 筆有內容，其中 12 筆的政府敘述明確寫出
 *     兒童設施（兒童遊戲區、溜滑梯、球池、哺乳室、兒童餐），分布含雲林 4 筆、
 *     南投 2 筆——正好是這份樣本目前完全沒有的縣市。這是一條真的存在的線索，
 *     原本的註解不知道它。
 *   * 卡在兩件事，所以還是沒接：
 *     1. 那 12 筆的 WebsiteURL、SameAsURLs、SocialMediaURLs 全部是空的（0/12），
 *        觀光署也沒有逐筆的公開頁面（試過 media.taiwan.net.tw 的 POI 路徑，404，
 *        用店名搜也找不到）。sourceUrl 只能指向 data.gov.tw/dataset/7779，
 *        那是一個資料目錄頁——家長點「來源」是要看到那家店，不是看到 metadata。
 *        比現在的部落格連結更差。
 *     2. UpdateTime 顯示新鮮度不均：臺南三筆停在 2022、臺中一筆停在 2021。
 *        ServiceStatus 雖然有值，但一筆五年沒更新的記錄標著「營業中」，
 *        證據力並不比部落格強——WooHoo 那個問題換上政府的外衣而已。
 *   要接這條管線，缺的是「逐筆可開的公開頁面」。等觀光署有 POI 永久連結，
 *   或哪個縣市真的發布育兒友善店家名單（2026-08-30 查 data.gov.tw 仍然沒有），
 *   再回來接。在那之前，增加筆數就是繼續人工查證，上限 30 筆的理由不變。
 *
 * ─────────────────────────────────────────────────────────────
 * 標籤規則：沒有標籤 ≠ 沒有這項設施
 * ─────────────────────────────────────────────────────────────
 * 標籤只在 sourceUrl 那一頁明確寫到時才給。來源寫「停車場：無」就一定不給
 * parking；來源沒提尿布台，就不給 diaperTable，但那不代表現場沒有尿布台，只代表
 * 沒有人寫下來。這與 BabyOasis 在 NursingRoom.facilities 為 undefined 時
 * 「據實呈現未提供而非沒有」是同一個判斷，理由也一樣：把沉默當否定，會讓家長
 * 錯過其實可用的場館。
 *
 * 這條規則的代價很明白：12 筆裡沒有任何一筆的來源記載尿布台或哺乳室，也沒有任何
 * 一筆記載兒童餐椅。這不是台灣的親子餐廳沒有這些東西，而是人工蒐集的來源不寫
 * 這些——正好量化了官方資料與部落格資料的差距。UI 不該把這片空白畫成「都沒有」。
 *
 * 依身高或份數計價、時段限制、公休日這類「會影響今天能不能去」的細節放在 notes，
 * 不做成標籤：標籤是布林值，而「未滿 100 公分收 50 元清潔費」不是布林值，硬塞成
 * 標籤會失真。minSpend 只在來源明確標示「低消」金額時才填；來源寫「平均價位」
 * 或「低消為成人 1 份套餐」時一律留空，避免把估價當成契約。
 *
 * 名稱逐字採用 sourceUrl 頁面上的寫法（如 甲蟲秘境、忻林、八老爺、咱們小時候），
 * 與內部流傳的抄寫版本有差異時以來源為準——家長是拿這個字串去 Google 和打電話的，
 * 一個字不同就查不到。
 *
 * 來源與授權
 *   Cafe 4 fun 咖啡趣一筆出自桃園市政府觀光導覽網（資料來源：桃園市政府經濟發展局），
 *   屬政府資料，依政府資料開放授權條款第 1 版必須顯名標示——「未依格式標示者，
 *   視為自始未取得授權」，所以標示是義務不是禮貌。其餘 11 筆為部落格與媒體報導，
 *   逐筆記在各自的 sourceUrl。
 */
export const restaurants: Venue[] = [
  {
    id: 'rest-tpe-beetle-zhishan',
    kind: 'restaurant',
    name: '甲蟲秘境親子餐廳(芝山店)',
    city: '臺北市',
    district: '士林區',
    address: '臺北市士林區克強路28號1樓',
    phone: '02-2832-2528',
    // 來源標記：室內、兒童遊樂設施（樹屋溜滑梯、球池、積木牆、繪本）、包場辦 Party。
    // 明寫「停車場：無」，故不給 parking。
    tags: ['playArea', 'privateRoom', 'indoor'],
    sourceUrl: 'https://www.abic.com.tw/place/view/id/13857',
    verifiedOn: '2026-08-28',
    notes:
      '依身高計費：未滿 100 公分收 50 元清潔費。低消為成人 1 份套餐＋兒童 1 份餐點（套餐 200 元起），另加 10% '
      + '服務費，非固定金額。11:00-20:00，週日公休。來源明載停車場：無。兒童遊戲區適合 4-6 歲，3 歲以下需家長陪同。',
  },
  {
    id: 'rest-tpe-farmtable',
    kind: 'restaurant',
    name: '農人餐桌親子餐廳',
    city: '臺北市',
    district: '中正區',
    address: '臺北市中正區重慶南路二段51號B1',
    phone: '02-2322-3716',
    // 來源標記：室內、兒童遊樂設施（兒童廚房遊戲區）、靠近捷運中正紀念堂站。
    // 明寫「停車場：無」，故不給 parking。位於 B1 但來源未提電梯，故不給 strollerAccess。
    tags: ['playArea', 'nearMetro', 'indoor'],
    ageYears: [0, 3],
    sourceUrl: 'https://www.abic.com.tw/place/view/id/6340',
    verifiedOn: '2026-08-28',
    notes:
      '來源標記「歡迎 0-3 歲」。11:00-22:00，全年無休。來源明載停車場：無。樓上為信誼小太陽親子館（館內適合 1-6 歲），用完餐可接續帶孩子上樓。',
  },
  {
    id: 'rest-ntpc-redbrick',
    kind: 'restaurant',
    name: '紅磚園邸',
    city: '新北市',
    district: '樹林區',
    address: '新北市樹林區太平路247巷9號',
    phone: '02-8686-8999',
    // 來源：園區有門禁管制，需按電鈴並經確認訂位身分才放行入內 → needsBooking。
    // 室內為冷氣用餐區，庭院與水池為戶外。來源未提遊戲區（動物不是遊戲區），故不給 playArea。
    // 停車是鄰近全聯的停車場，非店家自有，故不給 parking，改記在 notes。
    tags: ['needsBooking', 'indoor', 'outdoor'],
    sourceUrl: 'https://boncamica.com/redbrick-eatery/',
    verifiedOn: '2026-08-28',
    bookingUrl:
      'https://inline.app/booking/-NBHLn4ecqm4YGzB8Oqp:inline-live-1/-NB'
      + 'HLnHGFbruoDeVAj9E?language=zh-tw',
    notes:
      '園區有門禁管制，需先按電鈴、確認訂位身分才放行；線上訂位約開放 30 天內時段，週末每時段一位難求。分時段營業：平日 '
      + '11:00-15:30、16:30-19:00；週末 11:00-19:00。用餐時限 2 小時。停車不易——店家無自有停車場，'
      + '來源建議停全聯樹林八德店（步行 1 分鐘）。戶外庭院無遮蔭，夏季曬。園區有水豚與狐獴，開放時間外多在水池或木屋內。',
  },
  {
    id: 'rest-ntpc-chasao',
    kind: 'restaurant',
    name: '茶騷有味香港茶餐廳',
    city: '新北市',
    district: '三重區',
    address: '新北市三重區重新路四段82-84號',
    phone: '02-8973-1565',
    // 來源只寫「鄰近捷運菜寮站」與店內空間，沒有任何設施細目。
    tags: ['nearMetro', 'indoor'],
    sourceUrl: 'https://futureparenting.cwgv.com.tw/family/content/index/36371',
    verifiedOn: '2026-08-28',
    notes:
      '分時段營業：週一至五 11:00-15:00、17:30-21:30；週六日 11:00-21:30。'
      + '鄰近捷運菜寮站與新北大都會公園。來源列在親子友善餐廳懶人包中，但未載明尿布台、哺乳室或遊戲區，去之前建議先電話問。',
  },
  {
    id: 'rest-tyc-cafe4fun',
    kind: 'restaurant',
    name: 'Cafe 4 fun 咖啡趣',
    city: '桃園市',
    district: '桃園區',
    address: '桃園市桃園區信光路52號1-2樓',
    phone: '03-3582066',
    // 官方頁的「服務設施」只列冷氣空調、餐飲、網路 → 僅 indoor。
    // 內文寫「許多可愛的玩具擺飾」，那是擺飾不是遊戲區，故不給 playArea。
    tags: ['indoor'],
    sourceUrl: 'https://travel.tycg.gov.tw/zh-tw/consume/detail/3117',
    verifiedOn: '2026-08-28',
    notes:
      '桃園市政府觀光導覽網收錄，2022 金牌好店（資料來源：桃園市政府經濟發展局）。營業時間週日與週六 11:00-20:30、'
      + '週一至週五 12:00-20:30。官方列出的服務設施只有冷氣空調、餐飲、網路；店內玩具為擺飾，未列獨立遊戲區。',
  },
  {
    id: 'rest-tyc-sinlin',
    kind: 'restaurant',
    name: '忻林園區簡餐咖啡館',
    city: '桃園市',
    district: '新屋區',
    address: '桃園市新屋區永慶二路286巷23號',
    phone: '03-486-4682',
    // 來源：綠地草坪、繽紛花園、沙坑區 → outdoor；沙坑與免費兒童遙控車 → playArea；
    // 房舍建築內的咖啡廳 → indoor。來源未提停車，故不給 parking。
    tags: ['playArea', 'indoor', 'outdoor'],
    sourceUrl: 'https://fullfenblog.tw/taoyuan-parent-child/',
    verifiedOn: '2026-08-28',
    notes:
      '11:00-18:00，週二、三、四公休——一週只營業四天，最容易白跑的一間。園區有綠地草坪、花園與沙坑區，'
      + '用餐可免費玩兒童遙控車，也歡迎帶寵物。來源建議停留 1.5-2 小時。',
  },
  {
    id: 'rest-tcc-island35',
    kind: 'restaurant',
    name: '小島3.5度 Island Aurora',
    city: '臺中市',
    district: '北屯區',
    address: '臺中市北屯區經貿三路二段82號',
    phone: '04-2425-7070',
    // 來源：一樓用餐、二樓整層遊戲區（球池、沙坑、溜滑梯、角色扮演、積木）→ playArea + indoor。
    // 「專屬停車場：無」→ 不給 parking。來源寫「建議務必提前預約」是建議而非預約制，
    // 故不給 needsBooking，改記在 notes。價目標為「平均價位」而非低消，故 minSpend 留空。
    tags: ['playArea', 'indoor'],
    sourceUrl:
      'https://www.cashfeel.com.tw/article/%E5%8F%B0%E4%B8%AD-%E8%A6%AA%'
      + 'E5%AD%90%E9%A4%90%E5%BB%B3-%E6%8E%A8%E8%96%A6',
    verifiedOn: '2026-08-28',
    notes:
      '台中冒險館，恐龍叢林主題。一樓用餐區、二樓整層遊戲區，遊戲區限時控管。來源建議務必提前預約，平日假日都容易客滿。專屬停車場：無，'
      + '來源建議停附近企業園區或路邊收費停車格。來源列的是「平均價位」而非低消：大人約 400-480 元、兒童（80-140 '
      + '公分）250-280 元、80 公分以下免費。',
  },
  {
    id: 'rest-tcc-ourchildhood',
    kind: 'restaurant',
    name: '咱們小時候',
    city: '臺中市',
    district: '北屯區',
    address: '臺中市北屯區祥順一街45號',
    phone: '04-2439-2106',
    // 來源逐項明載：分齡滑梯球池與積木遊戲區 → playArea；二樓星際樂園大人小孩皆須穿襪
    // （現場售襪 50 元）→ socksRequired；二樓包廂與抓週／派對場地租借 → privateRoom；
    // 車車造型兒童餐盤 → kidsTableware。「專屬停車場：無」→ 不給 parking。
    // 有 inline 訂位頁但來源未寫「預約制」，故給 bookingUrl 而不給 needsBooking。
    tags: ['playArea', 'kidsTableware', 'privateRoom', 'indoor', 'socksRequired'],
    ageYears: [0, 6],
    minSpend: 450,
    sourceUrl: 'https://junejunestory.com/ourchildhood/',
    verifiedOn: '2026-08-28',
    bookingUrl:
      'https://inline.app/booking/-LXbXkGwVmvy8ifvNATc:inline-live-2a466'
      + '/-LXbXkL-tWUAq4Vipe4D',
    notes:
      '低消依身高：大人 450 元（141 公分以上）、兒童 250 元（81-140 公分）、80 公分以下免低消，餐點總結另收 '
      + '10% 清潔費。星期二公休；週一及週三至五 12:00-21:00，週六日 11:00-21:00。一般座位用餐 100 分鐘、'
      + '包廂 2 小時；二樓星際樂園不限時，開放至 20:30（假日 21:00），入場大人小孩都要穿襪，現場售襪 50 元。'
      + '大球池較適合 2 歲以上，另設 1 歲以下小寶寶球池。餐點有 0-2 歲寶寶餐與 2-6 歲兒童餐。專屬停車場：無。',
  },
  {
    id: 'rest-tcc-tongyou',
    kind: 'restaurant',
    name: '童遊森林親子餐廳',
    city: '臺中市',
    district: '西屯區',
    address: '臺中市西屯區重慶路99號5F-1',
    phone: '04-2315-0726',
    // 來源只給地址（5F-1）、時間、電話與一句「不一定要用餐／育兒環境完整／停車不易」，
    // 沒有任何設施細目。「育兒環境完整」是評價不是事實，不能當標籤；「停車不易」→ 不給 parking。
    tags: ['indoor'],
    sourceUrl: 'https://helloiammiao.com/taichung_kids/',
    verifiedOn: '2026-08-28',
    notes:
      '10:00-17:00，週一、週四公休。位於大樓 5F-1。來源的親子註記為「不一定要用餐／育兒環境完整／停車不易」，'
      + '未列出遊戲區、尿布台或哺乳室細目，設施請先電話確認。',
  },
  {
    id: 'rest-tnn-bighomesmall',
    kind: 'restaurant',
    name: '大窩與小宅義式餐廳（大窩店）',
    city: '臺南市',
    district: '善化區',
    address: '臺南市善化區光復路208號',
    phone: '06-5816255',
    // 來源：為兒童設計的專屬遊戲空間 → playArea；該區「僅限預訂客」→ needsBooking
    // （條件式，notes 說明清楚）；一二樓室內用餐區 → indoor；綠意植栽庭園 → outdoor。
    // 停車空間在餐廳對面、非店家自有，故不給 parking。
    tags: ['needsBooking', 'playArea', 'indoor', 'outdoor'],
    sourceUrl: 'https://decing.tw/tainan-bighomesmall/',
    verifiedOn: '2026-08-28',
    notes:
      '11:00-21:00。兒童遊戲空間在一樓盡頭，座位設在遊戲區外側；來源記為維護遊戲動線安全，'
      + '該區週末僅限預訂客——想用遊戲區就必須先訂位。用餐空間分一、二樓，被綠意植栽庭園環繞。停車空間在餐廳對面，非店家自有停車場。'
      + '平日中午另有商業飯盒。',
  },
  {
    id: 'rest-tnn-balaoye',
    kind: 'restaurant',
    name: '八老爺車站-乳牛的家',
    city: '臺南市',
    district: '柳營區',
    address: '臺南市柳營區八翁里93之138號',
    phone: '06-622-5199',
    // 來源：園區可餵乳牛、餵麝香豬、看天竺鼠與小鴨、搭五分車 → outdoor；
    // 「館內還提供小朋友最愛的古玩遊戲」→ indoor + playArea。
    tags: ['playArea', 'indoor', 'outdoor'],
    sourceUrl: 'https://fullfenblog.tw/tn-parent-child/',
    verifiedOn: '2026-08-28',
    notes:
      '8:00-17:00，週三公休。型態是休閒農場加保存下來的日式木造車站，不是一般餐廳：園區可餵乳牛吃草、餵麝香豬喝奶、'
      + '近距離看天竺鼠與小鴨，可搭五分車配下午茶，館內另有古玩遊戲。來源建議停留 1-1.5 小時，未列尿布台或兒童餐椅。',
  },
  {
    id: 'rest-khh-ermuyanwu',
    kind: 'restaurant',
    name: '貳木言午',
    city: '高雄市',
    district: '苓雅區',
    address: '高雄市苓雅區林泉街38巷7-1號',
    phone: '07-7214300',
    // 來源用餐規定明寫「採預約制及時段限制」→ needsBooking；「每人低消 500 元」→ minSpend 500；
    // 透明玻璃隔間內的專屬兒童遊戲區 → playArea + indoor。玻璃隔間不是包廂，不給 privateRoom。
    tags: ['needsBooking', 'playArea', 'indoor'],
    minSpend: 500,
    sourceUrl: 'https://supertaste.tvbs.com.tw/food/355974',
    verifiedOn: '2026-08-28',
    notes:
      '採預約制並有時段限制，平日約 3 小時、假日約 2 小時。每人低消 500 元；120 公分以下孩童低消 150 元；另收 '
      + '10% 服務費。日式定食為主、菜單常更新。兒童遊戲區在透明玻璃隔間內（收銀機、玩具蔬果、小廚房、跳跳馬），家長可在座位上看顧。'
      + '不定期舉辦親子五感體驗課程。',
  },
];
