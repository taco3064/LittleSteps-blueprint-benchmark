import { describe, expect, it } from 'vitest';
import type { FoodTrialRecord } from '~app/family/domain/familyRecords';
import { foodTrialProgress } from './foodTrialProgress';

const TODAY = '2026-10-16';

const food = (count: number, id = 'food'): FoodTrialRecord => ({
  id,
  foodName: '地瓜',
  firstTriedDate: '2026-10-01',
  trialDates: Array.from(
    { length: count },
    (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`,
  ),
  hasAllergy: false,
  createdAt: '2026-10-01T00:00:00.000Z',
});

describe('試敏階段與完成邊界', () => {
  it.each([
    [2, '小量試3天', false],
    [3, '增量試3天', false],
    [5, '增量試3天', false],
    [6, '觀察3天', false],
    [8, '觀察3天', false],
    [9, '觀察3天', true],
  ] as const)('%i 天對應 %s，完成：%s', (count, stage, done) => {
    const record = food(count);
    const result = foodTrialProgress([record], TODAY);
    const row = [...result.active, ...result.completed][0];

    expect(result.totalDays).toBe(9);
    expect(row.food).toBe(record);
    expect(row.stage.title).toBe(stage);
    expect(row.progressPercent).toBeCloseTo((count / 9) * 100);
    expect(result.active).toHaveLength(done ? 0 : 1);
    expect(result.completed).toHaveLength(done ? 1 : 0);
    expect(row.canRecord).toBe(!done);
  });
});

it('今天未記錄的排前面，同組保留來源順序，完成的獨立列出', () => {
  const recorded = { ...food(1, 'recorded'), trialDates: [TODAY] };
  const first = food(2, 'first');
  const second = food(1, 'second');
  const complete = food(9, 'complete');
  const result = foodTrialProgress([recorded, first, complete, second], TODAY);

  expect(result.active.map((row) => row.food.id)).toEqual([
    'first',
    'second',
    'recorded',
  ]);

  expect(result.active.map((row) => row.canRecord)).toEqual([true, true, false]);
  expect(result.completed.map((row) => row.food.id)).toEqual(['complete']);
});

it('混合舊陣列與日期集合只計不同日期，今天已記錄就不能重複記錄', () => {
  const record: FoodTrialRecord = {
    ...food(0),
    trialDates: { 0: '2026-10-15', 1: TODAY, [TODAY]: true },
  };

  const result = foodTrialProgress([record], TODAY);

  expect(result.active[0].trialDates).toEqual(['2026-10-15', TODAY]);
  expect(result.active[0].canRecord).toBe(false);
  expect(result.active[0].stage.title).toBe('小量試3天');
});
