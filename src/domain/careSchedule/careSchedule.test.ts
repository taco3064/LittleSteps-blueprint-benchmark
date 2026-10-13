import { describe, it, expect } from 'vitest';
import type { CareTaskProgress, CareTaskTemplate, VaccineProgress } from '../records';
import { resolveCareTasks } from './careSchedule';
import { addMonths } from '../dateHelpers';

const BIRTHDAY = '2024-01-15';

const healthCheck: CareTaskTemplate = {
  id: 'health-check-18m',
  kind: 'health-check',
  title: '兒童預防保健第 5 次',
  description: '1 歲 6 個月至未滿 2 歲',
  dueMonth: 18,
  fromMonth: 18,
  toMonth: 24,
  source: '國民健康署',
};

const jeDose1: CareTaskTemplate = {
  id: 'vaccine-je-1',
  kind: 'vaccine',
  title: '日本腦炎疫苗 第 1 劑',
  description: '出生滿 15 個月',
  dueMonth: 15,
  fromMonth: 15,
  toMonth: 18,
  source: '疾病管制署',
  vaccineId: 'je-15m',
  vaccineDose: 1,
};

const noProgress: CareTaskProgress = {};
const noVaccines: VaccineProgress = {};

const statusOf = (
  template: CareTaskTemplate,
  today: string,
  careProgress: CareTaskProgress = noProgress,
  vaccineProgress: VaccineProgress = noVaccines,
) =>
  resolveCareTasks({
    birthday: BIRTHDAY,
    templates: [template],
    careProgress: careProgress,
    vaccineProgress: vaccineProgress,
    today: new Date(`${today}T12:00:00`),
  })[0];

describe('addMonths', () => {
  it('加上整數月份', () => {
    expect(addMonths('2024-01-15', 18)).toBe('2025-07-15');
  });

  it('溢位到不存在的日期時退回當月最後一日', () => {
    // 2024-02-29 是閏日；加 12 個月落在 2025 年 2 月，該月只有 28 天
    expect(addMonths('2024-02-29', 12)).toBe('2025-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
  });
});

describe('resolveCareTasks', () => {
  it('由生日與 dueMonth 推算到期日與 window 結束日', () => {
    const task = statusOf(healthCheck, '2024-06-01');

    expect(task.dueDate).toBe('2025-07-15');
    expect(task.windowEnd).toBe('2026-01-15');
  });

  it('到期日前一天為 upcoming', () => {
    expect(statusOf(healthCheck, '2025-07-14').status).toBe('upcoming');
  });

  it('到期日當天為 due', () => {
    expect(statusOf(healthCheck, '2025-07-15').status).toBe('due');
  });

  it('window 最後一天仍為 due', () => {
    expect(statusOf(healthCheck, '2026-01-15').status).toBe('due');
  });

  it('window 結束隔天為 overdue', () => {
    expect(statusOf(healthCheck, '2026-01-16').status).toBe('overdue');
  });

  it('daysUntilDue 在到期前為正、逾期後為負', () => {
    expect(statusOf(healthCheck, '2025-07-05').daysUntilDue).toBe(10);
    expect(statusOf(healthCheck, '2025-07-25').daysUntilDue).toBe(-10);
  });

  it('有完成記錄時為 done，且蓋過 overdue', () => {
    const progress: CareTaskProgress = {
      'health-check-18m': {
        taskId: 'health-check-18m',
        completedDate: '2025-08-01',
      },
    };

    const task = statusOf(healthCheck, '2026-06-01', progress);

    expect(task.status).toBe('done');
    expect(task.completedDate).toBe('2025-08-01');
  });

  it('對應劑次已接種時，疫苗任務為 done', () => {
    const vaccines: VaccineProgress = {
      'je-15m': {
        doses: { 1: { administered: true, administeredDate: '2025-04-20' } },
      },
    };

    const task = statusOf(jeDose1, '2026-06-01', noProgress, vaccines);

    expect(task.status).toBe('done');
    expect(task.completedDate).toBe('2025-04-20');
  });

  it('只有其他劑次被勾選時，不得判定為 done', () => {
    const vaccines: VaccineProgress = {
      'je-15m': { doses: { 2: { administered: true } } },
    };

    expect(statusOf(jeDose1, '2026-06-01', noProgress, vaccines).status).toBe(
      'overdue',
    );
  });

  it('劑次存在但 administered 為 false 時，不得判定為 done', () => {
    const vaccines: VaccineProgress = {
      'je-15m': { doses: { 1: { administered: false } } },
    };

    // dueMonth 15 起算：到期日 2025-04-15、window 迄 2025-07-15，取區間內的一天
    expect(statusOf(jeDose1, '2025-05-01', noProgress, vaccines).status).toBe('due');
  });

  it('生日為閏日時仍能算出有效到期日', () => {
    const [task] = resolveCareTasks({
      birthday: '2024-02-29',
      templates: [healthCheck],
      careProgress: noProgress,
      vaccineProgress: noVaccines,
      today: new Date('2025-09-01T12:00:00'),
    });

    expect(task.dueDate).toBe('2025-08-29');
  });

  it('birthday 為空字串時回傳空陣列而非拋錯', () => {
    expect(
      resolveCareTasks({
        birthday: '',
        templates: [healthCheck],
        careProgress: noProgress,
        vaccineProgress: noVaccines,
      }),
    ).toEqual([]);
  });

  it('結果依到期日遞增排序', () => {
    const tasks = resolveCareTasks({
      birthday: BIRTHDAY,
      templates: [healthCheck, jeDose1],
      careProgress: noProgress,
      vaccineProgress: noVaccines,
      today: new Date('2024-06-01T12:00:00'),
    });

    expect(tasks.map((t) => t.template.id)).toEqual([
      'vaccine-je-1',
      'health-check-18m',
    ]);
  });
});
