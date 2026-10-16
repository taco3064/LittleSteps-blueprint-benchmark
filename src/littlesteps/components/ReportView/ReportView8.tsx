import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { ReportView9 } from './ReportView9';
interface ReportView8Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  days: 7 | 30;
}

export function ReportView8({ report, days }: ReportView8Props) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-1">擠奶紀錄</h2>
      <p className="mb-4 text-sm text-ink-muted">
        擠出的量是產出，沒有算進上面的餵奶總量。
      </p>
      <ReportView9 report={report} days={days} />
    </motion.div>
  );
}
