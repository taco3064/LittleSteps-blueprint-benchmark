import { motion } from 'framer-motion';
import { CalendarPlus, Check } from 'lucide-react';
import { tap } from '~app/platform/components/Motion';
import { formatDate } from '~app/platform/domain/calendar';
import { VaccineSchedule } from '~app/knowledge/domain/referenceModels';
interface VaccineTrackingView7Props {
  openDoseSheet: () => void;
  vaccine: VaccineSchedule;
  isAdministered: boolean;
  doseDate: string | undefined;
  canExport: boolean;
  exportDoses: (schedules: VaccineSchedule[], label: string) => void;
}

export function VaccineTrackingView7({
  openDoseSheet, vaccine, isAdministered, doseDate, canExport, exportDoses,
}: VaccineTrackingView7Props) {
  return (
    <div className="flex items-center gap-3 px-3 bg-warm-white rounded-xl">
      <button
        type="button"
        onClick={openDoseSheet}
        aria-label={`${vaccine.name}：${isAdministered ? '修改接種日期' : '記錄接種日期'}`}
        className="btn-icon -m-2.5"
      >
        <span
          className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                    ${
    isAdministered
      ? 'bg-primary-dark border-primary-dark'
      : 'border-ink/25'
    }
                                  `}
        >
          {isAdministered && <Check className="w-4 h-4 text-white" />}
        </span>
      </button>
      <button
        type="button"
        onClick={openDoseSheet}
        className="flex-1 min-h-tap flex items-center text-left"
      >
        {isAdministered
          ? (
              <span className="text-sm text-mint-dark font-medium">
                {doseDate ? `接種日期 ${formatDate(doseDate)}` : '已接種，點擊補上日期'}
              </span>
            )
          : (
              <span className="text-sm text-ink-muted">點擊記錄接種日期</span>
            )}
      </button>
      {/* 只有還沒接種、而且算得出日期的劑次值得提醒；
                                  已接種的那一劑進行事曆只是雜訊。 */}
      {canExport && !isAdministered && vaccine.ageInMonths !== undefined && (
        <motion.button
          type="button"
          whileTap={tap}
          onClick={() => exportDoses([vaccine], vaccine.name)}
          aria-label={`${vaccine.name}：加入行事曆`}
          className="btn-icon -m-2.5"
        >
          <CalendarPlus className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
