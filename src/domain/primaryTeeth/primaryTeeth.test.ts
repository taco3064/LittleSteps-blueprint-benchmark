import { describe, it, expect } from 'vitest';
import type { ToothJaw } from '../records';
import { primaryTeeth, toothPositionLabels, TOOTH_COUNT } from './primaryTeeth';

const jaws: ToothJaw[] = ['upper', 'lower'];
const sides = ['left', 'right'] as const;
const positions = [1, 2, 3, 4, 5];

/**
 * 臨床萌發順序（以順位表示）：
 * 正中門齒 → 側門齒 → 第一乳臼齒 → 乳犬齒 → 第二乳臼齒。
 *
 * 這裡刻意不驗「月齡隨順位 1→5 遞增」：乳犬齒（順位 3）本來就晚於
 * 第一乳臼齒（順位 4）萌發，這是解剖事實，來源（TAPD）與 ADA 圖表皆然。
 * 若硬要求月齡隨順位遞增，只會逼資料造假。
 */
const eruptionOrder = [1, 2, 4, 3, 5];

const windowOf = (jaw: ToothJaw, position: number) => {
  const tooth = primaryTeeth.find(
    (t) => t.jaw === jaw && t.position === position && t.side === 'right',
  );

  if (!tooth) {
    throw new Error(`找不到 ${jaw} 順位 ${position} 的牙齒`);
  }

  return tooth;
};

describe('primaryTeeth', () => {
  it('共 20 顆，且 id 唯一', () => {
    expect(primaryTeeth).toHaveLength(20);
    const ids = primaryTeeth.map((t) => t.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('TOOTH_COUNT 為 20，且與陣列長度一致', () => {
    expect(TOOTH_COUNT).toBe(20);
    expect(TOOTH_COUNT).toBe(primaryTeeth.length);
  });

  it('上下顎 × 左右 × 順位 1-5 恰好各出現一次', () => {
    const expected = jaws.flatMap((jaw) =>
      sides.flatMap((side) => positions.map((p) => `${jaw}|${side}|${p}`)),
    );

    const actual = primaryTeeth.map((t) => `${t.jaw}|${t.side}|${t.position}`);

    expect(actual.slice().sort()).toEqual(expected.slice().sort());
  });

  it('id 為 <jaw>-<side>-<position>，可供牙弓圖以位置定址', () => {
    for (const t of primaryTeeth) {
      expect(t.id).toBe(`${t.jaw}-${t.side}-${t.position}`);
    }
  });

  it('每顆都滿足 eruptFromMonth <= eruptToMonth', () => {
    for (const t of primaryTeeth) {
      expect(t.eruptFromMonth, t.id).toBeLessThanOrEqual(t.eruptToMonth);
    }
  });

  it('同一顎同一順位的左右兩顆，萌發區間必須相同', () => {
    for (const jaw of jaws) {
      for (const position of positions) {
        const pair = primaryTeeth.filter(
          (t) => t.jaw === jaw && t.position === position,
        );

        expect(pair, `${jaw} 順位 ${position}`).toHaveLength(2);
        const [a, b] = pair;

        expect(a.eruptFromMonth, `${jaw} 順位 ${position} 左右不對稱`).toBe(
          b.eruptFromMonth,
        );

        expect(a.eruptToMonth, `${jaw} 順位 ${position} 左右不對稱`).toBe(
          b.eruptToMonth,
        );
      }
    }
  });

  it('每一顎的萌發月齡依臨床萌發順序遞增', () => {
    for (const jaw of jaws) {
      for (let i = 1; i < eruptionOrder.length; i += 1) {
        const prev = windowOf(jaw, eruptionOrder[i - 1]);
        const curr = windowOf(jaw, eruptionOrder[i]);
        const label = `${jaw}：${prev.name} 應不晚於 ${curr.name}`;

        expect(prev.eruptFromMonth, label).toBeLessThanOrEqual(curr.eruptFromMonth);

        expect(prev.eruptToMonth, label).toBeLessThanOrEqual(curr.eruptToMonth);
      }
    }
  });

  it('每一顎都是正中門齒最早、第二乳臼齒最晚開始萌發', () => {
    for (const jaw of jaws) {
      const inJaw = primaryTeeth.filter((t) => t.jaw === jaw);
      const starts = inJaw.map((t) => t.eruptFromMonth);
      const centralIncisor = windowOf(jaw, 1);
      const secondMolar = windowOf(jaw, 5);

      expect(centralIncisor.eruptFromMonth, `${jaw} 正中門齒不是最早`).toBe(
        Math.min(...starts),
      );

      expect(secondMolar.eruptFromMonth, `${jaw} 第二乳臼齒不是最晚`).toBe(
        Math.max(...starts),
      );

      expect(
        secondMolar.eruptFromMonth,
        `${jaw} 第二乳臼齒不該早於正中門齒`,
      ).toBeGreaterThan(centralIncisor.eruptToMonth);
    }
  });

  it('所有月齡都落在 0-36 個月內', () => {
    for (const t of primaryTeeth) {
      expect(t.eruptFromMonth, t.id).toBeGreaterThanOrEqual(0);
      expect(t.eruptToMonth, t.id).toBeLessThanOrEqual(36);
    }
  });
});

describe('toothPositionLabels', () => {
  it('順位 1-5 都有名稱', () => {
    for (const position of positions) {
      expect(toothPositionLabels[position], `順位 ${position} 缺名稱`).toBeTruthy();
    }

    expect(Object.keys(toothPositionLabels)).toHaveLength(positions.length);
  });

  it('每顆牙的 name 為「上/下」加上該順位名稱', () => {
    for (const t of primaryTeeth) {
      const prefix = t.jaw === 'upper' ? '上' : '下';

      expect(t.name, t.id).toBe(`${prefix}${toothPositionLabels[t.position]}`);
    }
  });
});
