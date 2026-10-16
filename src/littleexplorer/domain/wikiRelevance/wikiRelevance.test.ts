import { describe, expect, it } from 'vitest';
import type { ToddlerWikiArticle } from '../../../knowledge/domain/referenceModels/index';
import {
  WIKI_STAGES,
  monthsLabel,
  overlapsBand,
  relevanceFor,
  relevanceTag,
  sortByRelevance,
  stageForMonths,
} from './index';

function article(
  id: string,
  ageRange: [number, number],
  overrides: Partial<ToddlerWikiArticle> = {},
): ToddlerWikiArticle {
  return {
    id,
    title: id,
    summary: '',
    category: 'health',
    ageRange,
    causes: [],
    solutions: [],
    warningSignals: [],
    relatedArticleIds: [],
    icon: 'Heart',
    ...overrides,
  };
}

describe('relevanceFor', () => {
  it('是 now 當月齡落在區間內', () => {
    expect(relevanceFor(article('a', [18, 30]), 24)).toBe('now');
  });

  it('起始月齡當天就算 now', () => {
    expect(relevanceFor(article('a', [18, 30]), 18)).toBe('now');
  });

  it('結束月齡當天就算 past——區間不含尾', () => {
    expect(relevanceFor(article('a', [18, 30]), 30)).toBe('past');
  });

  it('半年內開始的算 soon', () => {
    expect(relevanceFor(article('a', [24, 36]), 18)).toBe('soon');
  });

  it('剛好半年也算 soon', () => {
    expect(relevanceFor(article('a', [24, 36]), 18)).toBe('soon');
  });

  it('超過半年才開始的算 later', () => {
    expect(relevanceFor(article('a', [30, 36]), 14)).toBe('later');
  });
});

describe('sortByRelevance', () => {
  it('now 排在 soon 前面，soon 排在 later 前面，past 最後', () => {
    const articles = [
      article('past', [12, 15]),
      article('later', [30, 36]),
      article('soon', [24, 36]),
      article('now', [18, 24]),
    ];

    expect(sortByRelevance(articles, 20).map((a) => a.id)).toEqual([
      'now',
      'soon',
      'later',
      'past',
    ]);
  });

  it('同層之內，起始月齡較晚的先出現', () => {
    const articles = [article('evergreen', [12, 36]), article('stage', [24, 30])];

    expect(sortByRelevance(articles, 26).map((a) => a.id)).toEqual([
      'stage',
      'evergreen',
    ]);
  });

  it('起始相同時，區間較窄的先出現', () => {
    const articles = [article('wide', [12, 36]), article('narrow', [12, 18])];

    expect(sortByRelevance(articles, 14).map((a) => a.id)).toEqual([
      'narrow',
      'wide',
    ]);
  });

  it('完全同級時保留原順序，結果才穩定', () => {
    const articles = [
      article('first', [12, 36]),
      article('second', [12, 36]),
      article('third', [12, 36]),
    ];

    expect(sortByRelevance(articles, 14).map((a) => a.id)).toEqual([
      'first',
      'second',
      'third',
    ]);
  });

  it('不篩掉任何一篇——半夜搜發燒的家長必須找得到', () => {
    const articles = [
      article('a', [12, 15]),
      article('b', [30, 36]),
      article('c', [18, 24]),
    ];

    expect(sortByRelevance(articles, 13)).toHaveLength(3);
  });

  it('不改動傳入的陣列', () => {
    const articles = [article('a', [30, 36]), article('b', [12, 18])];
    const ids = articles.map((a) => a.id);

    sortByRelevance(articles, 14);
    expect(articles.map((a) => a.id)).toEqual(ids);
  });
});

describe('monthsLabel', () => {
  it('整歲不加月份', () => {
    expect(monthsLabel(12)).toBe('1 歲');
    expect(monthsLabel(24)).toBe('2 歲');
    expect(monthsLabel(36)).toBe('3 歲');
  });

  it('半歲說「半」，不說 6 個月', () => {
    expect(monthsLabel(18)).toBe('1 歲半');
    expect(monthsLabel(30)).toBe('2 歲半');
  });

  it('其他餘數照實說', () => {
    expect(monthsLabel(15)).toBe('1 歲 3 個月');
  });
});

describe('relevanceTag', () => {
  it('階段性且現在適用的直接說', () => {
    expect(relevanceTag(article('a', [12, 24]), 14)).toBe('現在適用');
  });

  it('還沒到的說什麼時候開始', () => {
    expect(relevanceTag(article('a', [18, 30]), 14)).toBe('1 歲半後');
  });

  it('已經過去的不標——那篇仍然讀得到，標「已過」沒有用', () => {
    expect(relevanceTag(article('a', [12, 18]), 24)).toBeUndefined();
  });

  it('橫跨整個幼兒期的不標——每個年齡都「現在適用」，標了就不是資訊', () => {
    // 三分之二的文章是 12-36。實測 26 個月時會有 40 張卡片掛同一個徽章。
    expect(relevanceTag(article('a', [12, 36]), 14)).toBeUndefined();
    expect(relevanceTag(article('a', [12, 36]), 26)).toBeUndefined();
  });
});

describe('overlapsBand', () => {
  it('區間與年齡段有交集就算，不需要完整包含', () => {
    expect(overlapsBand(article('a', [18, 36]), 24, 30)).toBe(true);
  });

  it('完全在段之前不算', () => {
    expect(overlapsBand(article('a', [12, 18]), 24, 30)).toBe(false);
  });

  it('完全在段之後不算', () => {
    expect(overlapsBand(article('a', [30, 36]), 12, 15)).toBe(false);
  });

  it('邊界相接不算交集——區間含頭不含尾', () => {
    expect(overlapsBand(article('a', [18, 24]), 24, 30)).toBe(false);
  });

  it('橫跨整個幼兒期的和每一段都有交集，所以永遠篩不掉', () => {
    const evergreen = article('a', [12, 36]);

    for (const [lo, hi] of [
      [12, 15],
      [15, 18],
      [18, 24],
      [24, 30],
      [30, 36],
    ]) {
      expect(overlapsBand(evergreen, lo, hi), `${lo}-${hi}`).toBe(true);
    }
  });
});

describe('WIKI_STAGES / stageForMonths', () => {
  it('三段連續覆蓋 12-36 個月，沒有空隙也沒有重疊', () => {
    expect(WIKI_STAGES[0].start).toBe(12);
    expect(WIKI_STAGES[WIKI_STAGES.length - 1].end).toBe(36);

    for (let i = 1; i < WIKI_STAGES.length; i++) {
      expect(WIKI_STAGES[i].start).toBe(WIKI_STAGES[i - 1].end);
    }
  });

  it('刻意比成長檢核的五段粗——細分在百科量不出東西', () => {
    expect(WIKI_STAGES).toHaveLength(3);
  });

  it('月齡落在正確的段', () => {
    expect(stageForMonths(12).id).toBe('12-18');
    expect(stageForMonths(17).id).toBe('12-18');
    expect(stageForMonths(18).id).toBe('18-24');
    expect(stageForMonths(23).id).toBe('18-24');
    expect(stageForMonths(24).id).toBe('24-36');
    expect(stageForMonths(35).id).toBe('24-36');
  });

  it('範圍外夾到最近的一端，呼叫端不必處理 undefined', () => {
    expect(stageForMonths(6).id).toBe('12-18');
    expect(stageForMonths(48).id).toBe('24-36');
  });
});
