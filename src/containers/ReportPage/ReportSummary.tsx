import { motion } from 'framer-motion';

import { listItem } from '~app/domain/motion';

import type { WeeklyReport } from '~app/domain/reportGenerator';

export default function ReportSummary({ report }: { report: WeeklyReport }) {
  return (
    <motion.div variants={listItem} className="panel bg-butter-soft">
      <h2 className="mb-3">本期重點摘要</h2>
      <p className="text-sm text-ink leading-relaxed">{report.summaryText}</p>
    </motion.div>
  );
}
