import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { collapse, listItem, stagger } from '~app/domain/motion';
import { pressable } from '~app/domain/pressable';
import { sleepTrainingMethods } from '~app/domain/sleep';

export default function SleepTrainingMethods() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  return (
    <>
      {/* 睡眠訓練技巧 */}
      <h2 className="mb-3">睡眠訓練技巧</h2>
      <motion.div
        className="space-y-3 mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {sleepTrainingMethods.map((method) => {
          const isExpanded = selectedMethod === method.id;

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
              <p className="text-sm text-ink-muted leading-relaxed">
                {method.description}
              </p>

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
                                'flex-shrink-0 w-5 h-5 rounded-full bg-secondary-light'
                                + ' text-secondary-dark flex items-center'
                                + ' justify-center text-xs'
                                + ' font-semibold'
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
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}
