import { motion } from 'framer-motion';
import { getLucideIcon } from '~app/platform/components/LucideIcons';
import { listItem, stagger } from '~app/platform/components/Motion';
import { sleepKnowledge } from '~app/littlesteps/domain/sleep';

export function SleepTrainingView3() {
  return (
    <motion.div
      className="space-y-3 mb-8"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {sleepKnowledge.map((knowledge) => {
        const IconComponent = getLucideIcon(knowledge.icon);

        return (
          <motion.div
            key={knowledge.id}
            variants={listItem}
            className="card bg-secondary-soft"
          >
            <div className="flex items-center gap-2 mb-3">
              {IconComponent && (
                <IconComponent className="w-5 h-5 text-secondary-dark shrink-0" />
              )}
              <h3 className="flex-1">{knowledge.title}</h3>
            </div>
            <ul className="space-y-1.5 list-disc pl-5 marker:text-secondary">
              {knowledge.content.map((item, idx) => (
                <li key={idx} className="text-sm text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
