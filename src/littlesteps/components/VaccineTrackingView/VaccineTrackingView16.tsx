import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { tap } from '~app/platform/components/Motion';
import { toLocalDateKey } from '~app/platform/domain/calendar';
interface VaccineTrackingView16Props {
  onSetVaccineDose: (dose: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    date?: string;
  }) => void;
  editingDose: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    currentDate?: string;
  };
  setEditingDose: import('react').Dispatch<
    import('react').SetStateAction<{
      vaccineId: string;
      doseNumber: number;
      administered: boolean;
      currentDate?: string;
    } | null>
  >;
}

export function VaccineTrackingView16({
  onSetVaccineDose, editingDose, setEditingDose,
}: VaccineTrackingView16Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const date = formData.get('date') as string;

        if (date) {
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
        <motion.button type="submit" whileTap={tap} className="btn-primary flex-1">
          <Check className="w-5 h-5" />
          <span>確認</span>
        </motion.button>
      </div>
    </form>
  );
}
