import { toLocalDateKey } from '~app/platform/domain/calendar';
import {
  CARE_TASK_LOCATION_LIMIT,
  CARE_TASK_NOTES_LIMIT,
} from '~app/family/domain/recordLimits';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littleexplorer;
const today = () => toLocalDateKey();
interface CareTaskFormProps {
  completedDate: string;
  setCompletedDate: React.Dispatch<React.SetStateAction<string>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  submitForm: (taskId: string) => Promise<void>;
  task: ResolvedCareTask;
  saving: boolean;
}

export default function CareTaskForm(props: CareTaskFormProps) {
  return (
    <div className="mt-3 pt-3 border-t border-explorer-sand space-y-2">
      <label className={`block text-xs ${THEME.muted}`}>
        完成日期
        <input
          type="date"
          value={props.completedDate}
          max={today()}
          onChange={(e) => props.setCompletedDate(e.target.value)}
          className={
            'mt-1 w-full px-3 min-h-tap rounded-xl border '
            + 'border-explorer-sand text-sm text-explorer-bark'
          }
        />
      </label>
      <input
        type="text"
        value={props.location}
        onChange={(e) => props.setLocation(e.target.value)}
        placeholder="院所（選填）"
        // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，這一頁只會說
        // 「請確認網路」，家長會一直重送一筆永遠寫不進去的紀錄。
        maxLength={CARE_TASK_LOCATION_LIMIT}
        className={
          'w-full px-3 min-h-tap rounded-xl border '
          + 'border-explorer-sand text-sm text-explorer-bark'
        }
      />
      <input
        type="text"
        value={props.notes}
        onChange={(e) => props.setNotes(e.target.value)}
        placeholder="備註（選填）"
        maxLength={CARE_TASK_NOTES_LIMIT}
        className={
          'w-full px-3 min-h-tap rounded-xl border '
          + 'border-explorer-sand text-sm text-explorer-bark'
        }
      />
      <button
        type="button"
        onClick={() => {
          void props.submitForm(props.task.template.id);
        }}
        disabled={
          props.saving || !props.completedDate || props.completedDate > today()
        }
        className={`btn-primary w-full ${THEME.fill} ${THEME.fillText}`}
      >
        {props.saving ? '儲存中…' : '儲存'}
      </button>
    </div>
  );
}
