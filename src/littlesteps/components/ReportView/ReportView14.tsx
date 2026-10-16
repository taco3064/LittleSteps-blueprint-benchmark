import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { ReportView15 } from './ReportView15';
interface ReportView14Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
}

export function ReportView14({ report }: ReportView14Props) {
  if (!report.growth) {
    return null;
  }

  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-4">成長紀錄</h2>
      <ReportView15 report={report} />
      {report.growth.latestPercentiles.headCircumference !== undefined && (
        <div className="mt-3 text-center text-sm text-ink-muted">
          頭圍百分位:
          {' '}
          {report.growth.latestPercentiles.headCircumference}
          %
        </div>
      )}
    </motion.div>
  );
}
