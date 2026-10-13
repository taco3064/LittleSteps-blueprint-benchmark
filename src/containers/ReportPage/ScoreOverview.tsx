import { motion } from 'framer-motion';

import ScoreCircle from '~app/components/ScoreCircle';

import { listItem } from '~app/domain/motion';

import type { WeeklyReport } from '~app/domain/reportGenerator';

export default function ScoreOverview({
  report,
  days,
}: {
  report: WeeklyReport;
  days: number;
}) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-5">總覽評分</h2>
      {/* grid 而不是 justify-around：三顆圓環各佔一欄、跟著欄寬縮，
                  寫死 100px 的版本在 320px 的螢幕上會橫向溢出。 */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreCircle
          score={report.scores.feeding.score}
          label={report.scores.feeding.label}
          title="餵奶規律度"
        />
        <ScoreCircle
          score={report.scores.sleep.score}
          label={report.scores.sleep.label}
          title="睡眠品質"
        />
        <ScoreCircle
          score={report.scores.poop.score}
          label={report.scores.poop.label}
          title="排便正常度"
        />
      </div>
      {/* 分母要跟分數一起看得到，否則「兩天記錄算出來的 90 分」和
                  「三十天記錄算出來的 90 分」在畫面上長得一模一樣。 */}
      <p className="mt-4 text-center text-xs text-ink-faint">
        {'近 '}
        {days}
        {' 天中有記錄的天數：餵奶 '}
        {report.scores.feeding.loggedDays}
        {'、 睡眠 '}
        {report.scores.sleep.loggedDays}
        {'、排便 '}
        {report.scores.poop.loggedDays}
      </p>
    </motion.div>
  );
}
