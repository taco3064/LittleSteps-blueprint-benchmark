import { describe, expect, it } from 'vitest';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import { countCareReminders } from './index';

function task(status: ResolvedCareTask['status'], dueDate: string): ResolvedCareTask {
  return {
    status, dueDate, windowEnd: dueDate, daysUntilDue: 0,
    template: {
      id: dueDate, kind: 'health-check', title: '健檢', description: '',
      dueMonth: 12, fromMonth: 12, toMonth: 24, source: '國民健康署',
    },
  };
}

describe('countCareReminders', () => {
  const tasks = [
    task('overdue', '2026-01-01'),
    task('overdue', '2026-02-01'),
    task('due', '2026-03-01'),
    task('done', '2026-01-01'),
    task('upcoming', '2026-04-01'),
  ];

  it('counts due and genuine overdue, excluding history before enrolment', () => {
    expect(countCareReminders(tasks, '2026-02-01T00:00:00')).toBe(2);
  });

  it('retains overdue reminders without a profile boundary', () => {
    expect(countCareReminders(tasks)).toBe(3);
    expect(countCareReminders([])).toBe(0);
  });
});
