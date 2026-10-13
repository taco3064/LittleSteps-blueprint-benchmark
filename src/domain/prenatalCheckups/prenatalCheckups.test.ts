import { describe, it, expect } from 'vitest';
import { prenatalCheckupSchedule, prenatalItemKindLabels } from './prenatalCheckups';

describe('prenatalCheckupSchedule', () => {
  it('id 唯一', () => {
    const ids = prenatalCheckupSchedule.map((t) => t.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每筆的週數區間滿足 fromWeek <= dueWeek <= toWeek', () => {
    for (const t of prenatalCheckupSchedule) {
      expect(t.fromWeek, t.id).toBeLessThanOrEqual(t.dueWeek);
      expect(t.dueWeek, t.id).toBeLessThanOrEqual(t.toWeek);
    }
  });

  it('每筆都標註出處', () => {
    for (const t of prenatalCheckupSchedule) {
      expect(t.source.length, t.id).toBeGreaterThan(0);
    }
  });

  it('所有週數落在 0-42 之間', () => {
    for (const t of prenatalCheckupSchedule) {
      expect(t.fromWeek, t.id).toBeGreaterThanOrEqual(0);
      expect(t.toWeek, t.id).toBeLessThanOrEqual(42);
    }
  });

  it('公費產檢共 14 次，次數編號從 1 連續到 14 且不重複', () => {
    // 自 110/7/1 起公費產檢由 10 次調升為 14 次。
    const visitNumbers = prenatalCheckupSchedule
      .filter((t) => t.visitNumber !== undefined)
      .map((t) => t.visitNumber!)
      .sort((a, b) => a - b);

    expect(visitNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it('只有 checkup 類帶 visitNumber，其他類都不帶', () => {
    for (const t of prenatalCheckupSchedule) {
      expect(t.visitNumber !== undefined, t.id).toBe(t.kind === 'checkup');
    }
  });

  it('公費產檢的建議週數依次數遞增，且與官方時程一致', () => {
    const byVisit = prenatalCheckupSchedule
      .filter((t) => t.kind === 'checkup')
      .sort((a, b) => a.visitNumber! - b.visitNumber!);

    expect(byVisit.map((t) => t.dueWeek)).toEqual([
      8, 12, 16, 20, 24, 28, 30, 32, 34, 36, 37, 38, 39, 40,
    ]);
  });

  it('公費超音波共 3 次，涵蓋孕期前中後三段', () => {
    const funded = prenatalCheckupSchedule.filter((t) =>
      t.id.startsWith('prenatal-ultrasound-'),
    );

    expect(funded).toHaveLength(3);

    expect(funded.map((t) => [t.fromWeek, t.toWeek])).toEqual([
      [8, 16],
      [18, 30],
      [32, 40],
    ]);
  });

  it('關鍵時窗項目都在，且週數符合官方／學會建議', () => {
    const windowOf = (id: string) => {
      const item = prenatalCheckupSchedule.find((t) => t.id === id);

      expect(item, `找不到 ${id}`).toBeDefined();

      return [item!.fromWeek, item!.toWeek];
    };

    expect(windowOf('prenatal-thalassemia')).toEqual([8, 12]);
    expect(windowOf('prenatal-nuchal-translucency')).toEqual([11, 13]);
    expect(windowOf('prenatal-first-trimester-down')).toEqual([11, 13]);
    expect(windowOf('prenatal-anomaly-scan')).toEqual([20, 24]);
    expect(windowOf('prenatal-gdm')).toEqual([24, 28]);
    expect(windowOf('prenatal-gbs')).toEqual([35, 37]);
    expect(windowOf('prenatal-tdap')).toEqual([28, 36]);
  });

  it('每個 kind 都有對應的顯示標籤', () => {
    for (const t of prenatalCheckupSchedule) {
      expect(prenatalItemKindLabels[t.kind], t.kind).toBeTruthy();
    }
  });
});
