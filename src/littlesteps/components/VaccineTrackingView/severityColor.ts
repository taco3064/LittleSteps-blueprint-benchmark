export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'mild':
      return 'bg-mint-light text-mint-dark';
    case 'moderate':
      return 'bg-butter-light text-butter-dark';
    case 'severe':
      return 'bg-primary-light text-primary-dark';
    default:
      return 'bg-ink/5 text-ink-muted';
  }
};
