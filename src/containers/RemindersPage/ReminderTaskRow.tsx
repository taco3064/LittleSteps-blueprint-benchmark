import { careTaskKindLabels } from '~app/domain/careTasks';
import { formatDate } from '~app/domain/dateHelpers';
import type {
  ResolvedCareTask,
} from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { ReminderDueDate } from './ReminderDueDate';

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */

import { ReminderCompletionForm } from './ReminderCompletionForm';
import { ReminderTaskActions } from './ReminderTaskActions';
import type { ReminderModel } from './useReminderModel';

const THEME = SERVICE_THEME.littleexplorer;

export function ReminderTaskRow({ model, task, accent, beforeProfile = false }: {

  model: ReminderModel;
  task: ResolvedCareTask;
  accent: string;
  beforeProfile?: boolean;
}) {
  const { onUndoTask, formFor, failure } = model;
  const isVaccine = Boolean(task.template.vaccineId);
  const showForm = formFor === task.template.id;
  const isDone = task.status === 'done';
  /* 已完成、又不是疫苗、而 onUndoTask 還沒接上時，這一列沒有任何動作可做。 */
  const showActions = !isDone || isVaccine || Boolean(onUndoTask);

  return (
    <li key={task.template.id} className={`card ${accent}`}>
      <div className="flex items-start gap-3">
        <span className={`tag shrink-0 bg-explorer-sand ${THEME.muted}`}>
          {careTaskKindLabels[task.template.kind]}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className={THEME.body}>{task.template.title}</h3>
          <ReminderDueDate task={task} beforeProfile={beforeProfile} />
          <p className={`text-sm mt-2 leading-relaxed ${THEME.body}`}>
            {task.template.description}
          </p>
          {isDone && (
            <p className="text-sm mt-2 text-explorer-meadow-ink">
              {/* 疫苗只勾了接種、沒填日期時 completedDate 是空字串，
                    寫成「已於 完成」等於漏字。 */}
              {task.completedDate
                ? `已於 ${formatDate(task.completedDate)} 完成`
                : '已完成（沒有記錄日期）'}
            </p>
          )}
        </div>
      </div>

      {showActions && (
        <ReminderTaskActions model={model} task={task} beforeProfile={beforeProfile} />
      )}

      {showForm && (
        <ReminderCompletionForm model={model} task={task} beforeProfile={beforeProfile} />
      )}

      {failure?.taskId === task.template.id && (
        <p role="alert" className="text-sm mt-2 text-explorer-clay-ink">
          {failure.message}
        </p>
      )}
    </li>
  );
}
