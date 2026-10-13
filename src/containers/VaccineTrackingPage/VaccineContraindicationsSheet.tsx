import { AnimatePresence } from 'framer-motion';

import {
  vaccineContraindications,
} from '~app/domain/vaccines';

import { Sheet } from './Sheet';
import type { VaccineModel } from './useVaccineModel';

export function VaccineContraindicationsSheet({ model }: { model: VaccineModel }) {
  const { showContraindications, setShowContraindications } = model;

  return (
    <AnimatePresence>
      {showContraindications && (
        <Sheet
          title="接種禁忌與注意事項"
          onClose={() => setShowContraindications(false)}
        >
          {vaccineContraindications.map((section, idx) => (
            <div key={idx} className="card">
              <h3 className="mb-3">{section.title}</h3>
              <ul className="space-y-1.5 list-disc pl-5 marker:text-primary">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-sm text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Sheet>
      )}
    </AnimatePresence>
  );
}
