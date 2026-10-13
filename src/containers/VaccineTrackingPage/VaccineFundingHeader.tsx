import {
  VaccineFunding,
  VaccineSchedule,
} from '~app/domain/records';
import {
  FUNDING_LABEL,
} from '~app/domain/vaccineCalendar';

const FUNDING_UI: Record<
  VaccineFunding,
  { disc: string; badge: string; note: string }
> = {
  national: {
    disc: 'bg-mint-dark',
    badge: 'bg-mint-light text-mint-dark',
    note: 'bg-mint-soft text-mint-dark',
  },
  'nhi-conditional': {
    disc: 'bg-secondary-dark',
    badge: 'bg-secondary-light text-secondary-dark',
    note: 'bg-secondary-soft text-secondary-dark',
  },
  'self-paid': {
    disc: 'bg-butter-dark',
    badge: 'bg-butter-light text-butter-dark',
    note: 'bg-butter-soft text-butter-dark',
  },
  'local-varies': {
    disc: 'bg-primary-dark',
    badge: 'bg-primary-light text-primary-dark',
    note: 'bg-primary-soft text-primary-dark',
  },
};

export function VaccineFundingHeader({ vaccine }: { vaccine: VaccineSchedule }) {
  const funding = FUNDING_UI[vaccine.funding];

  return (
    <div className="flex items-start gap-3 mb-3">
      <div
        className={`
                                w-16 h-16 rounded-full flex-shrink-0 flex flex-col items-center justify-center text-white font-bold
                                ${funding.disc}
                              `}
      >
        <div className="text-lg leading-none">
          {vaccine.ageInMonths || 0}
        </div>
        <div className="text-xs font-normal opacity-90 mt-0.5">
          個月
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="leading-tight mb-1">
          {vaccine.name}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <span>{vaccine.timing}</span>
          <span className={`tag ${funding.badge}`}>
            {FUNDING_LABEL[vaccine.funding]}
          </span>
        </div>

        {/* 條件不必點開就看得到：健保給付綁的是早產、先天性
                                    心臟病這些條件，而需要知道的家長正是最沒空多點
                                    一下的那群。 */}
        {vaccine.eligibility && (
          <p
            className={`text-sm rounded-xl px-3 py-2 mt-2 ${funding.note}`}
          >
            {vaccine.eligibility}
          </p>
        )}

        {vaccine.notes && (
          <p className="text-sm text-ink-muted mt-1">
            {vaccine.notes}
          </p>
        )}
      </div>
    </div>
  );
}
