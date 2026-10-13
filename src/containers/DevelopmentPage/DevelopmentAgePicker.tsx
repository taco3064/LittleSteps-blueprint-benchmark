import { motion } from 'framer-motion';
import AgeBandPicker from '~app/components/AgeBandPicker';
import {
  gestationalAgeLabel,
} from '~app/domain/correctedAge';
import { listItem } from '~app/domain/motion';

import type { DevelopmentModel } from './useDevelopmentModel';

export function DevelopmentAgePicker({ model }: { model: DevelopmentModel }) {
  const { currentChild, ageMonths, correcting, band, setBand } = model;

  return (
    <motion.div variants={listItem} className="space-y-2">
      <AgeBandPicker selected={band} onSelect={setBand} />
      {correcting && currentChild && (
        <p className="text-xs text-explorer-bark/70">
          {'已依早產矯正：預設看的是矯正年齡 '}
          {ageMonths}
          {' 個月（'}
          {gestationalAgeLabel(currentChild)}
          ）。
        </p>
      )}
    </motion.div>
  );
}
