import { getLucideIcon } from '~app/platform/components/LucideIcons';
import { vaccineEmergencies } from '~app/knowledge/domain/vaccines';
import { Sheet } from './Sheet';
interface VaccineTrackingView10Props {
  setShowEmergencies: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
}

export function VaccineTrackingView10({
  setShowEmergencies,
}: VaccineTrackingView10Props) {
  return (
    <Sheet title="緊急狀況處理" onClose={() => setShowEmergencies(false)}>
      {vaccineEmergencies.map((emergency) => {
        const IconComponent = getLucideIcon(emergency.icon);

        return (
          <div key={emergency.id} className="card bg-primary-soft">
            <div className="flex items-start gap-3">
              {IconComponent && (
                <IconComponent className="w-5 h-5 text-primary-dark shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="text-primary-dark mb-1">{emergency.symptom}</h3>
                <p className="text-sm text-ink">{emergency.action}</p>
              </div>
            </div>
          </div>
        );
      })}
    </Sheet>
  );
}
