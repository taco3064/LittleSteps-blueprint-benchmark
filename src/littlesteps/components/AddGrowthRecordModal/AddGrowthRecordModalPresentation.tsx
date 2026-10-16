import { AnimatePresence, motion } from 'framer-motion';

import { Save, X } from 'lucide-react';

import { backdrop, sheet, tap } from '~app/platform/components/Motion';

import { GrowthRecord } from '~app/family/domain/familyRecords';

import { toLocalDateKey } from '~app/platform/domain/calendar';

import { GROWTH_NOTES_LIMIT } from '~app/family/domain/recordLimits';
interface AddGrowthRecordModalPresentation1Props {
  onClose: () => void;
  saving: boolean;
  editingRecord: GrowthRecord | null | undefined;
}

interface AddGrowthRecordModalPresentationProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecord: GrowthRecord | null | undefined;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  date: string;
  setDate: import('react').Dispatch<import('react').SetStateAction<string>>;
  weight: string;
  setWeight: import('react').Dispatch<import('react').SetStateAction<string>>;
  height: string;
  setHeight: import('react').Dispatch<import('react').SetStateAction<string>>;
  headCircumference: string;
  setHeadCircumference: import('react').Dispatch<
    import('react').SetStateAction<string>
  >;
  notes: string;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
  saving: boolean;
}

/* Same recipe as `LogEntryModal`; the four fields below were each styled apart. */
const FIELD
  = 'w-full px-4 py-3 rounded-xl border border-ink/15 '
    + 'focus:border-primary-dark transition-colors';

const LABEL = 'block text-sm font-semibold text-ink mb-2';

export function AddGrowthRecordModalPresentation1({
  onClose, saving, editingRecord,
}: AddGrowthRecordModalPresentation1Props) {
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
                    'w-5 h-5 border-2 border-white border-t-transparent rounded-full '
                    + 'animate-spin'
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

export function AddGrowthRecordModalPresentation({
  isOpen, onClose, editingRecord, handleSubmit, date, setDate, weight, setWeight,
  height, setHeight, headCircumference, setHeadCircumference, notes, setNotes,
  saving,
}: AddGrowthRecordModalPresentationProps) {
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
              'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[85vh] '
              + 'overflow-y-auto'
            }
          >
            {/* Header */}
            <div
              className={
                'sticky top-0 bg-white border-b border-ink/10 flex items-center '
                + 'justify-between px-4 py-3 rounded-t-3xl'
              }
            >
              <h2>{editingRecord ? '編輯成長記錄' : '新增成長記錄'}</h2>
              <button onClick={onClose} className="btn-icon" aria-label="關閉">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              <AddGrowthRecordModalPresentationSection1
                date={date}
                setDate={setDate}
              />

              <AddGrowthRecordModalPresentationSection2
                weight={weight}
                setWeight={setWeight}
              />

              <AddGrowthRecordModalPresentationSection3
                height={height}
                setHeight={setHeight}
              />

              <AddGrowthRecordModalPresentationSection4
                headCircumference={headCircumference}
                setHeadCircumference={setHeadCircumference}
              />

              <AddGrowthRecordModalPresentationSection5
                notes={notes}
                setNotes={setNotes}
              />

              <AddGrowthRecordModalPresentation1
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

function AddGrowthRecordModalPresentationSection1({
  date, setDate,
}: Pick<AddGrowthRecordModalPresentationProps, 'date' | 'setDate'>) {
  return (
    <div>
      <label htmlFor="growth-date" className={LABEL}>
        測量日期
      </label>
      <input
        id="growth-date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={toLocalDateKey()}
        required
        className={FIELD}
      />
    </div>
  );
}

function AddGrowthRecordModalPresentationSection2({
  weight, setWeight,
}: Pick<AddGrowthRecordModalPresentationProps, 'weight' | 'setWeight'>) {
  return (
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
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="例如: 8.5"
        className={FIELD}
      />
    </div>
  );
}

function AddGrowthRecordModalPresentationSection3({
  height, setHeight,
}: Pick<AddGrowthRecordModalPresentationProps, 'height' | 'setHeight'>) {
  return (
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
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        placeholder="例如: 72.5"
        className={FIELD}
      />
    </div>
  );
}

function AddGrowthRecordModalPresentationSection4({
  headCircumference, setHeadCircumference,
}: Pick<
  AddGrowthRecordModalPresentationProps,
  'headCircumference' | 'setHeadCircumference'
>) {
  return (
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
        value={headCircumference}
        onChange={(e) => setHeadCircumference(e.target.value)}
        placeholder="例如: 43.5"
        className={FIELD}
      />
    </div>
  );
}

function AddGrowthRecordModalPresentationSection5({
  notes, setNotes,
}: Pick<AddGrowthRecordModalPresentationProps, 'notes' | 'setNotes'>) {
  return (
    <div>
      <label htmlFor="growth-notes" className={LABEL}>
        備註 (選填)
      </label>
      <textarea
        id="growth-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="例如: 在家量測"
        rows={3}
        maxLength={GROWTH_NOTES_LIMIT}
        className={`${FIELD} resize-none`}
      />
    </div>
  );
}
