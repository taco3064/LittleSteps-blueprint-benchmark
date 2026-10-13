import { motion } from 'framer-motion';

import { listItem } from '~app/domain/motion';

import type { ClinicSummaryData } from '~app/domain/clinicSummary';

export default function HealthHistory({ data }: { data: ClinicSummaryData }) {
  return (
    <motion.section variants={listItem} className="panel mb-4">
      <h2>完整健康紀錄</h2>
      <ul className="mt-4 space-y-2">
        {data.healthTimeline.map((event) => (
          <li key={event.id} className="flex items-baseline gap-3 text-sm">
            <span className="text-ink-faint shrink-0 tabular-nums">
              {event.date || '未記日期'}
            </span>
            <span className="text-ink">
              {event.title}
              {event.location && (
                <span className="text-ink-muted">
                  （
                  {event.location}
                  ）
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
