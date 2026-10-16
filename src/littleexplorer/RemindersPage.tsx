import type { ChildFormValues } from '~app/family/domain/childForm';
import { calculateAge } from '~app/family/domain/dateHelpers';
import type { CareTaskRecord, ChildProfile } from '~app/family/domain/familyRecords';
import { downloadIcs } from '~app/family/services/calendar_download';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import CareReminders from '~app/littleexplorer/components/CareReminders';
import { useRemindersForm } from '~app/littleexplorer/hooks/useRemindersForm';
import { useReminderTasks } from '~app/littleexplorer/hooks/useReminderTasks';
import { createRemindersActions } from './createRemindersActions';
import ExplorerShell from './ExplorerShell';
import { reminderEligibility } from './reminderEligibility';
export interface RemindersPageProps {
  currentChild?: ChildProfile | null;
  tasks: ResolvedCareTask[];
  reminderBadge?: number;
  onCompleteTask: (record: CareTaskRecord) => Promise<void>;
  onUndoTask?: (id: string) => Promise<void>;
  onAddChild: (child: ChildFormValues) => Promise<void>;
  onJoinChild?: (uuid: string) => Promise<void>;
}

export default function RemindersPage(props: RemindersPageProps) {
  const ageMonths = props.currentChild
    ? calculateAge(props.currentChild.birthday)
    : 0;

  const form = useRemindersForm(ageMonths);

  const model = useReminderTasks({
    tasks: props.tasks,
    currentChild: props.currentChild,
    band: form.band,
  });

  const { taskRow } = createRemindersActions({
    ...form,
    ...props,
    currentChild: props.currentChild,
    onUndoTask: props.onUndoTask,
  });

  const outOfRange = reminderEligibility({ ...props, ageMonths });

  return (
    <CareReminders
      currentChild={props.currentChild}
      reminderBadge={props.reminderBadge}
      {...props}
      {...model}
      {...form}
      ExplorerShell={ExplorerShell}
      outOfRange={outOfRange}
      taskRow={taskRow}
      onDownload={() =>
        downloadIcs(model.actionable, props.currentChild?.name ?? '寶寶')}
    />
  );
}
