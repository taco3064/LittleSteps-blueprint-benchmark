import { AnimatePresence } from 'framer-motion';
import { getLucideIcon } from '~app/domain/lucideIcons';

import {
  vaccineEmergencies,
} from '~app/domain/vaccines';

import { Sheet } from './Sheet';
import type { VaccineModel } from './useVaccineModel';

export function VaccineEmergencySheet({ model }: { model: VaccineModel }) {
  const { showEmergencies, setShowEmergencies } = model;

  return (
    <AnimatePresence>
      {showEmergencies && (
        <Sheet title="緊急狀況處理" onClose={() => setShowEmergencies(false)}>
          {vaccineEmergencies.map((emergency) => {
            const IconComponent = getLucideIcon(emergency.icon);

            return (
              <div key={emergency.id} className="card bg-primary-soft">
                <div className="flex items-start gap-3">
                  {IconComponent && (
                    <IconComponent className={
                      'w-5 h-5'
                      + ' text-primary-dark shrink-0 mt-0.5'
                    }
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-primary-dark mb-1">{emergency.symptom}</h3>
                    <p className="text-sm text-ink">{emergency.action}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Sheet>
      )}
    </AnimatePresence>
  );
}
