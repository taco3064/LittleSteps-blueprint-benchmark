import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { backdrop, sheet } from '~app/domain/motion';
import { FOOD_NOTES_LIMIT } from '~app/domain/recordLimits';
import { FIELD, LABEL, ERROR_BOX } from './formPresentation';
import { useFoodTrialForm } from './useFoodTrialForm';
import type { FoodTrialModalProps } from './useFoodTrialForm';
import FoodDetailsFields from './FoodDetailsFields';
import FoodPreferenceFields from './FoodPreferenceFields';
import FoodAllergyFields from './FoodAllergyFields';
import FoodTrialDatesFields from './FoodTrialDatesFields';

export default function FoodTrialModal(props: FoodTrialModalProps) {
  const { isOpen, onClose, editingFood } = props;
  const form = useFoodTrialForm(props);
  const { notes, setNotes, error, handleSave, saving } = form;

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
              'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl '
              + 'z-50 max-h-[85vh] overflow-y-auto'
            }
          >
            {/* Header */}
            <div
              className={
                'sticky top-0 bg-white border-b border-ink/10 px-4 py-3 flex '
                + 'items-center justify-between'
              }
            >
              <h2>{editingFood ? '編輯食物記錄' : '記錄新食物嘗試'}</h2>
              <button onClick={onClose} className="btn-icon" aria-label="關閉">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              <FoodDetailsFields form={form} />
              <FoodPreferenceFields form={form} />
              <FoodAllergyFields form={form} />
              <FoodTrialDatesFields form={form} />
              <div>
                <label htmlFor="food-notes" className={LABEL}>
                  備註
                </label>
                <textarea
                  id="food-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="記錄任何額外資訊..."
                  rows={3}
                  maxLength={FOOD_NOTES_LIMIT}
                  className={`${FIELD} resize-none`}
                />
              </div>

              {error && (
                <p role="alert" className={ERROR_BOX}>
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="btn-secondary flex-1">
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? '儲存中...' : editingFood ? '更新' : '儲存'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
