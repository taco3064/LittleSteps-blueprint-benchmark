import { describe, it, expect } from 'vitest';
import { milestones, monthRanges } from './milestones';

describe('milestones 資料集', () => {
  it('只涵蓋 0-12 個月，不含 12 個月以後的大桶', () => {
    const buckets = new Set(milestones.map((m) => m.monthRange));

    expect([...buckets].sort()).toEqual(['0-2', '10-12', '3-4', '5-6', '7-9']);
  });

  it('monthRanges 選項與資料集實際使用的分桶一致', () => {
    const used = new Set(milestones.map((m) => m.monthRange));

    expect(new Set(monthRanges.map((r) => r.value))).toEqual(used);
  });

  it('id 唯一', () => {
    const ids = milestones.map((m) => m.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每筆都有標題、摘要、說明與至少一項練習建議', () => {
    for (const milestone of milestones) {
      expect(milestone.title.length, milestone.id).toBeGreaterThan(0);
      expect(milestone.summary.length, milestone.id).toBeGreaterThan(0);
      expect(milestone.details.length, milestone.id).toBeGreaterThan(0);
      expect(milestone.tips.length, milestone.id).toBeGreaterThan(0);
    }
  });
});
