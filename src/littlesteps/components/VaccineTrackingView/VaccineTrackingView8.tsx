import { getLucideIcon } from '~app/platform/components/LucideIcons';
import { vaccineSideEffects } from '~app/knowledge/domain/vaccines';
interface VaccineTrackingView8Props {
  getSeverityColor: (
    severity: string,
  ) =>
    | 'bg-mint-light text-mint-dark'
    | 'bg-butter-light text-butter-dark'
    | 'bg-primary-light text-primary-dark'
    | 'bg-ink/5 text-ink-muted';
}

export function VaccineTrackingView8({
  getSeverityColor,
}: VaccineTrackingView8Props) {
  return (
    <div className="space-y-3">
      {vaccineSideEffects.map((category) => {
        const IconComponent = getLucideIcon(category.icon);

        return (
          <div key={category.category} className="card">
            <div className="flex items-center gap-2 mb-3">
              {IconComponent && (
                <IconComponent className="w-5 h-5 text-primary-dark shrink-0" />
              )}
              <h3>{category.category}</h3>
            </div>

            <div className="space-y-2">
              {category.reactions.map((reaction, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <span
                    className={`tag whitespace-nowrap h-fit ${getSeverityColor(reaction.severity)}`}
                  >
                    {reaction.symptom}
                  </span>
                  <p className="text-ink-muted flex-1">{reaction.response}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
