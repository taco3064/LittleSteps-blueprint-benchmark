import { describe, expect, it } from 'vitest';
import { vaccineSchedules } from '../vaccines/index';
import { careTaskKindLabels, careTaskTemplates } from './index';

import {
  TODDLER_MAX_MONTHS,
  TODDLER_MIN_MONTHS,
} from '../../../family/domain/ageBands/index';
import { isScheduledDose } from '../../../family/domain/vaccineSchedule/index';

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

/**
 * 幼兒期該提醒的公費疫苗，有沒有真的都出現在提醒清單裡。
 *
 * 這兩份資料原本只被對帳「已連結的任務月齡要一致」，沒有人檢查「該連結的
 * 有沒有漏」。漏掉一劑公費疫苗不會有任何跡象：疫苗頁照樣列得出來，但幼兒期
 * 的家長只看提醒，於是那一劑就這樣過去了。
 *
 * 例外必須逐筆列名並寫下理由，和設計系統的遮罩白名單同一個作法：例外寫成
 * 一條判斷式，下一筆漏掉的疫苗就會被同一條規則默默吸收。
 */

const isToddlerAge = (months: number) =>
  months >= TODDLER_MIN_MONTHS && months <= TODDLER_MAX_MONTHS;

/**
 * 落在 1-3 歲區間、但刻意不做成幼兒期提醒的公費劑次。
 *
 * 每一筆都要有理由。理由不是「暫時先跳過」，而是「為什麼它不屬於這份清單」。
 *
 * 現在是空的。唯一一筆例外是 24 個月的「13 價肺炎鏈球菌第 4 劑」，而那一劑
 * 不存在——它自己引用的官方頁面寫的是常規 3 劑、高危險群那一劑在出生滿 6
 * 個月——已隨 #23 從疫苗資料裡移除。空著比留一筆「待釐清」誠實：這份名單是
 * 用來記錄決定的，不是用來停放疑問的。
 */
const DOCUMENTED_EXCLUSIONS: Record<string, string> = {};

describe('幼兒期疫苗提醒的涵蓋範圍', () => {
  const linkedVaccineIds = new Set(
    careTaskTemplates.map((template) => template.vaccineId).filter(Boolean),
  );

  // isScheduledDose，不是 funding === 'national'：公費但帶條件的那一劑只給名
  // 單上的孩子，isScheduledDose 不把它算成待辦，這份清單也就不該要求它有提醒。
  // 今天沒有差別——唯一那一劑在 6 個月，不在 1-3 歲區間——但下一劑落在幼兒期
  // 的條件式公費疫苗會讓這裡索求一個 isScheduledDose 明文禁止的提醒。
  const toddlerPublicDoses = vaccineSchedules.filter(
    (vaccine) => isScheduledDose(vaccine) && isToddlerAge(vaccine.ageInMonths ?? -1),
  );

  it('掃描範圍不是空的', () => {
    // 解析或篩選壞掉時，下面那條規則會安靜地永遠通過。
    expect(toddlerPublicDoses.length).toBeGreaterThan(3);
  });

  it('1-3 歲的每一劑公費疫苗都有提醒，或有列名的理由', () => {
    const unaccounted = toddlerPublicDoses
      .filter((vaccine) => !linkedVaccineIds.has(vaccine.id))
      .filter((vaccine) => !(vaccine.id in DOCUMENTED_EXCLUSIONS))
      .map((vaccine) => `${vaccine.id}@${vaccine.ageInMonths}m ${vaccine.name}`);

    expect(unaccounted).toEqual([]);
  });

  it('每條例外都寫得出理由', () => {
    for (const [id, reason] of Object.entries(DOCUMENTED_EXCLUSIONS)) {
      expect(reason.length, `${id} 的例外理由不能留空`).toBeGreaterThan(10);

      // 例外只對真的存在的劑次有意義；疫苗被改名或移除時這裡要跟著紅。
      expect(
        vaccineSchedules.some((vaccine) => vaccine.id === id),
        `${id} 已不在疫苗時程裡，這條例外可以刪掉`,
      ).toBe(true);
    }
  });

  it('自費劑次不強制要有提醒——那是選擇，不是時程', () => {
    // 六合一（五合一的自費升級版）與自費水痘第 2 劑刻意不在提醒裡：
    // 把自費選項混進法定時程，會讓家長以為漏打了。
    const privateToddlerDoses = vaccineSchedules.filter(
      (vaccine) =>
        vaccine.funding === 'self-paid' && isToddlerAge(vaccine.ageInMonths ?? -1),
    );

    expect(privateToddlerDoses.length).toBeGreaterThan(0);
  });
});
