import { ROUTE_PATH, type Page } from '../routes';
import { requiresAuth } from '../routePolicy';

export const SITE_ORIGIN = 'https://littlesteps-c6ab6.web.app';
const SITE_NAME = 'LittleSteps';

interface PageMeta {
  /** <title>；已含服務名，不要再另外串。 */
  title: string;
  description: string;
}

/**
 * 每一頁的 title 與 description。
 *
 * 只有公開頁面值得寫得像搜尋結果——它們是唯一會被索引的頁。需登入的頁面
 * 仍然給一組像樣的文字，因為分享到 LINE 時 og:title 也吃這裡；但它們一律
 * 帶 noindex，不會進搜尋結果。
 *
 * description 一律照著「這頁實際上有什麼」寫，不寫行銷詞。搜尋結果的摘要
 * 對不上內容，使用者點進來就跳出，排名只會更差。
 */
const PAGE_META: Record<Page, PageMeta> = {
  home: {
    title: 'LittleSteps｜從孕期到 3 歲的台灣育兒陪伴',
    description:
      '孕期產檢、寶寶里程碑與疫苗、幼兒發展檢核、親子好去處、全台哺乳室地圖與每週兒童傳染病。六個服務，陪台灣爸媽走過每個階段。',
  },
  about: {
    title: '關於資料與來源｜LittleSteps',
    description:
      '孩子的紀錄存在哪裡、誰看得到、我們用它做什麼，以及每一頁的內容出自哪一份政府或 WHO 的公開資料。',
  },
  littlesteps: {
    title: 'LittleSteps 寶寶追蹤｜0-1 歲里程碑、疫苗與日常記錄',
    description:
      '記錄 0-1 歲寶寶的發展里程碑、疫苗接種、副食品與每日餵奶睡眠，並可產生看診摘要。',
  },
  'littlesteps/dashboard': {
    title: '成長總覽｜LittleSteps',
    description: '一頁看完寶寶的里程碑進度、下一劑疫苗、今日記錄與睡眠趨勢。',
  },
  'littlesteps/milestones': {
    title: '寶寶發展里程碑追蹤｜LittleSteps',
    description:
      '依月齡整理的寶寶發展里程碑，逐項記錄達成日期，掌握大動作、精細動作與語言發展。',
  },
  'littlesteps/care-guide': {
    title: '0-1 歲寶寶照顧重點｜各月齡注意事項｜LittleSteps',
    description:
      '依月齡整理新生兒到 1 歲的照顧重點：餵食、睡眠、安全與常見狀況，內容標註資料來源與查證日期。',
  },
  'littlesteps/vaccine-tracking': {
    title: '寶寶疫苗接種時程追蹤｜公費、健保給付與自費｜LittleSteps',
    description:
      '依衛福部建議時程記錄寶寶疫苗接種，逐劑標明公費、健保有條件給付或自費與出處，含接種時機與可能副作用。',
  },
  'littlesteps/complementary-food': {
    title: '副食品添加完整指南｜4-12 個月｜LittleSteps',
    description:
      '副食品添加時機與原則、三階段奶量轉換、月份菜單、蔬果過敏等級與 4×3 試敏法，並可記錄寶寶的食物嘗試。',
  },
  'littlesteps/daily-log': {
    title: '快速日誌｜餵奶、睡眠與尿布記錄｜LittleSteps',
    description: '三個按鈕記錄餵奶、睡眠與尿布，累積成可分析的日常照顧資料。',
  },
  'littlesteps/growth-charts': {
    title: '寶寶成長曲線圖｜身高體重頭圍百分位｜LittleSteps',
    description:
      '依 WHO 兒童生長標準計算身高、體重與頭圍百分位，追蹤寶寶的成長趨勢。',
  },
  'littlesteps/sleep-training': {
    title: '寶寶睡眠訓練指南｜各月齡睡眠需求｜LittleSteps',
    description:
      '各月齡的睡眠需求時數、常見睡眠訓練方法與作息安排建議，內容標註資料來源。',
  },
  'littlesteps/sleep-analysis': {
    title: '寶寶睡眠分析｜LittleSteps',
    description: '從日誌分析寶寶的睡眠時數、夜醒次數與規律性，找出作息問題。',
  },
  'littlesteps/baby-wiki': {
    title: '寶寶百科｜0-1 歲常見狀況與處理方式｜LittleSteps',
    description:
      '新生兒到 1 歲常見狀況的成因、處理方式與就醫時機，每篇標註衛福部或醫院來源與查證日期。',
  },
  'littlesteps/clinic-summary': {
    title: '看診摘要｜一鍵整理寶寶就醫資料｜LittleSteps',
    description: '把成長、疫苗與近期日常記錄整理成一頁，看診時直接給醫師看。',
  },
  'littlesteps/report': {
    title: '週報月報｜寶寶照顧數據趨勢｜LittleSteps',
    description: '把每日記錄彙整成週報與月報，看出餵奶、睡眠與尿布的長期趨勢。',
  },
  littlebloom: {
    title: 'LittleBloom 孕期陪伴｜每週身體變化與產檢時程',
    description:
      '依懷孕週數顯示身體變化與本週提醒，管理 14 次公費產檢時程，出生後轉為寶寶檔案。',
  },
  'littlebloom/prenatal': {
    title: '產檢時程表｜14 次公費產檢｜LittleBloom',
    description:
      '依末次月經自動排出 14 次公費產檢時程，記錄每次產檢的日期、院所與備註。',
  },
  'littlebloom/wiki': {
    title: '孕期知識庫｜常見孕期狀況與就醫時機｜LittleBloom',
    description:
      '孕吐、妊娠糖尿病、產兆判斷等常見孕期狀況的成因與處理方式，每篇標註來源與查證日期。',
  },
  littleexplorer: {
    title: 'LittleExplorer 幼兒陪伴｜1-3 歲發展檢核',
    description: '依年齡分段的幼兒發展檢核、健檢與疫苗提醒、成長日記與幼兒百科。',
  },
  'littleexplorer/reminders': {
    title: '幼兒健檢與疫苗提醒｜LittleExplorer',
    description:
      '依出生日排出兒童健檢、疫苗與塗氟時程，逾期與即將到期一目了然，可加入 Google 日曆。',
  },
  'littleexplorer/diary': {
    title: '成長日記｜LittleExplorer',
    description: '記下那些不會出現在數據裡的時刻，依月份整理成孩子的成長軌跡。',
  },
  'littleexplorer/wiki': {
    title: '幼兒百科｜1-3 歲照顧問題｜LittleExplorer',
    description:
      '如廁訓練、語言發展、入園準備、睡眠轉換等 1-3 歲常見照顧問題，依年齡篩選，每篇標註來源與查證日期。',
  },
  littleouting: {
    title: '全台親子館與親子餐廳｜LittleOuting',
    description:
      '全台公共托育中心、親子館與親子餐廳名冊，可依縣市篩選，含預約方式、適合年齡與聯絡電話。',
  },
  babyoasis: {
    title: '全台哺乳室地圖｜3,852 處哺乳室查詢｜BabyOasis',
    description:
      '全台 3,852 處哺乳室的地圖查詢，依所在位置找出最近的哺乳室，資料來源為政府公開資料。',
  },
  littleguard: {
    title: '兒童傳染病這週多不多｜疫情雷達｜LittleGuard',
    description:
      '腸病毒、手足口病、疱疹性咽峽炎、類流感、COVID-19、腹瀉、水痘的每週門診就診情況，可依縣市與孩子年齡查看，資料來自衛福部疾管署開放資料。',
  },
};

export interface ResolvedMeta extends PageMeta {
  canonical: string;
  /** 讀得到某個孩子資料的頁面一律不進搜尋結果。 */
  noindex: boolean;
  siteName: string;
}

export function metaFor(page: Page): ResolvedMeta {
  return {
    ...PAGE_META[page],
    canonical: `${SITE_ORIGIN}${ROUTE_PATH[page]}`,
    noindex: requiresAuth(page),
    siteName: SITE_NAME,
  };
}

/** 會被索引的頁面；sitemap 與預先產生 HTML 都只認這一份。 */
export const INDEXABLE_PAGES = (Object.keys(ROUTE_PATH) as Page[]).filter(
  (page) => !requiresAuth(page),
);
