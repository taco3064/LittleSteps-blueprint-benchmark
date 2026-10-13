import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { listItem, stagger, tap } from '~app/domain/motion';
import { sleepRitualSteps } from '~app/domain/sleep';

export default function SleepRitual() {
  const [ritualChecklist, setRitualChecklist] = useState<Record<string, boolean>>(
    {},
  );

  const toggleRitualStep = (stepId: string) => {
    setRitualChecklist((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  return (
    <>
      {/* 睡眠儀式 */}
      <h2 className="mb-3">睡眠儀式清單</h2>
      <div className="panel bg-secondary-soft mb-8">
        <p className="text-sm text-ink mb-4 leading-relaxed">
          在睡前 1 小時固定執行 3-4 個動作，形成生理連結，幫助寶寶知道「該睡覺了」。
        </p>
        <motion.div
          className="space-y-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {sleepRitualSteps.map((step) => {
            const isChecked = ritualChecklist[step.id] || false;

            return (
              /*
                  One tap target, not two. The row and the 24px checkbox inside
                  it both called toggleRitualStep, so a small target sat on top
                  of a large one doing the same thing. The box is now a
                  indicator and the row carries the semantics.
                */
              <motion.button
                key={step.id}
                type="button"
                variants={listItem}
                whileTap={tap}
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggleRitualStep(step.id)}
                className={`card-tap w-full flex items-center gap-3 text-left ${isChecked ? 'bg-secondary-light' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`
                      shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                      ${isChecked ? 'bg-secondary-dark border-secondary-dark' : 'border-ink/25'}
                    `}
                >
                  {isChecked && <Check className="w-4 h-4 text-white" />}
                </span>

                <span
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0
                    ${isChecked ? 'bg-secondary-dark text-white' : 'bg-ink/5 text-ink-muted'}
                  `}
                >
                  {step.order}
                </span>

                <span className="flex-1 min-w-0">
                  <span
                    className={`block font-semibold mb-0.5 ${isChecked ? 'text-secondary-dark' : 'text-ink'}`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`block text-sm ${isChecked ? 'text-secondary-dark' : 'text-ink-muted'}`}
                  >
                    {step.description}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
