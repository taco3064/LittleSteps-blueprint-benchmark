import { motion } from 'framer-motion';
import { stagger } from '~app/platform/components/Motion';
import { sleepTrainingMethods } from '~app/littlesteps/domain/sleep';
import { SleepTrainingView10 } from './SleepTrainingView10';
interface SleepTrainingView9Props {
  selectedMethod: string | null;
  setSelectedMethod: import('react').Dispatch<
    import('react').SetStateAction<string | null>
  >;
}

export function SleepTrainingView9({
  selectedMethod, setSelectedMethod,
}: SleepTrainingView9Props) {
  return (
    <motion.div
      className="space-y-3 mb-8"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {sleepTrainingMethods.map((method) => {
        const isExpanded = selectedMethod === method.id;

        return (
          <SleepTrainingView10
            key={method.id}
            method={method}
            setSelectedMethod={setSelectedMethod}
            isExpanded={isExpanded}
          />
        );
      })}
    </motion.div>
  );
}
