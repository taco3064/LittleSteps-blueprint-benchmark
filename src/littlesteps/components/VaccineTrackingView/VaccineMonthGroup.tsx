import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { FUNDING_UI } from './FUNDING_UI';
import { VaccineTrackingView5 } from './VaccineTrackingView5';
import { VaccineTrackingView7 } from './VaccineTrackingView7';
interface VaccineMonthGroupProps {
  monthKey: string;
  month: number;
  vaccines: import('~app/knowledge/domain/referenceModels').VaccineSchedule[];
  isDoseAdministered: (vaccineId: string, doseNumber: number) => boolean;
  getDoseDate: (vaccineId: string, doseNumber: number) => string | undefined;
  setEditingDose: React.Dispatch<
    React.SetStateAction<{
      vaccineId: string;
      doseNumber: number;
      administered: boolean;
      currentDate?: string | undefined;
    } | null>
  >;
  canExport: boolean;
  exportDoses: (
    schedules: import('~app/knowledge/domain/referenceModels').VaccineSchedule[],
    label: string,
  ) => void;
}

export function VaccineMonthGroup({
  monthKey, month, vaccines, isDoseAdministered, getDoseDate, setEditingDose,
  canExport, exportDoses,
}: VaccineMonthGroupProps) {
  return (
    <div key={monthKey}>
      {/* Month Header */}
      <div className="flex items-center gap-2 mb-3">
        <h3
          className={
            'bg-mint-light text-mint-dark px-4 py-1.5 rounded-full '
            + 'whitespace-nowrap'
          }
        >
          {month}
          {' '}
          個月
        </h3>
        <span className="text-sm text-ink-muted whitespace-nowrap">
          (
          {vaccines.length}
          {' '}
          項)
        </span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>

      {/* Vaccines in this month */}
      <div className="space-y-3">
        {vaccines.map((vaccine) => {
          const funding = FUNDING_UI[vaccine.funding];
          const doseNum = vaccine.currentDose || 1;
          const isAdministered = isDoseAdministered(vaccine.id, doseNum);
          const doseDate = getDoseDate(vaccine.id, doseNum);

          const openDoseSheet = () =>
            setEditingDose({
              vaccineId: vaccine.id,
              doseNumber: doseNum,
              administered: isAdministered,
              currentDate: doseDate,
            });

          return (
            <motion.div key={vaccine.id} layout variants={listItem} className="card">
              {/* Age Badge & Vaccine Header */}
              <VaccineTrackingView5 funding={funding} vaccine={vaccine} />

              {/*
                              圓點的視覺維持 24px，外面的按鈕撐到 44px 才點得到；
                              負邊距讓這一列的節奏不變。同 MilestoneCard 的做法。
                            */}
              <VaccineTrackingView7
                openDoseSheet={openDoseSheet}
                vaccine={vaccine}
                isAdministered={isAdministered}
                doseDate={doseDate}
                canExport={canExport}
                exportDoses={exportDoses}
              />

              {/* Description and Protection - Always shown */}
              <div className="mt-3 pt-3 border-t border-ink/10">
                <h4 className="mb-2">可能的副作用</h4>
                <ul className="space-y-1 list-disc pl-5 marker:text-primary">
                  {vaccine.sideEffects.map((effect, idx) => (
                    <li key={idx} className="text-sm text-ink-muted">
                      {effect}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
