/**
 * 各縣市親子館的入館規則。
 *
 * 為什麼要有這個檔
 *   社家署的全國名冊只有名稱、地址、電話，沒有任何「能不能進去、要不要預約、
 *   要不要錢、限不限戶籍」的資訊。而這四件事正好是家長出門前唯一真正需要知道
 *   的——名單告訴你館在哪，這個檔告訴你去了能不能玩。
 *
 * 為什麼只有四個縣市
 *   規則是逐縣市查證的，一個縣市一個縣市讀官方頁面。查到的就寫，查不到的就
 *   不寫，並在 UI 顯示 CENTRE_ACCESS_UNVERIFIED。把臺北的規則套到雲林，或把
 *   「大概都差不多」寫成事實，比沒有資訊更糟：家長會照著錯的規則出門。
 *
 * 每一條規則自己帶 sourceUrl 與 verifiedOn，而不是整個縣市共用一組。原因是
 *   同一縣市的四件事常散落在不同官方頁面（社會局公告、育兒資源網 FAQ、受委辦
 *   單位的館頁），共用一組來源會讓其中三條的出處變成假的。
 *
 * 查不到的規則也是一條規則
 *   例如新北市的戶籍限制：官方報名須知通篇沒有提到戶籍。這種情況不留空白，
 *   而是把「在這一頁、這一天，查不到明文」寫成 value——空白會被讀成「沒有
 *   限制」，那是我們沒有查證過的推論。
 */

/** 一條可查核的規則。value 的每個字都對得上 sourceUrl 上的原文。 */
export interface AccessRule {
  /** 給家長看的一句話。 */
  value: string;
  /** 這一條的查證來源。 */
  sourceUrl: string;
  /** 最後查證日期，YYYY-MM-DD。 */
  verifiedOn: string;
}

export interface CentreAccess {
  city: string;
  /** 是否免費。 */
  fee: AccessRule;
  /** 年齡對象（含陪同者的限制）。 */
  ageLimit: AccessRule;
  /** 預約方式。 */
  booking: AccessRule;
  /** 戶籍限制。 */
  residency: AccessRule;
  /** 容易讓家長白跑一趟的細節，例如停權機制。 */
  notes?: string;
}

/** 沒有查證過的縣市一律顯示這句，不要顯示空白，也不要拿別縣市的規則頂替。 */
export const CENTRE_ACCESS_UNVERIFIED = '該縣市規則尚未查證，請以各館公告為準。';

/**
 * 場館資料的來源標示。UI 必須逐字顯示這一句。
 *
 * 這不是禮貌，是授權條件：政府資料開放授權條款第 1 版第 4 條要求利用者顯名
 * 標示資料提供機關與來源，並明定「未依格式標示者，視為自始未取得授權」。
 * 也就是說少了這行字，我們連用這份資料的權利都沒有。
 *
 * 放在這個檔而不是產生 JSON 的 scripts/buildFamilyCentres.cjs：那是 CommonJS
 * 建置腳本，前端無法 import，字串留在那裡就永遠上不了畫面。這個檔本來就是
 * 「親子館資料在法律與事實上必須照抄的字串」的家（另一個是
 * CENTRE_ACCESS_UNVERIFIED），所以兩者放一起，只留一份。
 */
export const CENTRE_DATA_ATTRIBUTION
  = '資料來源：衛生福利部社會及家庭署《全國親子館(托育資源中心)名冊(115.06)》、'
    + '臺北市政府社會局「臺北市嬰幼兒照顧服務_育兒友善園」，'
    + '依政府資料開放授權條款第 1 版釋出。查證日期 2026-08-28。';

const TAIPEI_DOSW
  = 'https://dosw.gov.taipei/News_Content.aspx?n=ECD24F27761B54C4&sms='
    + 'EBA8590AB15CF80C&s=1423C84690F0CFB5';

const NTPC_SIGNUP = 'https://lovebaby.sw.ntpc.gov.tw/#/course-signupcourse';
const TAOYUAN_FAQ = 'https://babycare.tycg.gov.tw/#/faq-list';
const TAOYUAN_WUCHUAN = 'https://family.safe.org.tw/7/wuchuan/service_results/';

const TAICHUNG_FAQ
  = 'https://parent-child.taichung.gov.tw/sub/faq/index.aspx?Parser=26,24,155,152';

const TAICHUNG_DOSW = 'https://www.society.taichung.gov.tw/461416/post';
const TAICHUNG_NEWS = 'https://www.taichung.gov.tw/2592679/post';

const VERIFIED_ON = '2026-08-28';

export const CENTRE_ACCESS: Record<string, CentreAccess> = {
  臺北市: {
    city: '臺北市',
    fee: {
      value: '免費。社會局載明提供家長和 6 歲以下孩子免費使用遊戲空間與育兒資源。',
      sourceUrl: TAIPEI_DOSW,
      verifiedOn: VERIFIED_ON,
    },
    ageLimit: {
      value: '服務對象為 6 歲以下兒童及其照顧者。',
      sourceUrl: TAIPEI_DOSW,
      verifiedOn: VERIFIED_ON,
    },
    booking: {
      value:
        '空間與活動皆可透過「臺北育兒網」線上預約報名。各館每場次名額與現場排隊方式由各館公告，未見全市統一規定。',
      sourceUrl: TAIPEI_DOSW,
      verifiedOn: VERIFIED_ON,
    },
    residency: {
      value: '社會局頁面未見設籍限制之明文；是否限本市市民請以各館公告為準。',
      sourceUrl: TAIPEI_DOSW,
      verifiedOn: VERIFIED_ON,
    },
    notes:
      '臺北市另有 13 處「育兒友善園」，是規模更小的社區據點，和親子館不是同一種服務，場館清單裡以獨立標註呈現。',
  },

  新北市: {
    city: '新北市',
    fee: {
      value:
        '遊戲空間免費開放給 0-6 歲幼兒；但「主題活動」原則每場次新臺幣 100 元（內含材料費），須在報名後 3 個開館日內繳費才算報名成功。',
      sourceUrl: NTPC_SIGNUP,
      verifiedOn: VERIFIED_ON,
    },
    ageLimit: {
      value: '遊戲空間以免費開放給 0-6 歲幼兒為原則。',
      sourceUrl: NTPC_SIGNUP,
      verifiedOn: VERIFIED_ON,
    },
    booking: {
      value:
        '預約報名制，須先在「新北育兒資訊網」註冊會員。有老師帶領的「主題活動」一律線上報名；'
        + '無老師帶領的「親子自由探索」依各館規劃採線上報名或電話預約。每月 1 日 12:00 公告次月行事曆，15 日 12:00 '
        + '開放次月報名。',
      sourceUrl: NTPC_SIGNUP,
      verifiedOn: VERIFIED_ON,
    },
    residency: {
      value: '官方報名須知未見戶籍限制之明文，此項未經確認，請先電洽各館。',
      sourceUrl: NTPC_SIGNUP,
      verifiedOn: VERIFIED_ON,
    },
    notes:
      '有停權機制：同一帳號 60 天內累計 5 筆「取消」或「逾期繳費」，會被停止親子館報名權限 60 天。每週一及政府公告放假日休館。',
  },

  桃園市: {
    city: '桃園市',
    fee: {
      value:
        '免費。提供家長與 6 歲以下孩子免費使用親子共玩空間及育兒資源，並提供教玩具與圖書外借。',
      sourceUrl: TAOYUAN_WUCHUAN,
      verifiedOn: VERIFIED_ON,
    },
    ageLimit: {
      value:
        '服務 0-6 歲且尚未就讀小學的幼兒。陪同者須為父母、法定監護人或 18 歲以上成人（依兒少權法第 51 條），每名幼兒至少 1 位、至多 2 位陪同。',
      sourceUrl: TAOYUAN_FAQ,
      verifiedOn: VERIFIED_ON,
    },
    booking: {
      value:
        '不預約也能去：可現場排隊或候補入館，額滿時填候補資料等通知。每場次開放 40 組親子，滿館採一進一出。線上預約者須在開館後 15 '
        + '分鐘內（09:15、14:15）報到，逾時名額釋放給現場排隊的人。閉館前 30 分鐘不再開放入館。',
      sourceUrl: TAOYUAN_FAQ,
      verifiedOn: VERIFIED_ON,
    },
    residency: {
      value:
        '明文不限戶籍：「每個人不分國籍、居住縣市，皆可參訪親子館」。沒有臺灣戶籍也能加入會員，身分證欄可填居留證號，幼兒可填護照號碼；'
        + '完全沒有證號的外國旅客則可現場排隊或候補。',
      sourceUrl: TAOYUAN_FAQ,
      verifiedOn: VERIFIED_ON,
    },
    notes:
      '課程活動於開課 14 天前開放線上預約，每日 09:00 起報名，活動前一天 12:00 截止；當日不能線上預約，只能現場排隊。',
  },

  臺中市: {
    city: '臺中市',
    fee: {
      value:
        '免費。市府載明親子館「提供免費且完整的兒童照顧資源服務」，圖書與教玩具借閱亦免費。',
      sourceUrl: TAICHUNG_NEWS,
      verifiedOn: VERIFIED_ON,
    },
    ageLimit: {
      value:
        '服務對象為 6 歲以下學齡前嬰幼兒及其照顧者。超過 6 歲但還沒上小一也可入館，現場會查驗幼兒證件；陪同成人須年滿 20 歲。',
      sourceUrl: TAICHUNG_DOSW,
      verifiedOn: VERIFIED_ON,
    },
    booking: {
      value:
        '可於 3 天前在「臺中市育兒資源網」線上預約，一次只能預約一個時段。不預約也能去：當日一律現場報名，依候補順序入館。閉館前 30 分鐘不再開放入館。',
      sourceUrl: TAICHUNG_FAQ,
      verifiedOn: VERIFIED_ON,
    },
    residency: {
      value:
        '入館明文不限戶籍：「外縣市或外國旅客也可以線上加入網路會員並使用預約功能，若沒有加入會員亦可現場排隊或候補入館」。'
        + '但教玩具借閱證另有限制，須本人戶籍在臺中市且育有 3 歲以下幼童。',
      sourceUrl: TAICHUNG_FAQ,
      verifiedOn: VERIFIED_ON,
    },
    notes:
      '入館要帶大人與小孩的證件（健保卡、身分證等），大人須穿室內軟鞋或襪子。預約後累計 3 次未到，90 天內無法預約全市任何一間親子館。',
  },
};

// 查詢就是 CENTRE_ACCESS[city]；查不到是 undefined，呼叫端顯示
// CENTRE_ACCESS_UNVERIFIED，不要拿別縣市的規則頂替。這裡刻意不包一層
// getter，多一層只是把同樣的索引動作換個名字。
