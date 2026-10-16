interface PercentileBadgeProps {
  value?: number;
}

export function PercentileBadge({ value }: PercentileBadgeProps) {
  if (value === undefined) {
    return null;
  }

  let bg = 'bg-mint-light text-mint-dark';

  if (value < 15) {
    bg = 'bg-butter-light text-butter-dark';
  } else if (value > 85) {
    bg = 'bg-secondary-light text-secondary-dark';
  }

  return (
    <span className={`tag ${bg}`}>
      P
      {Math.round(value)}
    </span>
  );
}
