import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
} from 'lucide-react';

import { toLocalDateKey } from '~app/domain/dateHelpers';
import {
  tap,
} from '~app/domain/motion';

import { Sheet } from './Sheet';
import type { VaccineModel } from './useVaccineModel';

export function VaccineDateSheet({ model }: { model: VaccineModel }) {
  const { onSetVaccineDose, editingDose, setEditingDose } = model;

  return (
    <AnimatePresence>
      {editingDose && (
        <Sheet
          title={editingDose.administered ? '修改接種日期' : '記錄接種日期'}
          onClose={() => setEditingDose(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const date = formData.get('date');

              if (typeof date === 'string' && date) {
                // 確認日期一定是「已接種」。這裡原本沿用 toggle，於是家長在
                // 已接種的那一劑上按確認，反而把整筆接種紀錄清掉。
                onSetVaccineDose({
                  vaccineId: editingDose.vaccineId,
                  doseNumber: editingDose.doseNumber,
                  administered: true,
                  date,
                });

                setEditingDose(null);
              }
            }}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="vaccine-dose-date"
                className="block text-sm font-semibold text-ink mb-2"
              >
                接種日期
              </label>
              <input
                id="vaccine-dose-date"
                type="date"
                name="date"
                defaultValue={editingDose.currentDate || toLocalDateKey()}
                max={toLocalDateKey()}
                required
                className="w-full px-4 py-3 border border-ink/15 rounded-xl text-ink"
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                type="button"
                whileTap={tap}
                onClick={() => setEditingDose(null)}
                className="btn-secondary flex-1"
              >
                取消
              </motion.button>
              <motion.button
                type="submit"
                whileTap={tap}
                className="btn-primary flex-1"
              >
                <Check className="w-5 h-5" />
                <span>確認</span>
              </motion.button>
            </div>
          </form>

          {/* 取消接種是另一件事，不該由「確認日期」順手做掉——那正是原本的 bug。 */}
          {editingDose.administered && (
            <button
              type="button"
              onClick={() => {
                onSetVaccineDose({
                  vaccineId: editingDose.vaccineId,
                  doseNumber: editingDose.doseNumber,
                  administered: false,
                });

                setEditingDose(null);
              }}
              className="btn-ghost w-full text-primary-dark hover:bg-primary-light"
            >
              取消接種記錄
            </button>
          )}
        </Sheet>
      )}
    </AnimatePresence>
  );
}
