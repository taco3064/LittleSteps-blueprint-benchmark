import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { SleepAnalysisView11 } from './SleepAnalysisView11';
interface SleepAnalysisView10Props {
  advice: import('~app/littlesteps/domain/sleepAnalysis').SleepAdvice[];
}

export function SleepAnalysisView10({ advice }: SleepAnalysisView10Props) {
  return (
    <motion.div variants={listItem}>
      <h2 className="mb-3">改善建議</h2>

      <SleepAnalysisView11 advice={advice} />
    </motion.div>
  );
}
