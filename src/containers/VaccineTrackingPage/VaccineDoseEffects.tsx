import type { VaccineSchedule } from '~app/domain/records';

export function VaccineDoseEffects({ vaccine }: { vaccine: VaccineSchedule }) {
  return (
    <div className="mt-3 pt-3 border-t border-ink/10">
      <h4 className="mb-2">可能的副作用</h4>
      <ul className="space-y-1 list-disc pl-5 marker:text-primary">
        {vaccine.sideEffects.map((effect, idx) => (
          <li key={idx} className="text-sm text-ink-muted">
            {effect}
          </li>
        ))}
      </ul>
    </div>
  );
}
