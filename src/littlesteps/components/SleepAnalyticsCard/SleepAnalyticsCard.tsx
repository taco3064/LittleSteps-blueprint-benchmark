import type { SleepAnalytics } from '~app/family/domain/familyRecords';
import { SleepAnalyticsCardPresentation } from './SleepAnalyticsCardPresentation';

interface SleepAnalyticsCardProps {
  analytics: SleepAnalytics;
  ageMonths?: number;
  onNavigate: () => void;
}

export default function SleepAnalyticsCard({
  analytics, ageMonths, onNavigate,
}: SleepAnalyticsCardProps) {
  // Get quality score color
  const getQualityColor = (score: number): string => {
    if (score >= 80) {
      return 'text-mint-dark';
    }

    if (score >= 60) {
      return 'text-secondary-dark';
    }

    if (score >= 40) {
      return 'text-butter-dark';
    }

    return 'text-red-600';
  };

  // Get quality label
  const getQualityLabel = (score: number): string => {
    if (score >= 80) {
      return '優良';
    }

    if (score >= 60) {
      return '良好';
    }

    if (score >= 40) {
      return '普通';
    }

    return '需改善';
  };

  const hasData = analytics.sleepCount > 0;

  return (
    <SleepAnalyticsCardPresentation
      onNavigate={onNavigate}
      hasData={hasData}
      analytics={analytics}
      getQualityColor={getQualityColor}
      getQualityLabel={getQualityLabel}
      ageMonths={ageMonths}
    />
  );
}
