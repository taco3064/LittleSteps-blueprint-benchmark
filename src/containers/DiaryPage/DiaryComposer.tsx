import { motion } from 'framer-motion';
import { PenLine, X } from 'lucide-react';
import { useState } from 'react';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import { listItem, tap } from '~app/domain/motion';
import { DIARY_CONTENT_LIMIT } from '~app/domain/recordLimits';
import type { DiaryEntry, DiaryMood } from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
const THEME = SERVICE_THEME.littleexplorer;

const MOODS: { value: DiaryMood; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😊', label: '開心' },
  { value: 'proud', emoji: '🥹', label: '感動' },
  { value: 'tired', emoji: '😮‍💨', label: '累' },
  { value: 'worried', emoji: '😟', label: '擔心' },
  { value: 'funny', emoji: '😂', label: '好笑' },
];

const today = () => toLocalDateKey();
interface DiaryComposerActions {
  onAdd: (
    entry: Omit<DiaryEntry, 'id' | 'childId' | 'createdAt'>,
  ) => Promise<string | undefined>;
  onUpdate: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
}

export function useDiaryComposer({ onAdd, onUpdate }: DiaryComposerActions) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<DiaryMood | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setComposerOpen(false);
    setEditingId(null);
    setDate(today());
    setContent('');
    setMood(undefined);
    setFormError('');
  };

  const startEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setComposerOpen(false);
    setDate(entry.date);
    setContent(entry.content);
    setMood(entry.mood);
  };

  /*
   * store 的 addDiaryEntry／updateDiaryEntry／deleteDiaryEntry 失敗時往外丟
   * 且不 toast——訊息由這一頁負責。這裡最要緊的是失敗時不能 resetForm：家長
   * 剛寫的那段話沒有別的地方存著，清掉就永遠沒了。
   */
  const submit = async () => {
    const trimmed = content.trim();

    if (!trimmed || !date || date > today() || saving) {
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingId) {
        await onUpdate(editingId, { date, content: trimmed, mood });
      } else {
        await onAdd({ date, content: trimmed, mood });
      }

      resetForm();
    } catch (error) {
      console.error('儲存日記失敗:', error);
      setFormError('儲存失敗，剛才寫的內容還在，請確認網路後再送出。');
    } finally {
      setSaving(false);
    }
  };

  return {
    composerOpen,
    setComposerOpen,
    editingId,
    date,
    setDate,
    content,
    setContent,
    mood,
    setMood,
    saving,
    formError,
    resetForm,
    startEdit,
    submit,
  };
}

export function DiaryForm({
  composer,
}: {
  composer: ReturnType<typeof useDiaryComposer>;
}) {
  const {
    date,
    setDate,
    content,
    setContent,
    mood,
    setMood,
    saving,
    formError,
    editingId,
    resetForm,
    submit,
  } = composer;

  return (
    <div className="space-y-3">
      <input
        type="date"
        value={date}
        max={today()}
        aria-label="日期"
        onChange={(e) => setDate(e.target.value)}
        className={
          'w-full px-3 min-h-tap rounded-xl border border-explorer-sand'
          + ' text-sm text-explorer-bark'
        }
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        autoFocus
        placeholder="今天發生了什麼？"
        // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，表單只會說「請確認
        // 網路」，家長會一直重送一則永遠寫不進去的日記。
        maxLength={DIARY_CONTENT_LIMIT}
        className={
          'w-full px-3 py-2 rounded-xl border border-explorer-sand'
          + ' text-sm text-explorer-bark leading-relaxed resize-none'
        }
      />
      <div className="flex flex-wrap gap-2">
        {MOODS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMood(mood === option.value ? undefined : option.value)}
            aria-pressed={mood === option.value}
            className={`chip ${
              mood === option.value
                ? 'bg-explorer-sunbeam-ink text-white border-explorer-sunbeam-ink'
                + ' hover:border-explorer-sunbeam-ink'
                : ''
            }`}
          >
            <span aria-hidden="true">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
      {formError && (
        <p role="alert" className="text-sm text-explorer-clay-ink">
          {formError}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            void submit();
          }}
          disabled={!content.trim() || !date || date > today() || saving}
          className={`btn-primary flex-1 ${THEME.fill} ${THEME.fillText}`}
        >
          {saving ? '儲存中…' : editingId ? '儲存修改' : '記下來'}
        </button>
        <button
          type="button"
          onClick={resetForm}
          aria-label="取消"
          className="btn-icon"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function DiaryComposerPrompt({
  composerOpen,
  editingId,
  form,
  resetForm,
  setComposerOpen,
}: {
  composerOpen: boolean;
  editingId: string | null;
  form: React.ReactElement;
  resetForm: () => void;
  setComposerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <motion.section variants={listItem} className="panel">
      {composerOpen && !editingId
        ? (
            form
          )
        : (
            <motion.button
              type="button"
              whileTap={tap}
              onClick={() => {
                resetForm();
                setComposerOpen(true);
              }}
              className={
                'w-full min-h-tap flex items-center gap-3 text-left' + ` ${THEME.muted}`
              }
            >
              <PenLine className="w-5 h-5 shrink-0" />
              <span className="text-sm">今天發生了什麼？</span>
            </motion.button>
          )}
    </motion.section>
  );
}
