import { AnimatePresence } from 'framer-motion';

import {
  vaccineTypes,
} from '~app/domain/vaccines';

import { Sheet } from './Sheet';
import type { VaccineModel } from './useVaccineModel';

export function VaccineTypesSheet({ model }: { model: VaccineModel }) {
  const { showVaccineTypes, setShowVaccineTypes } = model;

  return (
    <AnimatePresence>
      {showVaccineTypes && (
        <Sheet title="疫苗種類說明" onClose={() => setShowVaccineTypes(false)}>
          {vaccineTypes.map((type, idx) => (
            <div key={idx} className="card">
              <h3 className="mb-2">{type.type}</h3>
              <p className="text-sm text-ink-muted mb-3">{type.description}</p>
              <div className="bg-warm-white rounded-xl p-3">
                <p className="text-sm text-ink-muted mb-2 font-medium">
                  包含疫苗：
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {type.examples.map((example, exIdx) => (
                    <span
                      key={exIdx}
                      className={
                        'px-2 py-1 bg-white rounded-lg'
                        + ' text-sm text-ink border border-ink/10'
                      }
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
              {type.notes && (
                <p className="text-sm text-butter-dark mt-2 font-medium">
                  {type.notes}
                </p>
              )}
            </div>
          ))}
        </Sheet>
      )}
    </AnimatePresence>
  );
}
