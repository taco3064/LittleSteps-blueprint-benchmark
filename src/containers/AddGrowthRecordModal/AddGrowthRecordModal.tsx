import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { backdrop, sheet, tap } from '~app/domain/motion';
import { GrowthRecord } from '~app/domain/records';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import { useToast } from '~app/hooks/useToast';
import { GROWTH_NOTES_LIMIT } from '~app/domain/recordLimits';

interface AddGrowthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<GrowthRecord, 'id'>) => Promise<void>;
  childId: string;
  /** 有值就是在改這一筆；打錯的體重原本只能刪掉重來。 */
  editingRecord?: GrowthRecord | null;
}

/* Same recipe as `LogEntryModal`; the four fields below were each styled apart. */
const FIELD
  = 'w-full px-4 py-3 rounded-xl border border-ink/15'
    + ' focus:border-primary-dark transition-colors';

const LABEL = 'block text-sm font-semibold text-ink mb-2';

export default function AddGrowthRecordModal({
  isOpen,
  onClose,
  onSave,
  childId,
  editingRecord,
}: AddGrowthRecordModalProps) {
  const toast = useToast();
  const [draft, setDraft] = useState<GrowthDraft>(() => initialDraft());
  const { date, weight, height, headCircumference, notes } = draft;

  const setField = (field: keyof GrowthDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaving(false);
    setDraft(initialDraft(editingRecord));
  }, [editingRecord, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight && !height && !headCircumference) {
      toast.show('請至少輸入一項測量數據');

      return;
    }

    setSaving(true);

    try {
      await onSave({
        childId,
        date,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        headCircumference: headCircumference
          ? parseFloat(headCircumference)
          : undefined,
        percentile: {}, // Will be calculated by the hook
        notes: notes || undefined,
      });

      // 表單的初始值由 editingRecord 決定，下次開啟時 effect 會重設。
      onClose();
    } catch (error) {
      console.error('Failed to save record:', error);
      toast.show((error as Error).message || '儲存失敗，請檢查輸入資料');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            {...backdrop}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          <motion.div
            {...sheet}
            className={
              'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50'
              + ' max-h-[85vh] overflow-y-auto'
            }
          >
            {/* Header */}
            <div
              className={
                'sticky top-0 bg-white border-b border-ink/10 flex'
                + ' items-center justify-between px-4 py-3 rounded-t-3xl'
              }
            >
              <h2>{editingRecord ? '編輯成長記錄' : '新增成長記錄'}</h2>
              <button onClick={onClose} className="btn-icon" aria-label="關閉">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              <GrowthFields draft={draft} onChange={setField} />
              <GrowthSubmitActions
                onClose={onClose}
                saving={saving}
                editingRecord={editingRecord}
              />
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

type GrowthDraft = {
  date: string;
  weight: string;
  height: string;
  headCircumference: string;
  notes: string;
};

function initialDraft(record?: GrowthRecord | null): GrowthDraft {
  return {
    date: record?.date ?? toLocalDateKey(),
    weight: draftMeasurement(record?.weight),
    height: draftMeasurement(record?.height),
    headCircumference: draftMeasurement(record?.headCircumference),
    notes: record?.notes ?? '',
  };
}

function GrowthFields({
  draft,
  onChange,
}: {
  draft: GrowthDraft;
  onChange: (field: keyof GrowthDraft, value: string) => void;
}) {
  return (
    <>
      <div>
        <label htmlFor="growth-date" className={LABEL}>
          測量日期
        </label>
        <input
          id="growth-date"
          type="date"
          value={draft.date}
          onChange={(e) => onChange('date', e.target.value)}
          max={toLocalDateKey()}
          required
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="growth-weight" className={LABEL}>
          體重 (kg)
        </label>
        <input
          id="growth-weight"
          type="number"
          step="0.01"
          min="0"
          max="50"
          value={draft.weight}
          onChange={(e) => onChange('weight', e.target.value)}
          placeholder="例如: 8.5"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="growth-height" className={LABEL}>
          身高 (cm)
        </label>
        <input
          id="growth-height"
          type="number"
          step="0.1"
          min="0"
          max="150"
          value={draft.height}
          onChange={(e) => onChange('height', e.target.value)}
          placeholder="例如: 72.5"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="growth-head" className={LABEL}>
          頭圍 (cm)
        </label>
        <input
          id="growth-head"
          type="number"
          step="0.1"
          min="0"
          max="70"
          value={draft.headCircumference}
          onChange={(e) => onChange('headCircumference', e.target.value)}
          placeholder="例如: 43.5"
          className={FIELD}
        />
      </div>

      <GrowthNotesField draft={draft} onChange={onChange} />
    </>
  );
}

function GrowthNotesField({
  draft,
  onChange,
}: {
  draft: GrowthDraft;
  onChange: (field: keyof GrowthDraft, value: string) => void;
}) {
  return (
    <div>
      <label htmlFor="growth-notes" className={LABEL}>
        備註 (選填)
      </label>
      <textarea
        id="growth-notes"
        value={draft.notes}
        onChange={(e) => onChange('notes', e.target.value)}
        placeholder="例如: 在家量測"
        rows={3}
        // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，家長只會看到
        // 一則儲存失敗，卻不知道該改什麼。
        maxLength={GROWTH_NOTES_LIMIT}
        className={`${FIELD} resize-none`}
      />
    </div>
  );
}

function GrowthSubmitActions({
  onClose,
  saving,
  editingRecord,
}: {
  onClose: () => void;
  saving: boolean;
  editingRecord: import('~app/domain/records').GrowthRecord | null | undefined;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <motion.button
        type="button"
        whileTap={tap}
        onClick={onClose}
        className="btn-secondary flex-1"
      >
        取消
      </motion.button>
      <motion.button
        type="submit"
        whileTap={tap}
        disabled={saving}
        className="btn-primary flex-1"
      >
        {saving
          ? (
              <>
                <div
                  className={
                    'w-5 h-5 border-2 border-white border-t-transparent'
                    + ' rounded-full animate-spin'
                  }
                />
                <span>儲存中...</span>
              </>
            )
          : (
              <>
                <Save className="w-5 h-5" />
                <span>{editingRecord ? '更新' : '儲存'}</span>
              </>
            )}
      </motion.button>
    </div>
  );
}

function draftMeasurement(value: number | undefined) {
  return value?.toString() ?? '';
}
