import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import ReportChart from '../ReportChart';
import { ReportView11 } from './ReportView11';
interface ReportView10Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  dateLabels: string[];
  days: 7 | 30;
}

export function ReportView10({ report, dateLabels, days }: ReportView10Props) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-4">睡眠報告</h2>
      <ReportChart
        data={report.sleep.dailyDurations}
        labels={dateLabels}
        type="line"
        unit="小時"
        recommendedValue={report.sleep.recommendedHours}
      />
      <ReportView11 report={report} days={days} />
    </motion.div>
  );
}
