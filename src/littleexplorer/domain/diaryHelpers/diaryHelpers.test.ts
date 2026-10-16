import { describe, expect, it } from 'vitest';
import type { DiaryEntry } from '../../../family/domain/familyRecords/index';
import { groupEntriesByMonth } from './index';

const entry = (
  id: string,
  date: string,
  createdAt = `${date}T09:00:00.000Z`,
): DiaryEntry => ({
  id,
  childId: 'child-1',
  date,
  content: `內容 ${id}`,
  createdAt,
});

describe('groupEntriesByMonth', () => {
  it('空輸入回傳空陣列', () => {
    expect(groupEntriesByMonth([])).toEqual([]);
  });

  it('同月份的條目歸為一組', () => {
    const groups = groupEntriesByMonth([
      entry('a', '2026-08-03'),
      entry('b', '2026-08-27'),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe('2026-08');
    expect(groups[0].entries.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('群組依月份降序，組內依日期降序', () => {
    const groups = groupEntriesByMonth([
      entry('old', '2026-06-10'),
      entry('new', '2026-08-27'),
      entry('mid', '2026-07-01'),
    ]);

    expect(groups.map((g) => g.key)).toEqual(['2026-08', '2026-07', '2026-06']);
  });

  it('跨年的同月份不合併', () => {
    const groups = groupEntriesByMonth([
      entry('this-year', '2026-01-15'),
      entry('last-year', '2025-01-15'),
    ]);

    expect(groups.map((g) => g.key)).toEqual(['2026-01', '2025-01']);
    expect(groups).toHaveLength(2);
  });

  it('同一天的條目以 createdAt 降序排列', () => {
    const groups = groupEntriesByMonth([
      entry('morning', '2026-08-27', '2026-08-27T01:00:00.000Z'),
      entry('evening', '2026-08-27', '2026-08-27T13:00:00.000Z'),
    ]);

    expect(groups[0].entries.map((e) => e.id)).toEqual(['evening', 'morning']);
  });

  it('label 為繁體中文的年月', () => {
    const groups = groupEntriesByMonth([entry('a', '2026-08-27')]);

    expect(groups[0].label).toBe('2026 年 8 月');
  });

  it('不修改傳入的陣列', () => {
    const input = [entry('a', '2026-06-10'), entry('b', '2026-08-27')];
    const snapshot = input.map((e) => e.id);

    groupEntriesByMonth(input);
    expect(input.map((e) => e.id)).toEqual(snapshot);
  });
});
