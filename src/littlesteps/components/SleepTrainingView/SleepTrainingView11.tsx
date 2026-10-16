import { AnimatePresence, motion } from 'framer-motion';
import { collapse } from '~app/platform/components/Motion';
interface SleepTrainingView11Props {
  isExpanded: boolean;
  method: import('~app/littlesteps/domain/sleep').SleepTrainingMethod;
}

export function SleepTrainingView11({
  isExpanded, method,
}: SleepTrainingView11Props) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div {...collapse} className="overflow-hidden">
          <div className="mt-4 pt-4 border-t border-ink/10">
            <h4 className="mb-3">實施步驟：</h4>
            <ol className="space-y-2">
              {method.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-ink">
                  <span
                    className={
                      'flex-shrink-0 w-5 h-5 rounded-full bg-secondary-light '
                      + 'text-secondary-dark flex items-center justify-center text-xs '
                      + 'font-semibold'
                    }
                  >
                    {idx + 1}
                  </span>
                  <span className="flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
