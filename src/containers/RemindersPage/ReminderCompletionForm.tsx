import { toLocalDateKey } from '~app/domain/dateHelpers';
import {
  CARE_TASK_LOCATION_LIMIT,
  CARE_TASK_NOTES_LIMIT,
} from '~app/domain/recordLimits';
import type {
  ResolvedCareTask,
} from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

import type { ReminderModel } from './useReminderModel';

const THEME = SERVICE_THEME.littleexplorer;

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */

const today = () => toLocalDateKey();

export function ReminderCompletionForm({ model, task }: {

  model: ReminderModel;
  task: ResolvedCareTask;
  beforeProfile: boolean;
}) {
  const {
    completedDate,
    setCompletedDate,
    location,
    setLocation,
    notes,
    setNotes,
    saving,
    submitForm,
  } = model;

  return (
    <div className="mt-3 pt-3 border-t border-explorer-sand space-y-2">
      <label className={`block text-xs ${THEME.muted}`}>
        完成日期
        <input
          type="date"
          value={completedDate}
          max={today()}
          onChange={(e) => setCompletedDate(e.target.value)}
          className={
            'mt-1 w-full px-3 min-h-tap'
            + ' rounded-xl border border-explorer-sand text-sm text-explorer-bark'
          }
        />
      </label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="院所（選填）"
        // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，這一頁只會說
        // 「請確認網路」，家長會一直重送一筆永遠寫不進去的紀錄。
        maxLength={CARE_TASK_LOCATION_LIMIT}
        className={
          'w-full px-3 min-h-tap rounded-xl'
          + ' border border-explorer-sand text-sm text-explorer-bark'
        }
      />
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="備註（選填）"
        maxLength={CARE_TASK_NOTES_LIMIT}
        className={
          'w-full px-3 min-h-tap rounded-xl'
          + ' border border-explorer-sand text-sm text-explorer-bark'
        }
      />
      <button
        type="button"
        onClick={() => {
          void submitForm(task.template.id);
        }}
        disabled={saving || !completedDate || completedDate > today()}
        className={`btn-primary w-full ${THEME.fill} ${THEME.fillText}`}
      >
        {saving ? '儲存中…' : '儲存'}
      </button>
    </div>
  );
}
