import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { GrowthRecord } from '~app/domain/records';
import { WHO_MAX_AGE_MONTHS } from '~app/domain/growthChartData';
import GrowthRecordList from '~app/containers/GrowthRecordList';

/**
 * WHO 標準只到 36 個月。過了以後 calculateZScore 會丟錯，useGrowthTracking
 * 接住之後略過百分位——紀錄照樣存，但畫面上的 P 值就這樣消失了。
 *
 * 這組測試釘住兩件事：沒有百分位的紀錄不會壞掉，以及有百分位時真的畫出來。
 * 「為什麼不見了」那句說明在 GrowthChartsPage，需要 currentChild 才能算年齡。
 */

const noop = async () => {};

const noopSync = () => {};

const record = (over: Partial<GrowthRecord> = {}): GrowthRecord =>
  ({
    id: 'r1',
    childId: 'c1',
    date: '2026-06-01',
    weight: 16.3,
    height: 100.2,
    createdAt: '2026-06-01T00:00:00.000Z',
    ...over,
  }) as GrowthRecord;

describe('超出 WHO 範圍的成長紀錄', () => {
  it('沒有百分位時照樣顯示測量值，不是空白卡片', () => {
    render(
      <GrowthRecordList
        records={[record()]}
        loading={false}
        onEdit={noopSync}
        onDelete={noop}
      />,
    );

    expect(screen.getByText('16.3 kg')).toBeInTheDocument();
    expect(screen.getByText('100.2 cm')).toBeInTheDocument();
    // 沒有百分位就不該憑空長出一個 P 值
    expect(screen.queryByText(/^P\d+$/)).toBeNull();
  });

  it('有百分位時要畫出來', () => {
    render(
      <GrowthRecordList
        records={[record({ percentile: { weight: 62, height: 48 } })]}
        loading={false}
        onEdit={noopSync}
        onDelete={noop}
      />,
    );

    expect(screen.getByText('P62')).toBeInTheDocument();
    expect(screen.getByText('P48')).toBeInTheDocument();
  });

  it('WHO 上限就是 36 個月', () => {
    // 說明文案直接引用這個常數；改了資料表沒改文案的話這裡會先紅。
    expect(WHO_MAX_AGE_MONTHS).toBe(36);
  });
});
