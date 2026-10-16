import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import ReportChart from '../ReportChart';
import { ReportView13 } from './ReportView13';
interface ReportView12Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  dateLabels: string[];
  days: 7 | 30;
}

export function ReportView12({ report, dateLabels, days }: ReportView12Props) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-4">排便報告</h2>
      <ReportChart
        data={report.poop.dailyCounts}
        labels={dateLabels}
        type="bar"
        unit="次"
      />
      <ReportView13 report={report} days={days} />
    </motion.div>
  );
}
