import { motion } from 'framer-motion';
import { stagger } from '~app/platform/components/Motion';
import { sleepSafetyRules } from '~app/littlesteps/domain/sleep';
import { SleepTrainingView5 } from './SleepTrainingView5';

export function SleepTrainingView4() {
  return (
    <motion.div
      className="grid md:grid-cols-2 gap-3 mb-8"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {sleepSafetyRules.map((rule) => (
        <SleepTrainingView5 key={rule.id} rule={rule} />
      ))}
    </motion.div>
  );
}
