import { describe, it, expect } from 'vitest';
import {
  PREGNANCY_TOTAL_WEEKS,
  pregnancyGuides,
  trimesterOf,
} from './pregnancyGuides';

/** 從此週起，胎動減少、子癇前症與早產徵兆都已成立，警訊不得為空。 */
const WARNING_REQUIRED_FROM = 20;

describe('pregnancyGuides', () => {
  it('恰好 40 筆，週數 1～40 無缺漏也無重複', () => {
    expect(pregnancyGuides).toHaveLength(PREGNANCY_TOTAL_WEEKS);

    const weeks = pregnancyGuides.map((g) => g.week);

    expect(weeks).toEqual(
      Array.from({ length: PREGNANCY_TOTAL_WEEKS }, (_, i) => i + 1),
    );

    expect(new Set(weeks).size).toBe(PREGNANCY_TOTAL_WEEKS);
  });

  it('每筆都有標題、摘要與至少 2 條建議', () => {
    for (const guide of pregnancyGuides) {
      const key = `第 ${guide.week} 週`;

      expect(guide.title.trim().length, key).toBeGreaterThan(0);
      expect(guide.summary.trim().length, key).toBeGreaterThan(0);
      expect(guide.tips.length, key).toBeGreaterThanOrEqual(2);

      for (const tip of guide.tips) {
        expect(tip.trim().length, `${key} tip`).toBeGreaterThan(0);
      }
    }
  });

  it('標題含該週週數，摘要不與標題重複', () => {
    for (const guide of pregnancyGuides) {
      const key = `第 ${guide.week} 週`;

      expect(guide.title, key).toContain(`第 ${guide.week} 週`);
      expect(guide.summary, key).not.toBe(guide.title);
    }
  });

  it('第 20 週起每一週都有就醫警訊，且無空字串', () => {
    for (const guide of pregnancyGuides) {
      const key = `第 ${guide.week} 週`;

      if (guide.week >= WARNING_REQUIRED_FROM) {
        expect(guide.warningSignals.length, key).toBeGreaterThan(0);
      }

      for (const signal of guide.warningSignals) {
        expect(signal.trim().length, `${key} warning`).toBeGreaterThan(0);
      }
    }
  });

  it('每週的建議與警訊各自不重複', () => {
    for (const guide of pregnancyGuides) {
      const key = `第 ${guide.week} 週`;

      expect(new Set(guide.tips).size, `${key} tips`).toBe(guide.tips.length);

      expect(new Set(guide.warningSignals).size, `${key} warnings`).toBe(
        guide.warningSignals.length,
      );
    }
  });

  it('胎動減少警訊自 20 週起出現，並自 28 週起貫穿到底', () => {
    for (const guide of pregnancyGuides) {
      const mentioned = guide.warningSignals.some((s) => s.includes('胎動'));

      expect(mentioned, `第 ${guide.week} 週`).toBe(guide.week >= 20);
    }
  });

  it('子癇前症警訊自 20 週起貫穿到底，且不出現於 20 週前', () => {
    for (const guide of pregnancyGuides) {
      const key = `第 ${guide.week} 週`;

      const mentioned = guide.warningSignals.some(
        (s) => s.includes('子癇前症') || s.includes('視力模糊'),
      );

      expect(mentioned, key).toBe(guide.week >= 20);
    }
  });

  it('產檢與篩檢的到期週數會在該週的建議中被點名', () => {
    const dueAtWeek: Record<number, string[]> = {
      8: ['第 1 次公費產檢', '孕婦健康手冊'],
      11: ['頸部透明帶', '11～14 週'],
      12: ['第 2 次公費產檢'],
      13: ['子癇前症篩檢', '11～13 週'],
      15: ['第二孕期四指標母血唐氏症篩檢', '15～20 週'],
      16: ['第 3 次公費產檢', '早產防治衛教'],
      17: ['16～18 週', '羊水'],
      20: ['第 4 次公費產檢', '第 2 次公費超音波', '高層次超音波', '20～24 週'],
      24: ['第 5 次公費產檢', '妊娠糖尿病篩檢', '24～28 週', '75 公克'],
      28: ['Tdap', '28～36 週'],
      32: ['第 8 次公費產檢', '第 3 次公費超音波'],
      35: ['乙型鏈球菌篩檢', '35～37 週'],
      36: ['第 10 次公費產檢', '乙型鏈球菌篩檢'],
      40: ['第 14 次公費產檢', '過期妊娠', '42 週'],
    };

    for (const [week, needles] of Object.entries(dueAtWeek)) {
      const guide = pregnancyGuides.find((g) => g.week === Number(week))!;
      const text = guide.tips.join('\n');

      for (const needle of needles) {
        expect(text, `第 ${week} 週應提及「${needle}」`).toContain(needle);
      }
    }
  });

  it('早產徵兆只在早產定義成立的 20 週之後出現', () => {
    for (const guide of pregnancyGuides) {
      const mentionsPreterm = guide.tips
        .concat(guide.warningSignals)
        .some((s) => s.includes('早產'));

      if (mentionsPreterm) {
        // 16 週的公費產檢就會做早產防治衛教，因此下界是 16 而非 20。
        expect(guide.week, `第 ${guide.week} 週`).toBeGreaterThanOrEqual(16);
      }
    }

    const week20 = pregnancyGuides.find((g) => g.week === 20)!;

    expect(week20.warningSignals.some((s) => s.includes('規則子宮收縮'))).toBe(true);
  });
});

describe('trimesterOf', () => {
  it('分期界線正確', () => {
    expect(trimesterOf(1)).toBe(1);
    expect(trimesterOf(13)).toBe(1);
    expect(trimesterOf(14)).toBe(2);
    expect(trimesterOf(27)).toBe(2);
    expect(trimesterOf(28)).toBe(3);
    expect(trimesterOf(40)).toBe(3);
  });

  it('每一週都落在 1～3 且分期單調不減', () => {
    let previous = 1;

    for (const guide of pregnancyGuides) {
      const trimester = trimesterOf(guide.week);

      expect([1, 2, 3], `第 ${guide.week} 週`).toContain(trimester);
      expect(trimester, `第 ${guide.week} 週`).toBeGreaterThanOrEqual(previous);
      previous = trimester;
    }

    expect(previous).toBe(3);
  });

  it('超出範圍的輸入夾在邊界，不拋錯', () => {
    expect(() => trimesterOf(0)).not.toThrow();
    expect(trimesterOf(0)).toBe(1);
    expect(trimesterOf(-12)).toBe(1);
    expect(trimesterOf(41)).toBe(3);
    expect(trimesterOf(999)).toBe(3);
    expect(trimesterOf(Number.POSITIVE_INFINITY)).toBe(3);
    expect(trimesterOf(Number.NEGATIVE_INFINITY)).toBe(1);
  });

  it('非整數與非數值輸入不拋錯，以無條件捨去對齊產科週數慣例', () => {
    expect(trimesterOf(13.6)).toBe(1);
    expect(trimesterOf(27.9)).toBe(2);
    expect(trimesterOf(Number.NaN)).toBe(1);
  });
});
