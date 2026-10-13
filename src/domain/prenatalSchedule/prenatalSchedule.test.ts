import { describe, it, expect } from 'vitest';
import type { PrenatalCheckupTemplate } from '../prenatalCheckups';
import {
  dueDateFromLmp,
  resolvePrenatalItems,
  weeksPregnant,
} from './prenatalSchedule';

const LMP = '2026-01-01';

/** 週數區間跨越數週，用來釘四種狀態的邊界。 */
const gbs: PrenatalCheckupTemplate = {
  id: 'prenatal-gbs',
  kind: 'screening',
  title: '產前乙型鏈球菌篩檢',
  description: '妊娠第 35-37 週',
  dueWeek: 35,
  fromWeek: 35,
  toWeek: 37,
  source: '國民健康署',
};

const nt: PrenatalCheckupTemplate = {
  id: 'prenatal-nuchal-translucency',
  kind: 'screening',
  title: '胎兒頸部透明帶',
  description: '妊娠 11-13+6 週',
  dueWeek: 11,
  fromWeek: 11,
  toWeek: 13,
  source: '臺大醫院新竹臺大分院',
};

const noProgress: Record<string, { completedDate: string }> = {};

const itemOn = (
  template: PrenatalCheckupTemplate,
  today: string,
  completed: Record<string, { completedDate: string }> = noProgress,
) =>
  resolvePrenatalItems({
    lastPeriodDate: LMP,
    templates: [template],
    completed: completed,
    today: new Date(`${today}T12:00:00`),
  })[0];

describe('weeksPregnant', () => {
  it('末次月經當天為第 0 週', () => {
    expect(weeksPregnant(LMP, new Date('2026-01-01T12:00:00'))).toBe(0);
  });

  it('第 6 天仍是第 0 週，第 7 天才進第 1 週', () => {
    // 回傳的是「已完成的整週數」，顯示層要寫「第 N 週」時自行 +1。
    expect(weeksPregnant(LMP, new Date('2026-01-07T12:00:00'))).toBe(0);
    expect(weeksPregnant(LMP, new Date('2026-01-08T12:00:00'))).toBe(1);
  });

  it('末次月經在未來時回傳 0，不得回負數或取絕對值', () => {
    expect(weeksPregnant('2026-12-01', new Date('2026-01-01T12:00:00'))).toBe(0);
    expect(weeksPregnant('2026-03-19', new Date('2026-01-01T12:00:00'))).toBe(0);
  });

  it('日期以當地時區比較，不因 UTC 位移差一天', () => {
    // 用 new Date(y, m, d) 建立當地凌晨；若實作走 UTC，負時區會少算一天。
    expect(weeksPregnant('2026-01-01', new Date(2026, 0, 8, 0, 30))).toBe(1);
    expect(weeksPregnant('2026-01-08', new Date(2026, 0, 8, 0, 30))).toBe(0);
  });

  it('末次月經為空字串時回傳 0 而非拋錯', () => {
    expect(weeksPregnant('', new Date('2026-01-01T12:00:00'))).toBe(0);
  });
});

describe('dueDateFromLmp', () => {
  it('Naegele 法則：末次月經第一天起算 280 天', () => {
    expect(dueDateFromLmp(LMP)).toBe('2026-10-08');
  });
});

describe('resolvePrenatalItems', () => {
  it('把週數區間換算成日曆日期', () => {
    const item = itemOn(gbs, '2026-02-01');

    // 第 35 週的第一天 = LMP + 245 天；第 37 週的最後一天 = LMP + 265 天。
    expect(item.dueDate).toBe('2026-09-03');
    expect(item.windowStart).toBe('2026-09-03');
    expect(item.windowEnd).toBe('2026-09-23');
  });

  it('建議日前一天為 upcoming', () => {
    expect(itemOn(gbs, '2026-09-02').status).toBe('upcoming');
  });

  it('建議日當天為 due', () => {
    expect(itemOn(gbs, '2026-09-03').status).toBe('due');
  });

  it('區間最後一天（toWeek 那一週的第 6 天）仍為 due', () => {
    expect(itemOn(gbs, '2026-09-23').status).toBe('due');
  });

  it('區間結束隔天為 overdue', () => {
    expect(itemOn(gbs, '2026-09-24').status).toBe('overdue');
  });

  it('有完成記錄時為 done，且蓋過 overdue', () => {
    const completed = {
      'prenatal-gbs': { completedDate: '2026-09-10' },
    };

    const item = itemOn(gbs, '2026-11-01', completed);

    expect(item.status).toBe('done');
    expect(item.completedDate).toBe('2026-09-10');
  });

  it('其他項目的完成記錄不會誤判為 done', () => {
    const completed = {
      'prenatal-tdap': { completedDate: '2026-09-10' },
    };

    expect(itemOn(gbs, '2026-11-01', completed).status).toBe('overdue');
  });

  it('weeksUntilDue 在到期前為正、逾期後為負', () => {
    // 2026-08-27 是第 34 週，距第 35 週還有 1 週。
    expect(itemOn(gbs, '2026-08-27').weeksUntilDue).toBe(1);
    // 2026-10-08 是第 40 週。
    expect(itemOn(gbs, '2026-10-08').weeksUntilDue).toBe(-5);
  });

  it('末次月經在未來時，所有項目都是 upcoming 且不會出現誇張的週數差', () => {
    const [item] = resolvePrenatalItems({
      lastPeriodDate: '2027-01-01',
      templates: [gbs],
      completed: noProgress,
      today: new Date('2026-01-01T12:00:00'),
    });

    expect(item.status).toBe('upcoming');
    expect(item.weeksUntilDue).toBe(35);
  });

  it('末次月經為空字串時回傳空陣列而非拋錯', () => {
    expect(
      resolvePrenatalItems({
        lastPeriodDate: '',
        templates: [gbs],
        completed: noProgress,
      }),
    ).toEqual([]);
  });

  it('結果依建議日期遞增排序', () => {
    const items = resolvePrenatalItems({
      lastPeriodDate: LMP,
      templates: [gbs, nt],
      completed: noProgress,
      today: new Date('2026-02-01T12:00:00'),
    });

    expect(items.map((i) => i.template.id)).toEqual([
      'prenatal-nuchal-translucency',
      'prenatal-gbs',
    ]);
  });
});
