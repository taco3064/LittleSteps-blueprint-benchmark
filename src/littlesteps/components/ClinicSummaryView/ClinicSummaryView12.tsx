import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { ClinicSummaryView13 } from './ClinicSummaryView13';
interface ClinicSummaryView12Props {
  data: import('~app/littlesteps/domain/clinicSummary').ClinicSummaryData;
}

export function ClinicSummaryView12({ data }: ClinicSummaryView12Props) {
  return (
    <motion.section variants={listItem} className="panel mb-4">
      <h2>近 7 天日常摘要</h2>
      {/* 每個平均各有自己的分母，寫在各自的格子裡。共用一個「有記錄的天數」
              會讓記得比較少的那一項被稀釋，而這份文件是要拿給醫師看的。 */}
      <p className="text-sm text-ink-muted mt-1">
        {data.weekSummary.loggedDays > 0
          ? `以 ${data.weekSummary.loggedDays} 天的記錄計算`
          : '近 7 天沒有任何記錄'}
      </p>

      <ClinicSummaryView13 data={data} />
    </motion.section>
  );
}
