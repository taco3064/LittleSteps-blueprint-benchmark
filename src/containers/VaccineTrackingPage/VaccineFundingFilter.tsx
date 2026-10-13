import { FUNDING_FILTERS } from './funding';
import type { VaccineModel } from './useVaccineModel';

export function VaccineFundingFilter({ model }: { model: VaccineModel }) {
  const { fundingFilter, setFundingFilter } = model;

  return (
    <div className="flex gap-2 mb-2">
      {FUNDING_FILTERS.map((option) => (
        <button
          key={option.value}
          onClick={() => setFundingFilter(option.value)}
          aria-label={option.ariaLabel}
          aria-pressed={fundingFilter === option.value}
          className={`chip flex-1 justify-center ${fundingFilter === option.value ? 'chip-on' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
