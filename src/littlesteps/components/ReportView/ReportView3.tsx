import { motion } from 'framer-motion';
import { listItem, stagger } from '~app/platform/components/Motion';
import { ReportPeriod } from '~app/littlesteps/hooks/useReport';
import { ReportView10 } from './ReportView10';
import { ReportView12 } from './ReportView12';
import { ReportView14 } from './ReportView14';
import { ReportView4 } from './ReportView4';
import { ReportView5 } from './ReportView5';
import { ReportView6 } from './ReportView6';
import { ReportView8 } from './ReportView8';
interface ReportView3Props {
  setPeriod: import('react').Dispatch<import('react').SetStateAction<ReportPeriod>>;
  period: ReportPeriod;
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  days: 7 | 30;
  dateLabels: string[];
}

export function ReportView3({
  setPeriod, period, report, days, dateLabels,
}: ReportView3Props) {
  return (
    <div className="screen">
      <motion.div
        className="screen-body-wide"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Period Toggle */}
        <ReportView4 setPeriod={setPeriod} period={period} report={report} />

        {report && (
          <>
            {/* Section 1: Score Overview */}
            <ReportView5 report={report} days={days} />

            {/* Section 2: Feeding Report */}
            <ReportView6 report={report} dateLabels={dateLabels} days={days} />

            {/*
              擠奶自己一段，而且只有真的擠過奶才出現：對沒在擠奶的家長多一張
              永遠是 0 的卡，只是噪音。它刻意不放進上面的餵奶報告裡——擠出來的
              量不是寶寶喝進去的量。
            */}
            {report.pumping && <ReportView8 report={report} days={days} />}

            {/* Section 3: Sleep Report */}
            <ReportView10 report={report} dateLabels={dateLabels} days={days} />

            {/* Section 4: Poop Report */}
            <ReportView12 report={report} dateLabels={dateLabels} days={days} />

            {/* Section 5: Growth Record (30-day only) */}
            {period === '30days' && report.growth && (
              <ReportView14 report={report} />
            )}

            {/* Section 6: Summary */}
            <motion.div variants={listItem} className="panel bg-butter-soft">
              <h2 className="mb-3">本期重點摘要</h2>
              <p className="text-sm text-ink leading-relaxed">
                {report.summaryText}
              </p>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
