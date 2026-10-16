import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { SleepAnalysisView7 } from './SleepAnalysisView7';
import { SleepAnalysisView9 } from './SleepAnalysisView9';
interface SleepAnalysisView6Props {
  regularity: import('~app/littlesteps/domain/sleepAnalysis').SleepRegularity;
  bedtimeStars: number;
  wakeTimeStars: number;
}

export function SleepAnalysisView6({
  regularity, bedtimeStars, wakeTimeStars,
}: SleepAnalysisView6Props) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-4">睡眠規律性</h2>

      {regularity.averageBedtime && (
        <SleepAnalysisView7 bedtimeStars={bedtimeStars} regularity={regularity} />
      )}

      {regularity.averageWakeTime && (
        <SleepAnalysisView9 wakeTimeStars={wakeTimeStars} regularity={regularity} />
      )}
    </motion.div>
  );
}
