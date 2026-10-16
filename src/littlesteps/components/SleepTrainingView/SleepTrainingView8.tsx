import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { listItem, tap } from '~app/platform/components/Motion';
interface SleepTrainingView8Props {
  step: import('~app/littlesteps/domain/sleep').SleepRitualStep;
  isChecked: boolean;
  toggleRitualStep: (stepId: string) => void;
}

export function SleepTrainingView8({
  step, isChecked, toggleRitualStep,
}: SleepTrainingView8Props) {
  return (
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
}
