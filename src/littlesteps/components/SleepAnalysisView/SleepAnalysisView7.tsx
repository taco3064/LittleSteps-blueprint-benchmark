import { SleepAnalysisView8 } from './SleepAnalysisView8';
interface SleepAnalysisView7Props {
  bedtimeStars: number;
  regularity: import('~app/littlesteps/domain/sleepAnalysis').SleepRegularity;
}

export function SleepAnalysisView7({
  bedtimeStars, regularity,
}: SleepAnalysisView7Props) {
  return (
    <div className="mb-4">
      <SleepAnalysisView8 bedtimeStars={bedtimeStars} />
      <p className="text-sm text-ink-muted">
        平均入睡時間：
        {regularity.averageBedtime}
      </p>
    </div>
  );
}
