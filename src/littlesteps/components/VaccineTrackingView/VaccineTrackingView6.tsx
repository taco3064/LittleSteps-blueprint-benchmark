import { VaccineSchedule } from '~app/knowledge/domain/referenceModels';
import { FUNDING_LABEL } from '~app/littlesteps/domain/vaccineCalendar';
interface VaccineTrackingView6Props {
  vaccine: VaccineSchedule;
  funding: { disc: string; badge: string; note: string };
}

export function VaccineTrackingView6({
  vaccine, funding,
}: VaccineTrackingView6Props) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="leading-tight mb-1">{vaccine.name}</h3>

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
        <p className={`text-sm rounded-xl px-3 py-2 mt-2 ${funding.note}`}>
          {vaccine.eligibility}
        </p>
      )}

      {vaccine.notes && (
        <p className="text-sm text-ink-muted mt-1">{vaccine.notes}</p>
      )}
    </div>
  );
}
