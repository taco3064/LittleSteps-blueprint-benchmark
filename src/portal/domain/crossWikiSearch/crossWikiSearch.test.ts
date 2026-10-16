import { describe, expect, it } from 'vitest';
import {
  countOtherWikiMatches,
  queryFromLocation,
  searchOtherWikis,
  wikiSearchQuery,
} from './crossWikiSearch';

/**
 * 85 篇查證過出處的文章被切成三個互不相通的知識庫。家長在幼兒百科搜
 * 「發燒」，看不到寶寶百科那幾篇——而問題本身不管服務邊界。
 *
 * 這組測試跑的是真實資料，不是假資料：跨服務搜尋的價值完全來自那些文章
 * 真的能被搜到，用 stub 驗等於什麼都沒驗。
 */

describe('searchOtherWikis', () => {
  it('從幼兒百科搜得到其他階段的文章', async () => {
    const hits = await searchOtherWikis('發燒', 'littleexplorer');

    expect(hits.length).toBeGreaterThan(0);
    // 只能來自別的服務，自己那一份由頁面本身顯示。
    expect(hits.every((hit) => hit.service !== 'littleexplorer')).toBe(true);
  });

  it('不會把目前所在的服務也搜進來', async () => {
    const hits = await searchOtherWikis('睡', 'littlesteps');

    expect(hits.every((hit) => hit.service !== 'littlesteps')).toBe(true);
  });

  it('每一筆都帶得走：有標題、摘要、來源說明與目的地路由', async () => {
    const hits = await searchOtherWikis('發燒', 'littlebloom');

    for (const hit of hits) {
      expect(hit.title.length).toBeGreaterThan(0);
      expect(hit.summary.length).toBeGreaterThan(0);
      expect(hit.sourceLabel.length).toBeGreaterThan(0);
      expect(hit.page).toMatch(/wiki/);
    }
  });

  it('空關鍵字不回任何東西——不搜尋時不該冒出一整段', async () => {
    expect(await searchOtherWikis('', 'littlesteps')).toEqual([]);
    expect(await searchOtherWikis('   ', 'littlesteps')).toEqual([]);
  });

  it('大小寫不敏感', async () => {
    const lower = await searchOtherWikis('rsv', 'littlebloom');
    const upper = await searchOtherWikis('RSV', 'littlebloom');

    expect(lower.map((h) => h.id)).toEqual(upper.map((h) => h.id));
  });

  it('列出的數量有上限，並且總數說得出來', async () => {
    // 「寶寶」這種常見詞會命中很多篇，正是需要誠實說「還有幾篇」的情況。
    const hits = await searchOtherWikis('寶寶', 'littlebloom', 3);
    const total = await countOtherWikiMatches('寶寶', 'littlebloom');

    expect(hits.length).toBeLessThanOrEqual(3);
    expect(total).toBeGreaterThanOrEqual(hits.length);
  });
});

describe('關鍵字跟著跳轉走', () => {
  it('跨服務連結把關鍵字編碼成 query string', () => {
    expect(wikiSearchQuery('發燒')).toBe('q=%E7%99%BC%E7%87%92');
    // 前後空白不該被帶進網址。
    expect(wikiSearchQuery('  發燒  ')).toBe('q=%E7%99%BC%E7%87%92');
  });

  it('落地時讀得回來', () => {
    expect(queryFromLocation('?q=%E7%99%BC%E7%87%92')).toBe('發燒');
  });

  it('沒有關鍵字時回空字串，不是 undefined', () => {
    expect(queryFromLocation('')).toBe('');
    expect(queryFromLocation('?other=1')).toBe('');
  });
});
