import { useMemo } from 'react';
import { resolveCareTasks } from '~app/domain/careSchedule';
import { careTaskTemplates } from '~app/domain/careTasks';
import { ChildProfile, ResolvedCareTask } from '~app/domain/records';

/**
 * Combines the static care schedule with the child's own completion records
 * and LittleSteps' vaccine progress into dated, status-bearing tasks.
 *
 * No listener of its own: both progress maps hang off the children/{childId}
 * node that useUserChildren already subscribes to.
 */
export function useCareTasks(child: ChildProfile | undefined | null): {
  tasks: ResolvedCareTask[];
} {
  const tasks = useMemo(
    () =>
      child
        ? resolveCareTasks({
            birthday: child.birthday,
            templates: careTaskTemplates,
            careProgress: child.careTaskProgress ?? {},
            vaccineProgress: child.vaccineProgress ?? {},
          })
        : [],
    [child],
  );

  return { tasks };
}
