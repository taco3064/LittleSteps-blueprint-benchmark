import { X } from 'lucide-react';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { DiaryMood } from '~app/family/domain/familyRecords';
import { DIARY_CONTENT_LIMIT } from '~app/family/domain/recordLimits';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littleexplorer;

const MOODS: { value: DiaryMood; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😊', label: '開心' },
  { value: 'proud', emoji: '🥹', label: '感動' },
  { value: 'tired', emoji: '😮‍💨', label: '累' },
  { value: 'worried', emoji: '😟', label: '擔心' },
  { value: 'funny', emoji: '😂', label: '好笑' },
];

const today = () => toLocalDateKey();
interface DiaryFormProps {
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setMood: React.Dispatch<React.SetStateAction<DiaryMood | undefined>>;
  mood: DiaryMood | undefined;
  formError: string;
  submit: () => Promise<void>;
  saving: boolean;
  editingId: string | null;
  resetForm: () => void;
}

export default function DiaryForm(props: DiaryFormProps) {
  return (
    <div className="space-y-3">
      <input
        type="date"
        value={props.date}
        max={today()}
        aria-label="日期"
        onChange={(e) => props.setDate(e.target.value)}
        className={
          'w-full px-3 min-h-tap rounded-xl border '
          + 'border-explorer-sand text-sm text-explorer-bark'
        }
      />
      <textarea
        value={props.content}
        onChange={(e) => props.setContent(e.target.value)}
        rows={4}
        autoFocus
        placeholder="今天發生了什麼？"
        // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，表單只會說「請確認
        // 網路」，家長會一直重送一則永遠寫不進去的日記。
        maxLength={DIARY_CONTENT_LIMIT}
        className={
          'w-full px-3 py-2 rounded-xl border border-explorer-sand '
          + 'text-sm text-explorer-bark leading-relaxed resize-none'
        }
      />
      <div className="flex flex-wrap gap-2">
        {MOODS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              props.setMood(props.mood === option.value ? undefined : option.value)}
            aria-pressed={props.mood === option.value}
            className={
              'chip '
              + (props.mood === option.value
                ? 'bg-explorer-sunbeam-ink text-white '
                + 'border-explorer-sunbeam-ink hover:border-explorer-sunbeam-ink'
                : '')
              + ''
            }
          >
            <span aria-hidden="true">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
      {props.formError && (
        <p role="alert" className="text-sm text-explorer-clay-ink">
          {props.formError}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            void props.submit();
          }}
          disabled={
            !props.content.trim()
            || !props.date
            || props.date > today()
            || props.saving
          }
          className={`btn-primary flex-1 ${THEME.fill} ${THEME.fillText}`}
        >
          {props.saving ? '儲存中…' : props.editingId ? '儲存修改' : '記下來'}
        </button>
        <button
          type="button"
          onClick={props.resetForm}
          aria-label="取消"
          className="btn-icon"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
