import { MonthFilter } from './MonthFilter';
interface VaccineTrackingView4Props {
  scrollerRef: import('react').RefObject<HTMLDivElement>;
  monthFilter: MonthFilter;
  selectedRef: import('react').RefObject<HTMLButtonElement>;
  pickMonth: (value: MonthFilter) => void;
  availableMonths: number[];
}

export function VaccineTrackingView4({
  scrollerRef, monthFilter, selectedRef, pickMonth, availableMonths,
}: VaccineTrackingView4Props) {
  return (
    <div ref={scrollerRef} className="row-bleed flex gap-2 pb-2 mb-4">
      <button
        ref={monthFilter === 'all' ? selectedRef : undefined}
        onClick={() => pickMonth('all')}
        aria-label="全部月齡"
        aria-pressed={monthFilter === 'all'}
        className={`chip flex-shrink-0 ${monthFilter === 'all' ? 'chip-on' : ''}`}
      >
        全部
      </button>
      {availableMonths.map((month) => (
        <button
          key={month}
          ref={monthFilter === month ? selectedRef : undefined}
          onClick={() => pickMonth(month)}
          aria-pressed={monthFilter === month}
          className={`chip flex-shrink-0 ${monthFilter === month ? 'chip-on' : ''}`}
        >
          {month}
          個月
        </button>
      ))}
    </div>
  );
}
