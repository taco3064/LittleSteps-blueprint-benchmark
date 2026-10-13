import { MonthRange } from '~app/domain/records';
import { useCentreSelectedChip } from '~app/hooks/useCentreSelectedChip';

interface MonthPickerProps {
  ranges: { value: MonthRange; label: string }[];
  selected: MonthRange;
  onChange: (value: MonthRange) => void;
}

export default function MonthPicker({ ranges, selected, onChange }: MonthPickerProps) {
  const { scrollerRef, selectedRef } = useCentreSelectedChip(selected);

  return (
    <div ref={scrollerRef} className="row-bleed flex gap-2 pb-2">
      {ranges.map((range) => {
        const isSelected = selected === range.value;

        return (
          <button
            key={range.value}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => onChange(range.value)}
            aria-pressed={isSelected}
            className={`chip shrink-0 ${isSelected ? 'chip-on' : ''}`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
