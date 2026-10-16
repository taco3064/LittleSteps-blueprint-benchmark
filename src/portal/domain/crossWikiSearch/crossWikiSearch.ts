import { matchesKeyword } from '~app/knowledge/domain/matchesKeyword';
import type { Page } from '../routes';
import type { ServiceId } from '../serviceCatalogue';

/**
 * 跨知識庫搜尋。
 *
 * 三個知識庫共 85 篇文章，每一篇都標了衛福部或醫院來源與查證日期——這是
 * 這個 app 真正稀有的東西。但它們被切成三份互不相通：家長在幼兒百科搜
 * 「發燒」，看不到寶寶百科裡那幾篇更詳細的。而家長的問題不管服務邊界。
 *
 * 只回「標題、摘要、在哪個服務」這種輕量結果，不回整篇。要看內文就跳到
 * 那個知識庫，關鍵字會跟著帶過去。
 */

export interface CrossWikiHit {
  id: string;
  title: string;
  summary: string;
  service: ServiceId;
  page: Page;
  /** 給家長看的來源說明，例如「寶寶百科 · 0-1 歲」。 */
  sourceLabel: string;
}

interface WikiSource {
  service: ServiceId;
  page: Page;
  sourceLabel: string;
  load: () => Promise<{
    articles: readonly Parameters<typeof matchesKeyword>[0][];
  }>;
}

/**
 * 資料是動態載入的，這是刻意的例外。
 *
 * 三個資料檔加起來是整個 bundle 裡最大的靜態內容（幼兒百科單獨就 37 KB
 * gzip）。靜態 import 會讓每一個知識庫頁面都背上另外兩個的全文，而使用者
 * 多半只是在讀當前這一個。改成第一次真的輸入關鍵字時才載入。
 */
const SOURCES: WikiSource[] = [
  {
    service: 'littlesteps',
    page: 'littlesteps/baby-wiki',
    sourceLabel: '寶寶百科 · 0-1 歲',
    load: async () => ({
      articles: (await import('~app/knowledge/domain/babyWiki'))
        .babyWikiArticles,
    }),
  },
  {
    service: 'littlebloom',
    page: 'littlebloom/wiki',
    sourceLabel: '孕期知識庫',
    load: async () => ({
      articles: (await import('~app/knowledge/domain/wiki'))
        .pregnancyWikiArticles,
    }),
  },
  {
    service: 'littleexplorer',
    page: 'littleexplorer/wiki',
    sourceLabel: '幼兒百科 · 1-3 歲',
    load: async () => ({
      articles: (await import('~app/knowledge/domain/toddlerWiki'))
        .toddlerWikiArticles,
    }),
  },
];

/** 帶著關鍵字跳到另一個知識庫時要附上的 query string。 */
export function wikiSearchQuery(query: string): string {
  return `q=${encodeURIComponent(query.trim())}`;
}

/** 從網址讀回關鍵字，讓跨服務跳轉落在搜尋中間而不是從頭開始。 */
export function queryFromLocation(search: string): string {
  return new URLSearchParams(search).get('q')?.trim() ?? '';
}

/**
 * 搜尋「除了目前這個服務以外」的知識庫。
 *
 * 排除自己是因為當前頁面已經在顯示自己的結果；重複列一次只會讓人以為
 * 搜到了兩篇。
 */
export async function searchOtherWikis(
  query: string,
  currentService: ServiceId,
  limit = 6,
): Promise<CrossWikiHit[]> {
  const keyword = query.trim().toLowerCase();

  if (keyword === '') {
    return [];
  }

  const sources = SOURCES.filter((source) => source.service !== currentService);

  const loaded = await Promise.all(
    sources.map(async (source) => ({
      source,
      articles: (await source.load()).articles,
    })),
  );

  const hits: CrossWikiHit[] = [];

  for (const { source, articles } of loaded) {
    for (const article of articles) {
      if (!matchesKeyword(article, keyword)) {
        continue;
      }

      hits.push({
        id: article.id,
        title: article.title,
        summary: article.summary,
        service: source.service,
        page: source.page,
        sourceLabel: source.sourceLabel,
      });
    }
  }

  return hits.slice(0, limit);
}

/** 總篇數，用來誠實說明「還有幾篇沒列出來」。 */
export async function countOtherWikiMatches(
  query: string,
  currentService: ServiceId,
): Promise<number> {
  const keyword = query.trim().toLowerCase();

  if (keyword === '') {
    return 0;
  }

  const sources = SOURCES.filter((source) => source.service !== currentService);
  const loaded = await Promise.all(sources.map((source) => source.load()));

  return loaded.reduce(
    (total, { articles }) =>
      total
      + articles.filter((article) => matchesKeyword(article, keyword)).length,
    0,
  );
}
