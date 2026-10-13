import { formatDate } from '~app/domain/dateHelpers';
import type { ResolvedCareTask } from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
const THEME = SERVICE_THEME.littleexplorer;

export function ReminderDueDate({ task, beforeProfile }: {
  task: ResolvedCareTask;
  beforeProfile: boolean;
}) {
  return (
    <p className={`text-sm mt-0.5 ${THEME.muted}`}>
      {/* 「已逾期」只給真正逾期的列。狀態是 due 的項目施打窗口還開著，
                  在「現在可以做」底下寫「已逾期 365 天」自相矛盾，也把一件
                  還來得及的事說成錯誤。 */}
      {beforeProfile
        ? `建議日期 ${formatDate(task.dueDate)}`
        : task.status === 'overdue'
          ? `${formatDate(task.dueDate)} · 已逾期 ${Math.abs(task.daysUntilDue)} 天`
          : task.daysUntilDue >= 0
            ? `${formatDate(task.dueDate)} · 還有 ${task.daysUntilDue} 天`
            : `建議日期 ${formatDate(task.dueDate)}`}
    </p>
  );
}
