import { useMemo } from 'react';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { splitOverdueByProfileStart } from '~app/family/domain/profileHistory';
import type {
  ResolvedCareTask,
  ToddlerAgeBand,
} from '~app/knowledge/domain/referenceModels';
import { toddlerCareTips } from '~app/littleexplorer/domain/monthlyTips';
const UPCOMING_HORIZON_DAYS = 90;

const SECTIONS: {
  status: ResolvedCareTask['status'];
  title: string;
  accent: string;
}[] = [
  {
    status: 'overdue',
    title: '已經逾期',
    accent: 'bg-explorer-clay/10 border border-explorer-clay/40',
  },
  { status: 'due', title: '現在可以做', accent: '' },
  { status: 'upcoming', title: '接下來 90 天', accent: '' },
];

export function useReminderTasks({
  tasks,
  currentChild,
  band,
}: {
  tasks: ResolvedCareTask[];
  currentChild?: ChildProfile | null;
  band: ToddlerAgeBand;
}) {
  const visible = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.status === 'overdue'
          || task.status === 'due'
          || (task.status === 'upcoming' && task.daysUntilDue <= UPCOMING_HORIZON_DAYS),
      ),
    [tasks],
  );

  const done = useMemo(
    () => tasks.filter((task) => task.status === 'done'),
    [tasks],
  );

  const { overdue, missingHistory } = useMemo(
    () => splitOverdueByProfileStart(visible, currentChild?.createdAt),
    [visible, currentChild?.createdAt],
  );

  const sections = useMemo(
    () =>
      SECTIONS.map(({ status, title, accent }) => ({
        status,
        title,
        accent,
        rows:
          status === 'overdue'
            ? overdue
            : visible.filter((task) => task.status === status),
      })).filter(({ rows }) => rows.length > 0),
    [overdue, visible],
  );

  const actionable = useMemo(() => sections.flatMap(({ rows }) => rows), [sections]);

  const bandTips = useMemo(
    () => toddlerCareTips.filter((tip) => tip.ageBand === band),
    [band],
  );

  return { done, sections, actionable, bandTips, missingHistory };
}
