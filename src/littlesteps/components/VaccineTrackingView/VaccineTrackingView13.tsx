interface VaccineTrackingView13Props {
  idx: number;
  type:
    | { type: string; description: string; examples: string[]; notes?: undefined }
    | { type: string; description: string; examples: string[]; notes: string };
}

export function VaccineTrackingView13({ idx, type }: VaccineTrackingView13Props) {
  return (
    <div key={idx} className="card">
      <h3 className="mb-2">{type.type}</h3>
      <p className="text-sm text-ink-muted mb-3">{type.description}</p>
      <div className="bg-warm-white rounded-xl p-3">
        <p className="text-sm text-ink-muted mb-2 font-medium">包含疫苗：</p>
        <div className="flex flex-wrap gap-1.5">
          {type.examples.map((example, exIdx) => (
            <span
              key={exIdx}
              className={
                'px-2 py-1 bg-white rounded-lg text-sm text-ink border '
                + 'border-ink/10'
              }
            >
              {example}
            </span>
          ))}
        </div>
      </div>
      {type.notes && (
        <p className="text-sm text-butter-dark mt-2 font-medium">{type.notes}</p>
      )}
    </div>
  );
}
