import { motion } from 'framer-motion';

import { listItem } from '~app/domain/motion';

import type { WeeklyReport } from '~app/domain/reportGenerator';

export default function GrowthReport({
  growth,
}: {
  growth: NonNullable<WeeklyReport['growth']>;
}) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-4">成長紀錄</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-mint-soft rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-mint-dark">
            {growth.weightChange > 0 ? '+' : ''}
            {growth.weightChange}
            <span className="text-xs font-normal ml-0.5">kg</span>
          </div>
          <div className="text-sm text-ink-muted">體重變化</div>
          {growth.latestPercentiles.weight !== undefined && (
            <div className="text-sm text-ink-muted mt-1">
              百分位:
              {' '}
              {growth.latestPercentiles.weight}
              %
            </div>
          )}
        </div>
        <div className="bg-mint-soft rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-mint-dark">
            {growth.heightChange > 0 ? '+' : ''}
            {growth.heightChange}
            <span className="text-xs font-normal ml-0.5">cm</span>
          </div>
          <div className="text-sm text-ink-muted">身高變化</div>
          {growth.latestPercentiles.height !== undefined && (
            <div className="text-sm text-ink-muted mt-1">
              百分位:
              {' '}
              {growth.latestPercentiles.height}
              %
            </div>
          )}
        </div>
      </div>
      {growth.latestPercentiles.headCircumference !== undefined && (
        <div className="mt-3 text-center text-sm text-ink-muted">
          頭圍百分位:
          {' '}
          {growth.latestPercentiles.headCircumference}
          %
        </div>
      )}
    </motion.div>
  );
}
