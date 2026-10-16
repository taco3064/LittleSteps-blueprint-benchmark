import { splitOverdueByProfileStart } from '~app/family/domain/profileHistory';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';

/** Count actionable reminders without labelling missing history as overdue. */
export function countCareReminders(
  tasks: ResolvedCareTask[],
  profileCreatedAt?: string,
): number {
  const { overdue } = splitOverdueByProfileStart(tasks, profileCreatedAt);

  return overdue.length + tasks.filter((task) => task.status === 'due').length;
}
