import type { ToddlerWikiArticle } from '../records';
import { TODDLER_MAX_MONTHS, TODDLER_MIN_MONTHS } from '../ageBands';

/**
 * 依孩子的月齡決定百科文章的閱讀順序。
 *
 * 45 篇文章依分類排列，對「孩子現在 1 歲 2 個月，我該先看什麼」這個問題毫無
 * 幫助——如廁訓練排在最前面，但那是 18 個月後的事；而這個年紀真正該看的戒
 * 奶瓶、學步期居家安全散在清單中段。
 *
 * 這裡只重排順序，不做篩選。半夜搜「發燒」的家長必須找得到那一篇，跟孩子幾
 * 歲無關，所以任何年齡的文章都留在清單上，搜尋與分類篩選也照舊。
 */

/**
 * 百科的年齡分段，刻意比 `TODDLER_AGE_BANDS` 粗。
 *
 * 成長檢核用五段（12-15/15-18/18-24/24-30/30-36），因為那是逐項勾選的發展
 * 題目，三個月的差別是有意義的。百科不是——文章自己講的是「1 歲後」「1 歲半」
 * 「2-3 歲」，官方與場館的資料也只公告到歲。
 *
 * 而且細分在這裡量不出東西：以五段篩選 45 篇，各段分別命中
 * 33/33/35/40/42 篇，因為三分之二的內容橫跨整個幼兒期。分那麼細只是讓家長
 * 多滑幾下，得到幾乎一樣的清單。
 *
 * 三段剛好在 390px 的手機上和「全部」並排成一列，不必橫向滑動。
 */
export interface WikiStage {
  id: string;
  label: string;
  start: number;
  end: number;
}

export const WIKI_STAGES: WikiStage[] = [
  { id: '12-18', label: '1 歲-1 歲半', start: 12, end: 18 },
  { id: '18-24', label: '1 歲半-2 歲', start: 18, end: 24 },
  { id: '24-36', label: '2-3 歲', start: 24, end: 36 },
];

/** 這個月齡屬於哪一段；範圍外夾到最近的一端。 */
export function stageForMonths(ageMonths: number): WikiStage {
  for (let i = WIKI_STAGES.length - 1; i >= 0; i--) {
    if (ageMonths >= WIKI_STAGES[i].start) {
      return WIKI_STAGES[i];
    }
  }

  return WIKI_STAGES[0];
}

export type WikiRelevance
  /** 現在正是這篇適用的月齡 */
  = | 'now'
  /** 半年內就會用到 */
    | 'soon'
  /** 還很遠 */
    | 'later'
  /** 適用月齡已經過去 */
    | 'past';

/** 「半年內會用到」的界線。抓得比這更遠就變成一整頁的待辦，失去排序的意義。 */
const SOON_MONTHS = 6;

export function relevanceFor(
  article: ToddlerWikiArticle,
  ageMonths: number,
): WikiRelevance {
  const [start, end] = article.ageRange;

  if (ageMonths >= end) {
    return 'past';
  }

  if (ageMonths >= start) {
    return 'now';
  }

  return start - ageMonths <= SOON_MONTHS ? 'soon' : 'later';
}

const TIER_ORDER: Record<WikiRelevance, number> = {
  now: 0,
  soon: 1,
  later: 2,
  // 過去的排最後而不是刪掉：孩子兩歲時仍可能回頭查戒奶嘴。
  past: 3,
};

/**
 * 依相關度重排，不改變內容也不移除任何一篇。
 *
 * 同一層之內先看起始月齡較晚的：階段性的內容（24-30 個月的手足競爭）比橫跨
 * 整個幼兒期的常備知識（12-36 個月的居家安全）更貼近「現在」。起始相同時，
 * 適用區間較窄的先出現，最後才用原本的順序讓結果穩定。
 */
export function sortByRelevance(
  articles: readonly ToddlerWikiArticle[],
  ageMonths: number,
): ToddlerWikiArticle[] {
  return articles
    .map((article, index) => ({ article, index }))
    .sort((a, b) => {
      const tierDiff
        = TIER_ORDER[relevanceFor(a.article, ageMonths)]
          - TIER_ORDER[relevanceFor(b.article, ageMonths)];

      if (tierDiff !== 0) {
        return tierDiff;
      }

      const startDiff = b.article.ageRange[0] - a.article.ageRange[0];

      if (startDiff !== 0) {
        return startDiff;
      }

      const widthDiff
        = a.article.ageRange[1]
          - a.article.ageRange[0]
          - (b.article.ageRange[1] - b.article.ageRange[0]);

      if (widthDiff !== 0) {
        return widthDiff;
      }

      return a.index - b.index;
    })
    .map((entry) => entry.article);
}

/**
 * 月齡的口語說法。起始月齡都落在既有的年齡段界線上（12/15/18/24/30），
 * 所以「18」要讀成「1 歲半」而不是「18 個月」。
 */
export function monthsLabel(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;

  if (rest === 0) {
    return `${years} 歲`;
  }

  if (rest === 6) {
    return `${years} 歲半`;
  }

  return `${years} 歲 ${rest} 個月`;
}

/**
 * 這篇是否與某個年齡段有交集，用來做年齡篩選。
 *
 * 交集判定而不是包含判定：一篇 18-36 個月的文章對 24-30 這個段當然有用，
 * 不需要它的區間完整落在段內。
 *
 * 這個篩選之所以安全，是因為橫跨整個幼兒期的內容（居家安全、哽噎、燒燙傷、
 * 熱痙攣、常備藥）區間都是 12-36，和每一段都有交集，所以任何年齡段都篩不掉
 * 它們。被篩掉的只有真的還沒到的階段性內容。
 */
export function overlapsBand(
  article: ToddlerWikiArticle,
  bandStart: number,
  bandEnd: number,
): boolean {
  const [start, end] = article.ageRange;

  return start < bandEnd && end > bandStart;
}

/**
 * 卡片上的小標籤。
 *
 * 只標「階段性」的文章。三分之二的文章區間是 12-36——它們隨時都用得上，
 * 對每一個年齡都「現在適用」，所以標了等於沒標：實測 26 個月時會有 40 張
 * 卡片掛著同一個徽章，徽章就不再是資訊。
 */
export function relevanceTag(
  article: ToddlerWikiArticle,
  ageMonths: number,
): string | undefined {
  const [start, end] = article.ageRange;
  const spansWholePeriod = start <= TODDLER_MIN_MONTHS && end >= TODDLER_MAX_MONTHS;

  if (spansWholePeriod) {
    return undefined;
  }

  const relevance = relevanceFor(article, ageMonths);

  if (relevance === 'now') {
    return '現在適用';
  }

  if (relevance === 'past') {
    return undefined;
  }

  return `${monthsLabel(start)}後`;
}
