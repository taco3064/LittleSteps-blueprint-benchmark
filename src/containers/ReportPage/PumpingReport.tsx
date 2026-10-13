import { motion } from 'framer-motion';

import { listItem } from '~app/domain/motion';
import { LoggedDaysNote } from './display';

import type { WeeklyReport } from '~app/domain/reportGenerator';

export default function PumpingReport({
  pumping,
  days,
}: {
  pumping: NonNullable<WeeklyReport['pumping']>;
  days: number;
}) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-1">擠奶紀錄</h2>
      <p className="mb-4 text-sm text-ink-muted">
        擠出的量是產出，沒有算進上面的餵奶總量。
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary-soft rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-primary-dark">
            {pumping.avgDailySessions}
          </div>
          <div className="text-sm text-ink-muted">平均每日次數</div>
          <LoggedDaysNote loggedDays={pumping.loggedDays} periodDays={days} />
        </div>
        <div className="bg-primary-soft rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-primary-dark">
            {pumping.avgDailyAmount}
            <span className="text-sm font-normal ml-0.5">ml</span>
          </div>
          <div className="text-sm text-ink-muted">平均每日擠出量</div>
          <LoggedDaysNote loggedDays={pumping.loggedDays} periodDays={days} />
        </div>
      </div>
    </motion.div>
  );
}
