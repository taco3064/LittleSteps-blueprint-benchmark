import { describe, expect, it } from 'vitest';
import {
  TODDLER_MAX_MONTHS,
  TODDLER_MIN_MONTHS,
} from '../../../family/domain/ageBands/ageBands';
import { WIKI_STAGES } from '../../../littleexplorer/domain/wikiRelevance/wikiRelevance';
import { getLucideIcon } from '../../../platform/components/LucideIcons/lucideIcons';
import type { ToddlerWikiCategory } from '../referenceModels/index';
import {
  toddlerWikiArticles,
  toddlerWikiCategoryColors,
  toddlerWikiCategoryLabels,
} from './data';

const CATEGORIES: ToddlerWikiCategory[] = [
  'toilet',
  'language',
  'emotion',
  'eating',
  'sleep',
  'safety',
  'health',
  'preschool',
];

describe('toddlerWikiArticles', () => {
  it('共 45 篇，且 id 唯一', () => {
    expect(toddlerWikiArticles).toHaveLength(45);
    const ids = toddlerWikiArticles.map((a) => a.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每篇的 ageRange 都在幼兒期內、起點小於終點', () => {
    for (const article of toddlerWikiArticles) {
      const [start, end] = article.ageRange;

      expect(start, article.id).toBeGreaterThanOrEqual(TODDLER_MIN_MONTHS);
      expect(end, article.id).toBeLessThanOrEqual(TODDLER_MAX_MONTHS);
      expect(start, article.id).toBeLessThan(end);
    }
  });

  it('ageRange 的起點對齊百科的三段界線', () => {
    // 標籤會把月齡讀成「1 歲半後」，靠的就是起點落在這幾個界線上。
    // 刻意只有三個界線——見 WIKI_STAGES 的說明。
    const starts = WIKI_STAGES.map((s) => s.start);

    for (const article of toddlerWikiArticles) {
      expect(starts, article.id).toContain(article.ageRange[0]);
    }
  });

  it('每一段都有階段性文章，否則那顆 chip 篩出來的東西和「全部」一樣', () => {
    for (const stage of WIKI_STAGES) {
      const stageSpecific = toddlerWikiArticles.filter(
        (a) =>
          a.ageRange[0] < stage.end
          && a.ageRange[1] > stage.start
          && !(a.ageRange[0] <= 12 && a.ageRange[1] >= 36),
      );

      expect(stageSpecific.length, stage.label).toBeGreaterThan(0);
    }
  });

  it('每個年齡段都有現在適用的文章，否則排序會開天窗', () => {
    for (const month of [12, 15, 18, 24, 30, 35]) {
      const applicable = toddlerWikiArticles.filter(
        (a) => month >= a.ageRange[0] && month < a.ageRange[1],
      );

      expect(applicable.length, `${month} 個月`).toBeGreaterThan(0);
    }
  });

  it('每個分類至少 2 篇', () => {
    for (const category of CATEGORIES) {
      const count = toddlerWikiArticles.filter(
        (a) => a.category === category,
      ).length;

      expect(count, category).toBeGreaterThanOrEqual(2);
    }
  });

  it('每篇都有標題、摘要、成因、處理步驟與就醫警訊', () => {
    for (const article of toddlerWikiArticles) {
      expect(article.title.length, article.id).toBeGreaterThan(0);
      expect(article.summary.length, article.id).toBeGreaterThan(0);
      expect(article.causes.length, article.id).toBeGreaterThan(0);
      expect(article.solutions.length, article.id).toBeGreaterThan(0);
      expect(article.warningSignals.length, article.id).toBeGreaterThan(0);

      for (const step of article.solutions) {
        expect(step.step.length, article.id).toBeGreaterThan(0);
        expect(step.detail.length, article.id).toBeGreaterThan(0);
      }
    }
  });

  it('relatedArticleIds 只指向存在的文章，且不自我參照', () => {
    const ids = new Set(toddlerWikiArticles.map((a) => a.id));

    for (const article of toddlerWikiArticles) {
      for (const related of article.relatedArticleIds) {
        expect(ids.has(related), `${article.id} 指向不存在的 ${related}`).toBe(true);

        expect(related, article.id).not.toBe(article.id);
      }
    }
  });

  it('每篇的 icon 名稱可由 lucideIcons registry 解析', () => {
    const fallback = getLucideIcon('__definitely_not_registered__');

    for (const article of toddlerWikiArticles) {
      expect(getLucideIcon(article.icon), `${article.id}: ${article.icon}`).not.toBe(
        fallback,
      );
    }
  });
});

describe('分類顯示設定', () => {
  it('每個分類都有標籤與配色', () => {
    for (const category of CATEGORIES) {
      expect(toddlerWikiCategoryLabels[category], category).toBeTruthy();
      const colors = toddlerWikiCategoryColors[category];

      expect(colors?.bg, category).toBeTruthy();
      expect(colors?.text, category).toBeTruthy();
      expect(colors?.pill, category).toBeTruthy();
    }
  });
});
