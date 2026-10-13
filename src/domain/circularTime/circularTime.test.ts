import { describe, it, expect } from 'vitest';
import { circularTimeStats, formatMinutesOfDay, minutesOfDay } from './circularTime';

const at = (h: number, m = 0) => h * 60 + m;

describe('circularTimeStats', () => {
  it('跨午夜的一致就寢時間平均在午夜附近，不是中午', () => {
    // 這就是原本的 bug：1430 和 10 的線性平均是 720，也就是 12:00。
    const stats = circularTimeStats([at(23, 50), at(0, 10)])!;

    expect(formatMinutesOfDay(stats.meanMinutes)).toBe('00:00');
  });

  it('跨午夜但一致，標準差要很小', () => {
    // 真正的分散是 20 分鐘。線性算法會得到約 710 分鐘，任何評分都變 0 分。
    const stats = circularTimeStats([at(23, 50), at(0, 10), at(23, 55), at(0, 5)])!;

    expect(stats.stdDevMinutes).toBeLessThan(20);
  });

  it('完全一樣的時刻標準差是 0', () => {
    const stats = circularTimeStats([at(20), at(20), at(20)])!;

    expect(stats.stdDevMinutes).toBeCloseTo(0, 6);
    expect(formatMinutesOfDay(stats.meanMinutes)).toBe('20:00');
  });

  it('不跨午夜時和一般平均一致', () => {
    // 環狀算法不能為了處理跨午夜而把白天的答案弄歪。
    const stats = circularTimeStats([at(20), at(21), at(22)])!;

    expect(formatMinutesOfDay(stats.meanMinutes)).toBe('21:00');
  });

  it('分散的時刻標準差就是大', () => {
    const tight = circularTimeStats([at(20), at(20, 10)])!;
    const loose = circularTimeStats([at(18), at(23)])!;

    expect(loose.stdDevMinutes).toBeGreaterThan(tight.stdDevMinutes);
  });

  it('時刻均勻散在整個圓上時，不硬掰一個中心', () => {
    // 06:00 與 18:00 各一半，平均向量長度是 0——沒有平均方向可言。
    const stats = circularTimeStats([at(6), at(18)])!;

    expect(stats.stdDevMinutes).toBe(360);
  });

  it('沒有資料就是 null，不是 00:00', () => {
    expect(circularTimeStats([])).toBeNull();
  });
});

describe('formatMinutesOfDay', () => {
  it('補零到 HH:MM', () => {
    expect(formatMinutesOfDay(at(9, 5))).toBe('09:05');
  });

  it('超過一天會繞回來', () => {
    expect(formatMinutesOfDay(at(24, 30))).toBe('00:30');
  });
});

describe('minutesOfDay', () => {
  it('讀的是當地時區的牆上時間', () => {
    expect(minutesOfDay(new Date(2026, 3, 1, 21, 30))).toBe(at(21, 30));
  });
});
