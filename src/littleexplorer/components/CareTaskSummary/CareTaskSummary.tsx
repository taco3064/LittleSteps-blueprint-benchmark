import { formatDate } from '~app/platform/domain/calendar';
import { careTaskKindLabels } from '~app/knowledge/domain/careTasks';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littleexplorer;
interface CareTaskSummaryProps {
  task: ResolvedCareTask;
  beforeProfile: boolean;
  isDone: boolean;
}

export default function CareTaskSummary({
  task,
  beforeProfile,
  isDone,
}: CareTaskSummaryProps) {
  return (
    <div className="flex items-start gap-3">
      <span className={`tag shrink-0 bg-explorer-sand ${THEME.muted}`}>
        {careTaskKindLabels[task.template.kind]}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className={THEME.body}>{task.template.title}</h3>
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
  );
}
