import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { backdrop, sheet } from '~app/domain/motion';
import { DAILY_LOG_NOTES_LIMIT } from '~app/domain/recordLimits';
import { FIELD, LABEL } from './formPresentation';
import { useLogForm } from './useLogForm';
import type { LogEntryModalProps } from './logFormState';
import FeedingFields from './FeedingFields';
import SleepFields from './SleepFields';
import DiaperFields from './DiaperFields';

export default function LogEntryModal(props: LogEntryModalProps) {
  const { isOpen, onClose, editingLog, logType } = props;
  const form = useLogForm(props);

  const {
    notes,
    setNotes,
    error,
    isSubmitting,
    sleepRangeError,
    handleSubmit,
    getTitle,
  } = form;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            {...backdrop}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/*
            A bottom sheet, like every other modal in the app. This one used to be
            a centred dialog with no scroll, so on a phone with the keyboard up the
            submit button was unreachable — and it is the most-used form here.
          */}
          <motion.div
            {...sheet}
            className={
              'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl '
              + 'z-50 max-h-[85vh] overflow-y-auto'
            }
          >
            <div
              className={
                'sticky top-0 bg-white border-b border-ink/10 px-4 '
                + 'py-3 flex items-center justify-between'
              }
            >
              <h2>{getTitle()}</h2>
              <button onClick={onClose} className="btn-icon" aria-label="關閉">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {logType === 'feeding' && <FeedingFields form={form} />}
              {logType === 'sleep' && <SleepFields form={form} />}
              {logType === 'diaper' && <DiaperFields form={form} />}
              <div>
                <label htmlFor="log-notes" className={LABEL}>
                  備註
                </label>
                <textarea
                  id="log-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`${FIELD} resize-none`}
                  rows={3}
                  placeholder="選填"
                  // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，表單只會照印
                  // SDK 的原文，家長看不出該改什麼。
                  maxLength={DAILY_LOG_NOTES_LIMIT}
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-xl p-3"
                >
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || sleepRangeError !== null}
                className="btn-primary w-full"
              >
                {isSubmitting ? '儲存中...' : editingLog ? '更新' : '儲存'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
