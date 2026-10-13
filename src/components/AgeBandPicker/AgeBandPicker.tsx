import { motion } from 'framer-motion';
import type { ToddlerAgeBand } from '~app/domain/records';
import { tap } from '~app/domain/motion';
import { useCentreSelectedChip } from '~app/hooks/useCentreSelectedChip';
import { TODDLER_AGE_BANDS } from '~app/domain/ageBands';
import { ageBandLabels } from '~app/domain/developmentChecks';

interface AgeBandPickerProps {
  selected: ToddlerAgeBand;
  onSelect: (band: ToddlerAgeBand) => void;
}

/** Horizontally scrollable age-band chips, shared by 成長 and 提醒. */
export default function AgeBandPicker({ selected, onSelect }: AgeBandPickerProps) {
  const { scrollerRef, selectedRef } = useCentreSelectedChip(selected);

  return (
    <div ref={scrollerRef} className="row-bleed flex gap-2 py-1">
      {TODDLER_AGE_BANDS.map((band) => {
        const isSelected = band === selected;

        return (
          <motion.button
            key={band}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            whileTap={tap}
            onClick={() => onSelect(band)}
            aria-pressed={isSelected}
            className={`chip shrink-0 ${
              isSelected
                ? 'bg-explorer-sunbeam-ink text-white '
                + 'border-explorer-sunbeam-ink '
                + 'hover:border-explorer-sunbeam-ink'
                : ''
            }`}
          >
            {ageBandLabels[band]}
          </motion.button>
        );
      })}
    </div>
  );
}
