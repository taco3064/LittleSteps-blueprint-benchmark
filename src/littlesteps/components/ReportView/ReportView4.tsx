import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { ReportPeriod } from '~app/littlesteps/hooks/useReport';
import { formatDateShort } from './formatDateShort';
interface ReportView4Props {
  setPeriod: import('react').Dispatch<import('react').SetStateAction<ReportPeriod>>;
  period: ReportPeriod;
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
}

export function ReportView4({ setPeriod, period, report }: ReportView4Props) {
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
          {' '}
          ~
          {' '}
          {formatDateShort(report.period.end)}
        </p>
      )}
    </motion.div>
  );
}
