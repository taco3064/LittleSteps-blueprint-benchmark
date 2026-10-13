import { formatDateShort } from './display';

import { motion } from 'framer-motion';

import { ReportPeriod } from '~app/hooks/useReport';

import { listItem } from '~app/domain/motion';
import type { WeeklyReport } from '~app/domain/reportGenerator';

export default function PeriodSelector({
  report,
  period,
  setPeriod,
}: {
  report: WeeklyReport | null;
  period: ReportPeriod;
  setPeriod: (period: ReportPeriod) => void;
}) {
  return (
    <motion.div variants={listItem} className="mb-6">
      <div className="flex justify-center gap-2 mb-2">
        {(['7days', '30days'] as ReportPeriod[]).map((p) => {
          const labels: Record<ReportPeriod, string> = {
            '7days': '近 7 天',
            '30days': '近 30 天',
          };

          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`chip ${period === p ? 'chip-on' : ''}`}
            >
              {labels[p]}
            </button>
          );
        })}
      </div>
      {report && (
        <p className="text-center text-sm text-ink-muted">
          {formatDateShort(report.period.start)}
          {' ~'}
          {' '}
          {formatDateShort(report.period.end)}
        </p>
      )}
    </motion.div>
  );
}
