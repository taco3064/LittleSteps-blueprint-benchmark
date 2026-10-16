import { useMemo } from 'react';
import { ChildProfile } from '~app/family/domain/familyRecords';
import { careTaskTemplates } from '~app/knowledge/domain/careTasks';
import { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import { resolveCareTasks } from '~app/littleexplorer/domain/careSchedule';

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
