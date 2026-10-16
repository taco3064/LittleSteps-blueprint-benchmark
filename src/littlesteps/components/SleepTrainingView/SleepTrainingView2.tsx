import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
interface SleepTrainingView2Props {
  req: import('~app/littlesteps/domain/sleep').SleepRequirement;
}

export function SleepTrainingView2({ req }: SleepTrainingView2Props) {
  return (
    <motion.div key={req.id} variants={listItem} className="card">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h3>{req.ageRange}</h3>
        <span className="tag bg-secondary-light text-secondary-dark shrink-0">
          共
          {' '}
          {req.totalHours}
        </span>
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-2">
        <div className="flex gap-1.5">
          <dt className="text-ink-muted">白天</dt>
          <dd className="text-ink font-medium">{req.daytimeHours}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-ink-muted">晚上</dt>
          <dd className="text-ink font-medium">{req.nighttimeHours}</dd>
        </div>
      </dl>
      <p className="text-sm text-ink-muted leading-relaxed">{req.characteristics}</p>
    </motion.div>
  );
}
