import { motion } from 'framer-motion';
import { stagger } from '~app/platform/components/Motion';
import { sleepRequirements } from '~app/littlesteps/domain/sleep';
import { SleepTrainingView2 } from './SleepTrainingView2';

export function SleepTrainingView1() {
  return (
    <motion.div
      className="space-y-3 mb-8"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {sleepRequirements.map((req) => (
        <SleepTrainingView2 key={req.id} req={req} />
      ))}
    </motion.div>
  );
}
