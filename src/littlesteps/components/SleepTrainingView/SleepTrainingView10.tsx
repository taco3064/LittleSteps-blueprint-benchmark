import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { listItem } from '~app/platform/components/Motion';
import { pressable } from '~app/platform/components/Pressable';
import { SleepTrainingView11 } from './SleepTrainingView11';
interface SleepTrainingView10Props {
  method: import('~app/littlesteps/domain/sleep').SleepTrainingMethod;
  setSelectedMethod: import('react').Dispatch<
    import('react').SetStateAction<string | null>
  >;
  isExpanded: boolean;
}

export function SleepTrainingView10({
  method, setSelectedMethod, isExpanded,
}: SleepTrainingView10Props) {
  return (
    <motion.div
      key={method.id}
      layout
      variants={listItem}
      className="card-tap"
      {...pressable(
        () => setSelectedMethod(isExpanded ? null : method.id),
        isExpanded,
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3>{method.title}</h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-ink-faint flex-shrink-0" />
        </motion.div>
      </div>
      <p className="text-sm text-ink-muted leading-relaxed">{method.description}</p>

      <SleepTrainingView11 isExpanded={isExpanded} method={method} />
    </motion.div>
  );
}
