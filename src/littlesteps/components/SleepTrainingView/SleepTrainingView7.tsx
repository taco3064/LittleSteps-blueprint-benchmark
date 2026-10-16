import { motion } from 'framer-motion';
import { stagger } from '~app/platform/components/Motion';
import { sleepRitualSteps } from '~app/littlesteps/domain/sleep';
import { SleepTrainingView8 } from './SleepTrainingView8';
interface SleepTrainingView7Props {
  ritualChecklist: Record<string, boolean>;
  toggleRitualStep: (stepId: string) => void;
}

export function SleepTrainingView7({
  ritualChecklist, toggleRitualStep,
}: SleepTrainingView7Props) {
  return (
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
          <SleepTrainingView8
            key={step.id}
            step={step}
            isChecked={isChecked}
            toggleRitualStep={toggleRitualStep}
          />
        );
      })}
    </motion.div>
  );
}
