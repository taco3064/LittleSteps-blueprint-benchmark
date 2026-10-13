import { describe, it, expect } from 'vitest';
import type { ToddlerAgeBand, ToddlerTipCategory } from '../records';
import { tipCategoryLabels, toddlerCareTips } from './monthlyTips';

const BANDS: ToddlerAgeBand[] = ['12-15', '15-18', '18-24', '24-30', '30-36'];
const CATEGORIES: ToddlerTipCategory[] = ['safety', 'feeding', 'behavior', 'health'];

describe('toddlerCareTips', () => {
  it('共 20 筆', () => {
    expect(toddlerCareTips).toHaveLength(BANDS.length * CATEGORIES.length);
  });

  it('每個年齡段 × 類別的組合恰好一筆，無空格也無重複', () => {
    for (const ageBand of BANDS) {
      for (const category of CATEGORIES) {
        const matches = toddlerCareTips.filter(
          (t) => t.ageBand === ageBand && t.category === category,
        );

        expect(matches, `${ageBand} / ${category}`).toHaveLength(1);
      }
    }
  });

  it('每筆都有標題與至少 3 條重點', () => {
    for (const tip of toddlerCareTips) {
      const key = `${tip.ageBand}/${tip.category}`;

      expect(tip.title.length, key).toBeGreaterThan(0);
      expect(tip.highlights.length, key).toBeGreaterThanOrEqual(3);

      for (const line of tip.highlights) {
        expect(line.length, key).toBeGreaterThan(0);
      }
    }
  });

  it('標題在同一年齡段內不重複', () => {
    for (const ageBand of BANDS) {
      const titles = toddlerCareTips
        .filter((t) => t.ageBand === ageBand)
        .map((t) => t.title);

      expect(new Set(titles).size, ageBand).toBe(titles.length);
    }
  });
});

describe('分類顯示設定', () => {
  it('每個類別都有中文標籤', () => {
    for (const category of CATEGORIES) {
      expect(tipCategoryLabels[category], category).toBeTruthy();
    }
  });
});
