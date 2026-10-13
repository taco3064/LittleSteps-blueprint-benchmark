import { motion } from 'framer-motion';
import { listItem, stagger } from '~app/domain/motion';
import { trainingTips } from '~app/domain/sleep';

export default function SleepTips() {
  const tipCards = [
    {
      tip: trainingTips.timing,
      tint: 'bg-secondary-soft',
      ink: 'text-secondary-dark',
    },
    { tip: trainingTips.consistency, tint: 'bg-mint-soft', ink: 'text-mint-dark' },
    { tip: trainingTips.patience, tint: 'bg-butter-soft', ink: 'text-butter-dark' },
  ];

  return (
    <>
      {/* 訓練建議 */}
      <h2 className="mb-3">訓練建議與提醒</h2>
      <motion.div
        className="space-y-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {tipCards.map(({ tip, tint, ink }) => (
          <motion.div key={tip.title} variants={listItem} className={`card ${tint}`}>
            <h3 className={`mb-1 ${ink}`}>{tip.title}</h3>
            <p className="text-sm text-ink">{tip.content}</p>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
