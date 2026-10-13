import { describe, it, expect } from 'vitest';
import type { PregnancyWikiCategory } from '../records';
import { getLucideIcon } from '../lucideIcons';
import { matchesKeyword } from '../matchesKeyword';
import {
  pregnancyWikiArticles,
  pregnancyWikiCategoryColors,
  pregnancyWikiCategoryLabels,
} from './wiki';

const CATEGORIES: PregnancyWikiCategory[] = [
  'nutrition',
  'health',
  'symptoms',
  'checkup',
  'lifestyle',
];

describe('pregnancyWikiArticles', () => {
  it('共 25 篇，且 id 唯一', () => {
    expect(pregnancyWikiArticles).toHaveLength(25);
    const ids = pregnancyWikiArticles.map((a) => a.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每個分類至少 4 篇', () => {
    for (const category of CATEGORIES) {
      const count = pregnancyWikiArticles.filter(
        (a) => a.category === category,
      ).length;

      expect(count, category).toBeGreaterThanOrEqual(4);
    }
  });

  it('每篇都有標題、摘要、成因、處理步驟與就醫警訊', () => {
    for (const article of pregnancyWikiArticles) {
      expect(article.title.length, article.id).toBeGreaterThan(0);
      expect(article.summary.length, article.id).toBeGreaterThan(0);
      expect(article.causes.length, article.id).toBeGreaterThan(0);
      expect(article.solutions.length, article.id).toBeGreaterThan(0);
      expect(article.warningSignals.length, article.id).toBeGreaterThan(0);

      for (const cause of article.causes) {
        expect(cause.length, article.id).toBeGreaterThan(0);
      }

      for (const signal of article.warningSignals) {
        expect(signal.length, article.id).toBeGreaterThan(0);
      }

      for (const step of article.solutions) {
        expect(step.step.length, article.id).toBeGreaterThan(0);
        expect(step.detail.length, article.id).toBeGreaterThan(0);
      }
    }
  });

  it('relatedArticleIds 只指向存在的文章，且不自我參照', () => {
    const ids = new Set(pregnancyWikiArticles.map((a) => a.id));

    for (const article of pregnancyWikiArticles) {
      expect(article.relatedArticleIds.length, article.id).toBeGreaterThan(0);

      for (const related of article.relatedArticleIds) {
        expect(ids.has(related), `${article.id} 指向不存在的 ${related}`).toBe(true);

        expect(related, article.id).not.toBe(article.id);
      }
    }
  });

  it('每篇的 icon 名稱可由 lucideIcons registry 解析', () => {
    const fallback = getLucideIcon('__definitely_not_registered__');

    for (const article of pregnancyWikiArticles) {
      expect(getLucideIcon(article.icon), `${article.id}: ${article.icon}`).not.toBe(
        fallback,
      );
    }
  });
});

/**
 * The vaccination advice used to live as two bullets inside the cold-and-fever
 * article, so a mother searching for what she has to be vaccinated against had
 * to already be reading about catching a cold. These pin the two properties
 * that matter and that no amount of proof-reading protects: the topic is
 * findable on its own, and it exists in exactly one place, so two copies of the
 * same medical advice cannot drift apart. Whether the content is *correct* is
 * not testable here — that comes from the sources cited above each article.
 */
describe('pregnancy vaccination advice', () => {
  it(
    'searching for the word for vaccine finds an article about '
    + 'vaccination itself',
    () => {
      // WikiBrowser searches with query.trim().toLowerCase(); call it the same way.
      const hits = pregnancyWikiArticles.filter((a) =>
        matchesKeyword(a, '疫苗'.toLowerCase()),
      );

      expect(hits.length).toBeGreaterThan(0);

      const dedicated = hits.filter((a) => a.title.includes('疫苗'));

      expect(dedicated.map((a) => a.id)).toEqual(['health-vaccination']);
    },
  );

  it('keeps the advice in one article instead of two copies', () => {
    for (const marker of ['Tdap', '28-36 週', '公費流感疫苗']) {
      const owners = pregnancyWikiArticles
        .filter((a) =>
          [
            a.title,
            a.summary,
            ...a.causes,
            ...a.warningSignals,
            ...a.solutions.flatMap((s) => [s.step, s.detail]),
          ].some((text) => text.includes(marker)),
        )
        .map((a) => a.id);

      expect(owners, marker).toEqual(['health-vaccination']);
    }
  });
});

describe('分類顯示設定', () => {
  it('每個分類都有標籤與配色', () => {
    for (const category of CATEGORIES) {
      expect(pregnancyWikiCategoryLabels[category], category).toBeTruthy();
      const colors = pregnancyWikiCategoryColors[category];

      expect(colors?.bg, category).toBeTruthy();
      expect(colors?.text, category).toBeTruthy();
      expect(colors?.pill, category).toBeTruthy();
    }
  });
});
