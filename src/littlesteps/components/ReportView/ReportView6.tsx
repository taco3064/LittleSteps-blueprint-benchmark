import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import ReportChart from '../ReportChart';
import { ReportView7 } from './ReportView7';
interface ReportView6Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  dateLabels: string[];
  days: 7 | 30;
}

export function ReportView6({ report, dateLabels, days }: ReportView6Props) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-4">餵奶報告</h2>
      <ReportChart
        data={report.feeding.dailyAmounts}
        labels={dateLabels}
        type="line"
        unit="ml"
      />
      <ReportView7 report={report} days={days} />
    </motion.div>
  );
}
