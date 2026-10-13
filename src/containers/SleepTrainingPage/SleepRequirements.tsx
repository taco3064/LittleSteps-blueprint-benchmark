import { motion } from 'framer-motion';
import { listItem, stagger } from '~app/domain/motion';
import { sleepRequirements } from '~app/domain/sleep';

export default function SleepRequirements() {
  return (
    <>
      {/*
          睡眠時間參考表。原本是五欄表格：前四欄 whitespace-nowrap 把第五欄
          擠成窄柱，於是「睡眠特性」在 390px 下折成七八行，每列高約 250px，
          右側欄位還被切掉。手機上不該用表格排長句，改成一張張卡片。
        */}
      <h2 className="mb-3">睡眠時間參考表</h2>
      <motion.div
        className="space-y-3 mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {sleepRequirements.map((req) => (
          <motion.div key={req.id} variants={listItem} className="card">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <h3>{req.ageRange}</h3>
              <span className="tag bg-secondary-light text-secondary-dark shrink-0">
                {'共 '}
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
            <p className="text-sm text-ink-muted leading-relaxed">
              {req.characteristics}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
