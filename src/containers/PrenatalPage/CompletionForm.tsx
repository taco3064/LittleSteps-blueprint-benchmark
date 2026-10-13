import {
  PRENATAL_CLINIC_LIMIT,
  PRENATAL_NOTES_LIMIT,
} from '~app/domain/recordLimits';
import type { PrenatalEditor } from './usePrenatalEditor';
import { THEME, today } from './presentation';

export default function CompletionForm({
  templateId,
  editor,
}: {
  templateId: string;
  editor: PrenatalEditor;
}) {
  const { completedDate, clinicName, notes } = editor.form;
  const { saving, submit, change } = editor;

  return (
    <div className="mt-3 pt-3 border-t border-bloom-sand space-y-2">
      <label className={`block text-xs ${THEME.muted}`}>
        完成日期
        <input
          type="date"
          value={completedDate}
          max={today()}
          onChange={(e) => change.completedDate(e.target.value)}
          className={
            'mt-1 w-full px-3 min-h-tap rounded-xl border'
            + ' border-bloom-sand text-sm text-bloom-stone-ink'
          }
        />
      </label>
      <input
        type="text"
        value={clinicName}
        onChange={(e) => change.clinicName(e.target.value)}
        placeholder="院所（選填）"
        // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，這一頁只會說
        // 「請確認網路」，家長會一直重送一筆永遠寫不進去的紀錄。
        maxLength={PRENATAL_CLINIC_LIMIT}
        className={
          'w-full px-3 min-h-tap rounded-xl border border-bloom-sand'
          + ' text-sm text-bloom-stone-ink'
        }
      />
      <input
        type="text"
        value={notes}
        onChange={(e) => change.notes(e.target.value)}
        placeholder="備註（選填）"
        maxLength={PRENATAL_NOTES_LIMIT}
        className={
          'w-full px-3 min-h-tap rounded-xl border border-bloom-sand'
          + ' text-sm text-bloom-stone-ink'
        }
      />
      <button
        type="button"
        onClick={() => {
          void submit(templateId);
        }}
        disabled={saving || !completedDate || completedDate > today()}
        className={`btn-primary w-full ${THEME.fill} ${THEME.fillText}`}
      >
        {saving ? '儲存中…' : '儲存'}
      </button>
    </div>
  );
}
