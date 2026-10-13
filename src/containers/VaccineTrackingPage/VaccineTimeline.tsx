import { AnimatePresence, motion } from 'framer-motion';

import {
  stagger,
} from '~app/domain/motion';

import type { VaccineModel } from './useVaccineModel';
import { VaccineDoseRow } from './VaccineDoseRow';

export function VaccineTimeline({ model }: { model: VaccineModel }) {
  const { fundingFilter, monthFilter, vaccinesByMonth } = model;

  return (
    <AnimatePresence mode="popLayout">
      {/* Re-keying on the filters replays the stagger so a chip tap reads as
              a new list arriving. */}
      <motion.div
        key={`${fundingFilter}-${monthFilter}`}
        className="space-y-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
      >
        {Object.keys(vaccinesByMonth)
          .sort((a, b) => Number(a) - Number(b))
          .map((monthKey) => {
            const month = Number(monthKey);
            const vaccines = vaccinesByMonth[month];

            return (
              <div key={monthKey}>
                {/* Month Header */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={
                    'bg-mint-light text-mint-dark px-4'
                    + ' py-1.5 rounded-full whitespace-nowrap'
                  }
                  >
                    {month}
                    {' '}
                    個月
                  </h3>
                  <span className="text-sm text-ink-muted whitespace-nowrap">
                    (
                    {vaccines.length}
                    {' 項)'}
                  </span>
                  <div className="flex-1 h-px bg-ink/10" />
                </div>

                {/* Vaccines in this month */}
                <div className="space-y-3">
                  {vaccines.map((vaccine) => {
                    return (
                      <VaccineDoseRow key={vaccine.id} model={model} vaccine={vaccine} />
                    );
                  })}
                </div>
              </div>
            );
          })}
      </motion.div>
    </AnimatePresence>
  );
}
