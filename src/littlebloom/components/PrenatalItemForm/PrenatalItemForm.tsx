import { toLocalDateKey } from '~app/platform/domain/calendar';
import {
  PRENATAL_CLINIC_LIMIT,
  PRENATAL_NOTES_LIMIT,
} from '~app/family/domain/recordLimits';
import type { PrenatalCheckupTemplate } from '~app/knowledge/domain/prenatalCheckups';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littlebloom;
const today = () => toLocalDateKey();
interface PrenatalItemFormProps {
  completedDate: string;
  setCompletedDate: React.Dispatch<React.SetStateAction<string>>;
  clinicName: string;
  setClinicName: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  submit: (templateId: string) => Promise<void>;
  template: PrenatalCheckupTemplate;
  saving: boolean;
}

export default function PrenatalItemForm(props: PrenatalItemFormProps) {
  return (
    <div className="mt-3 pt-3 border-t border-bloom-sand space-y-2">
      <label className={`block text-xs ${THEME.muted}`}>
        完成日期
        <input
          type="date"
          value={props.completedDate}
          max={today()}
          onChange={(e) => props.setCompletedDate(e.target.value)}
          className={
            'mt-1 w-full px-3 min-h-tap rounded-xl border '
            + 'border-bloom-sand text-sm text-bloom-stone-ink'
          }
        />
      </label>
      <input
        type="text"
        value={props.clinicName}
        onChange={(e) => props.setClinicName(e.target.value)}
        placeholder="院所（選填）"
        // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，這一頁只會說
        // 「請確認網路」，家長會一直重送一筆永遠寫不進去的紀錄。
        maxLength={PRENATAL_CLINIC_LIMIT}
        className={
          'w-full px-3 min-h-tap rounded-xl border '
          + 'border-bloom-sand text-sm text-bloom-stone-ink'
        }
      />
      <input
        type="text"
        value={props.notes}
        onChange={(e) => props.setNotes(e.target.value)}
        placeholder="備註（選填）"
        maxLength={PRENATAL_NOTES_LIMIT}
        className={
          'w-full px-3 min-h-tap rounded-xl border '
          + 'border-bloom-sand text-sm text-bloom-stone-ink'
        }
      />
      <button
        type="button"
        onClick={() => {
          void props.submit(props.template.id);
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
