import { Star } from 'lucide-react';
interface SleepAnalysisView9Props {
  wakeTimeStars: number;
  regularity: import('~app/littlesteps/domain/sleepAnalysis').SleepRegularity;
}

export function SleepAnalysisView9({
  wakeTimeStars, regularity,
}: SleepAnalysisView9Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-ink">清醒時間規律性</span>
        <div
          className="flex gap-1"
          role="img"
          aria-label={`5 顆星中的 ${wakeTimeStars} 顆`}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              aria-hidden="true"
              className={`w-4 h-4 ${
                i <= wakeTimeStars
                  ? 'text-butter-dark fill-butter-dark'
                  : 'text-ink/20'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-ink-muted">
        平均清醒時間：
        {regularity.averageWakeTime}
      </p>
    </div>
  );
}
