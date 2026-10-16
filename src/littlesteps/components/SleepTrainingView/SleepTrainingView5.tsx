import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { listItem } from '~app/platform/components/Motion';
interface SleepTrainingView5Props {
  rule: import('~app/littlesteps/domain/sleep').SleepSafetyRule;
}

export function SleepTrainingView5({ rule }: SleepTrainingView5Props) {
  return (
    <motion.div
      key={rule.id}
      variants={listItem}
      className={`card ${rule.type === 'do' ? 'bg-mint-soft' : 'bg-primary-soft'}`}
    >
      <div className="flex items-start gap-3">
        {/* 該做／不該做只靠這個符號區分，所以圖示留著 */}
        {rule.type === 'do'
          ? (
              <Check className="w-5 h-5 text-mint-dark shrink-0 mt-0.5" />
            )
          : (
              <X className="w-5 h-5 text-primary-dark shrink-0 mt-0.5" />
            )}
        <div className="flex-1">
          <h3
            className={`mb-1 ${rule.type === 'do' ? 'text-mint-dark' : 'text-primary-dark'}`}
          >
            {rule.title}
          </h3>
          <p className="text-sm text-ink leading-relaxed">{rule.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
