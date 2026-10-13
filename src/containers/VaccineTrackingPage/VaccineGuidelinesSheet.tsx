import { AnimatePresence } from 'framer-motion';

import {
  vaccineGuidelines,
} from '~app/domain/vaccines';

import { Sheet } from './Sheet';
import type { VaccineModel } from './useVaccineModel';

export function VaccineGuidelinesSheet({ model }: { model: VaccineModel }) {
  const { showGuidelines, setShowGuidelines } = model;

  return (
    <AnimatePresence>
      {showGuidelines && (
        <Sheet title="疫苗接種指南" onClose={() => setShowGuidelines(false)}>
          {vaccineGuidelines.map((section, idx) => (
            <div key={idx} className="card">
              <h3 className="mb-3">{section.title}</h3>
              <ul className="space-y-1.5 list-disc pl-5 marker:text-mint">
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
