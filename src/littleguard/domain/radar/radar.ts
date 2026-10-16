import type { RadarCell } from '../radarModels';

/**
 * 疫情雷達的狀態判定。
 *
 * 這個服務的用途是提醒家長多留意，不是製造焦慮，所以這裡有兩條硬規則：
 *
 * 1. 文案用「跟平常比」的日常說法。禁用詞見 FORBIDDEN_WORDS，radar.test.ts
 *    會逐條檢查。
 * 2. 顏色最強只到 butter-dark。不用 primary-dark——那是全 app 最強的文字色，
 *    用在「比平常多一點」上會讀成急診警報。
 *
 * 門檻不是手感，是實測分布的百分位：以「本週 ÷ 前 8 週中位數」為基準，近 3 年
 * 54,468 個樣本的 P25/P75/P90 分別是 0.74 / 1.29 / 1.9（中位數 0.99）。這些
 * 數字由 buildDiseaseRadar.cjs 每次重建時算進 JSON 的 calibration，下面的常數
 * 一旦與它脫節，radar.test.ts 就會紅——加進 COVID-19 那一支資料時就是這樣
 * 被抓到的，七種病的分布把 P90 從 1.77 推到 1.9。
 * 曾經考慮過的「前 5 年同週中位數」被否決，因為 2020-2022 的防疫措施讓腸病毒
 * 幾乎消失，那個基線下 ratio 的中位數是 1.63，門檻怎麼訂都會全年亮燈。
 */

export type RadarStatus
  = | 'risingStrong'
    | 'rising'
    | 'steady'
    | 'falling'
    | 'noBaseline'
    | 'none'
    | 'emerged'
    | 'smallSample'
    | 'insufficient';

export type RadarFreshness = 'fresh' | 'stale' | 'expired';

/** 板上的一列：病名配它這一週的格子。板的總結與腸病毒的組成都用這個形狀。 */
export interface DiseaseCell {
  disease: string;
  cell: RadarCell;
}

export const RADAR_THRESHOLDS = { p25: 0.74, p75: 1.29, p90: 1.9 } as const;

/**
 * 「跟全國同一週比」的門檻，一樣是實測分布不是手感：spec §geoRatio 的 42,882
 * 個樣本裡，縣市率 ÷ 全國率的 P25 是 0.66、P75 是 1.19（中位數 0.93）。低於
 * P25 說偏少、高於 P75 說偏多，中間一律說差不多。
 *
 * 與 RADAR_THRESHOLDS 是兩個獨立的問題——一個問「比這裡自己的前 8 週」，一個
 * 問「比全台同一週」，不合併成一個分數。
 */
export const GEO_THRESHOLDS = { p25: 0.66, p75: 1.19 } as const;

/** 資料超過兩個更新週期沒進來就標註，超過五週就收起狀態。 */
export const FRESHNESS_DAYS = { stale: 14, expired: 35 } as const;

export const FORBIDDEN_WORDS = [
  '警戒',
  '升溫',
  '爆發',
  '危險',
  '疫情嚴峻',
  '拉警報',
  '慎防',
] as const;

export const STATUS_COPY: Record<RadarStatus, { label: string; tone: string }> = {
  risingStrong: { label: '最近變多，多留意', tone: 'text-butter-dark' },
  rising: { label: '稍微變多', tone: 'text-ink' },
  steady: { label: '跟平常差不多', tone: 'text-ink-muted' },
  falling: { label: '比平常少', tone: 'text-mint-dark' },
  noBaseline: { label: '還不夠資料比較', tone: 'text-ink-muted' },
  none: { label: '最近沒有個案', tone: 'text-ink-muted' },
  emerged: { label: '這週開始出現', tone: 'text-ink' },
  smallSample: { label: '樣本偏小，僅供參考', tone: 'text-ink-muted' },
  insufficient: { label: '資料不足', tone: 'text-ink-muted' },
};

/**
 * 樣本品質先於比值：分母不到 1,000 時，ratio 的離散度（P90−P10）從 1.20 跳到
 * 2.75 以上，而分母低於 1,000 有超過十分之一的週是零例，比值沒有意義。
 *
 * 「算不出基線」與「基線是零」是兩件事，不能併成一條：前者是我們手上資料不足
 * （前 8 週有效點數不夠，見 buildDiseaseRadar.cjs 的 TREND_MIN_POINTS），後者是
 * 前 8 週真的一例都沒有。把前者說成「這週開始出現」是不實陳述——那格可能一直
 * 都有個案，只是我們算不出比較基準。
 */
export function statusOf(cell: RadarCell): RadarStatus {
  if (cell.reliability === 'insufficient') {
    return 'insufficient';
  }

  if (cell.reliability === 'small') {
    return 'smallSample';
  }

  if (cell.trendBase === null) {
    return 'noBaseline';
  }

  if (cell.trendBase === 0) {
    return (cell.rate ?? 0) > 0 ? 'emerged' : 'none';
  }

  return ratioStatus(cell.ratio);
}

function ratioStatus(ratio: number | null): RadarStatus {
  // 基線既非 null 也非 0 時 ratio 不該是 null；真的發生就承認算不出來，
  // 而不是回「跟平常差不多」替資料背書。
  if (ratio === null) {
    return 'noBaseline';
  }

  if (ratio >= RADAR_THRESHOLDS.p90) {
    return 'risingStrong';
  }

  if (ratio >= RADAR_THRESHOLDS.p75) {
    return 'rising';
  }

  if (ratio >= RADAR_THRESHOLDS.p25) {
    return 'steady';
  }

  return 'falling';
}

export function freshnessOf(
  weekEnd: string,
  today: Date = new Date(),
): RadarFreshness {
  const end = new Date(`${weekEnd}T00:00:00Z`);

  const days = Math.floor(
    (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
      - end.getTime())
    / 86400000,
  );

  if (days > FRESHNESS_DAYS.expired) {
    return 'expired';
  }

  if (days > FRESHNESS_DAYS.stale) {
    return 'stale';
  }

  return 'fresh';
}

export function formatRate(rate: number | null): string {
  return rate === null ? '—' : `${rate.toFixed(1)}/萬`;
}

/** 「8/23–8/29」：家長看得懂日期，看不懂「第 34 週」。 */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const [, startMonth, startDay] = weekStart.split('-');
  const [, endMonth, endDay] = weekEnd.split('-');

  return `${Number(startMonth)}/${Number(startDay)}–${Number(endMonth)}/${Number(endDay)}`;
}

/**
 * 家長講「零到兩歲」，不講「0~2」。板上的年齡籤與抽屜的句子共用這一份；上游
 * 哪天多切一個年齡層，取不到就退回原字串，籤照樣選得動。
 */
export const AGE_LABEL: Record<string, string> = {
  '0~2': '0-2 歲',
  '3~6': '3-6 歲',
  '7~12': '7-12 歲',
};

/** 「比平常多」的三種狀態。比平常少、跟平常差不多與資料不足都不必特別提。 */
const NOTABLE: readonly RadarStatus[] = ['risingStrong', 'rising', 'emerged'];

/**
 * 比較得出來、而且沒有變多的三種狀態。剩下的（算不出基線、樣本偏小、資料不足）
 * 是「不知道」，不是「沒事」，所以總結不能把它們算進「其他」。
 */
const CALM: readonly RadarStatus[] = ['steady', 'falling', 'none'];

/**
 * 整塊板的一句話。
 *
 * 每週打開的家長要的是「這禮拜有沒有什麼要留意的」，不是自己讀四列狀態再心算。
 * 沒有哪一列變多時也要把話說完整：一行只在有事時才出現的字，本身就是警示燈
 * 號，而「這一週沒有哪一種比平常明顯多」才是多數週該看到的句子。
 *
 * 但那句話得有東西撐著。整塊板一列都比不出來時就不能給——「沒有哪一種比平常明
 * 顯多」是拿不存在的資料讓人安心，而板上那四列明明白白寫著「資料不足」。
 */
export function summariseBoard(rows: readonly DiseaseCell[]): string {
  const notable = rows.filter((row) => NOTABLE.includes(statusOf(row.cell)));

  if (notable.length === 0) {
    // 連江縣 0-2 歲整塊板都是「資料不足」，這一行就得跟著承認比不出來，不能反
    // 過來替沒有的資料背書。一列比得出來就夠撐起那句話：其餘每一列都已經在板
    // 上自己說了狀態。
    if (rows.length > 0 && !rows.some((row) => CALM.includes(statusOf(row.cell)))) {
      return '這一週的資料還不夠，比不出這幾種病最近多還是少。';
    }

    return '這一週沒有哪一種比平常明顯多。';
  }

  const names = inSentence(notable.map((row) => row.disease).join('、'));
  const rest = rows.filter((row) => !NOTABLE.includes(statusOf(row.cell)));

  // 「其他」要嘛說得準，要嘛不說。每一列都在變多時那個「其他」是空的；剩下
  // 的列裡只要有一列比不出來，就不能替它保證「跟平常差不多」——板上那一列
  // 明明寫著「還不夠資料比較」。
  if (rest.length === 0 || !rest.every((row) => CALM.includes(statusOf(row.cell)))) {
    return `這一週${names}比平常多。`;
  }

  return `這一週${names}比平常多，其他沒有變多。`;
}

/**
 * 比不出來的時候照實說，而且用板上同一套說法：家長剛在那一列讀過「還不夠資料
 * 比較」，抽屜裡再換一組講法，只會讓人以為是兩件不同的事。
 */
function reasonWithoutRatio(cell: RadarCell): string {
  if (cell.trendBase === 0) {
    return (cell.rate ?? 0) > 0 ? STATUS_COPY.emerged.label : STATUS_COPY.none.label;
  }

  return STATUS_COPY.noBaseline.label;
}

/**
 * 中文句子裡夾一個西文病名時前後留空白。
 *
 * 「COVID-19比平常多」「次因COVID-19就診」擠在一起，而這個 repo 其他文案一律
 * 是「WHO 的標準」「14 次公費產檢」這種寫法。
 *
 * 判準寫成「頭尾是不是拉丁字母或數字」而不是「是不是漢字」：純中文病名加了會
 * 變成「類流感 比平常多」，而全形括號之類的標點自己就帶了間距，兩者都不該加。
 */
export function inSentence(name: string): string {
  const head = /^[0-9A-Za-z]/.test(name) ? ' ' : '';
  const tail = /[0-9A-Za-z]$/.test(name) ? ' ' : '';

  return `${head}${name}${tail}`;
}

/**
 * 抽屜的第一句：這一格的白話版。
 *
 * 「423.0/萬」是統計人員的單位，家長讀不出任何可以做的事；「台北市 0-2 歲這
 * 週有 413 次因類流感就診，比前 8 週的平常值多約 44%」講的是同一件事，而且不
 * 用先學單位。差距四捨五入不到 5% 就說差不多——那個位數的變動是雜訊，寫成
 * 「多約 3%」等於把雜訊講成趨勢。
 *
 * 翻倍以上改講「幾倍」：「多約 165%」要在腦子裡先加一次才知道是多少，而
 * 「大約是平常的 2.7 倍」直接就是那個意思。門檻放在剛好翻倍，因為那正是兩種
 * 說法一樣清楚的地方。往下掉不用這一套——再怎麼掉都不會超過 100%，而「0.4 倍」
 * 比「少約 60%」難讀。
 */
export function describeVisits(input: {
  county: string;
  age: string;
  disease: string;
  cell: RadarCell;
}): string {
  const { county, age, disease, cell } = input;
  const head = `${county} ${AGE_LABEL[age] ?? age}這一週有 ${cell.visits} 次因${inSentence(disease)}就診`;

  if (cell.ratio === null) {
    return `${head}，${reasonWithoutRatio(cell)}。`;
  }

  const percent = Math.round(Math.abs(cell.ratio - 1) * 100);

  if (percent < 5) {
    return `${head}，跟前 8 週的平常值差不多。`;
  }

  if (percent >= 100) {
    return `${head}，大約是前 8 週平常值的 ${cell.ratio.toFixed(1)} 倍。`;
  }

  return `${head}，比前 8 週的平常值${cell.ratio > 1 ? '多' : '少'}約 ${percent}%。`;
}

/** 抽屜的第二句：跟全國同一週比。geoRatio 算不出來就不給句子，不編一個。 */
export function describeGeoRatio(geoRatio: number | null): string | null {
  if (geoRatio === null) {
    return null;
  }

  const where
    = geoRatio < GEO_THRESHOLDS.p25

      ? '偏少'

      : geoRatio > GEO_THRESHOLDS.p75

        ? '偏多'

        : '差不多';

  return `跟全國同一週相比，這裡${where}。`;
}
