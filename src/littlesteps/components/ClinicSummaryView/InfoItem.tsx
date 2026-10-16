interface InfoItemProps {
  label: string;
  value: string;
}

export // ─── Sub-components ──────────────────────────────────────────

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-ink-muted mb-0.5">{label}</p>
      <p className="text-base font-medium text-ink">{value}</p>
    </div>
  );
}
