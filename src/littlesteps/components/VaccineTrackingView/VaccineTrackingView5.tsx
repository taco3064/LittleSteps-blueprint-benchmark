import { VaccineSchedule } from '~app/knowledge/domain/referenceModels';
import { VaccineTrackingView6 } from './VaccineTrackingView6';
interface VaccineTrackingView5Props {
  funding: { disc: string; badge: string; note: string };
  vaccine: VaccineSchedule;
}

export function VaccineTrackingView5({
  funding, vaccine,
}: VaccineTrackingView5Props) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div
        className={`
                                w-16 h-16 rounded-full flex-shrink-0 flex flex-col items-center justify-center text-white font-bold
                                ${funding.disc}
                              `}
      >
        <div className="text-lg leading-none">{vaccine.ageInMonths || 0}</div>
        <div className="text-xs font-normal opacity-90 mt-0.5">個月</div>
      </div>

      <VaccineTrackingView6 vaccine={vaccine} funding={funding} />
    </div>
  );
}
