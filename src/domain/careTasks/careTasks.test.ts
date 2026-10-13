import { describe, it, expect } from 'vitest';
import { vaccineSchedules } from '../vaccines';
import { careTaskKindLabels, careTaskTemplates } from './careTasks';

describe('careTaskTemplates', () => {
  it('共 20 筆，且 id 唯一', () => {
    expect(careTaskTemplates).toHaveLength(20);
    const ids = careTaskTemplates.map((t) => t.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每筆的月齡區間滿足 fromMonth <= dueMonth <= toMonth', () => {
    for (const t of careTaskTemplates) {
      expect(t.fromMonth, t.id).toBeLessThanOrEqual(t.dueMonth);
      expect(t.dueMonth, t.id).toBeLessThanOrEqual(t.toMonth);
    }
  });

  it('每筆都標註出處', () => {
    for (const t of careTaskTemplates) {
      expect(t.source.length, t.id).toBeGreaterThan(0);
    }
  });

  it('vaccineId 與 vaccineDose 必須成對出現', () => {
    for (const t of careTaskTemplates) {
      expect(
        (t.vaccineId === undefined) === (t.vaccineDose === undefined),
        `${t.id} 的 vaccineId 與 vaccineDose 必須同時有值或同時省略`,
      ).toBe(true);
    }
  });

  it('所有 vaccine 類任務都綁定疫苗記錄，其他類都不綁', () => {
    for (const t of careTaskTemplates) {
      expect(t.vaccineId !== undefined, t.id).toBe(t.kind === 'vaccine');
    }
  });

  it('每個 vaccineId 都存在於 vaccineSchedules，且 vaccineDose 等於其 currentDose', () => {
    for (const t of careTaskTemplates) {
      if (!t.vaccineId) {
        continue;
      }

      const schedule = vaccineSchedules.find((v) => v.id === t.vaccineId);

      expect(schedule, `${t.id} 指向不存在的疫苗 ${t.vaccineId}`).toBeDefined();

      expect(t.vaccineDose, `${t.id} 的劑次與疫苗資料不符`).toBe(
        schedule!.currentDose,
      );
    }
  });

  it('疫苗任務的 dueMonth 與疫苗資料的 ageInMonths 一致', () => {
    for (const t of careTaskTemplates) {
      if (!t.vaccineId) {
        continue;
      }

      const schedule = vaccineSchedules.find((v) => v.id === t.vaccineId)!;

      expect(t.dueMonth, `${t.id} 的到期月齡與疫苗時程不符`).toBe(
        schedule.ageInMonths,
      );
    }
  });

  it('所有任務落在 1-3 歲的服務範圍內（dueMonth 介於 12 與 36）', () => {
    for (const t of careTaskTemplates) {
      expect(t.dueMonth, t.id).toBeGreaterThanOrEqual(12);
      expect(t.dueMonth, t.id).toBeLessThanOrEqual(36);
    }
  });

  it('每個 kind 都有對應的顯示標籤', () => {
    for (const t of careTaskTemplates) {
      expect(careTaskKindLabels[t.kind], t.kind).toBeTruthy();
    }
  });
});
