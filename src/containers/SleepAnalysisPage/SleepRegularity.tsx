import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { listItem } from '~app/domain/motion';
import { calculateSleepRegularity } from '~app/domain/sleepAnalysis';

export default function SleepRegularity({
  regularity,
  count,
}: {
  regularity: ReturnType<typeof calculateSleepRegularity>;
  count: number;
}) {
  // Calculate regularity stars (5-star rating)
  const bedtimeStars = Math.round((regularity.bedtimeRegularity / 100) * 5);
  const wakeTimeStars = Math.round((regularity.wakeTimeRegularity / 100) * 5);

  return (
    <>
      {/* 規律性只算夜間睡眠。只記過小睡的話沒有就寢時間可談，0 顆星會被讀成
            「很不規律」，而事實是「還沒有這項資料」。 */}
      {count >= 3 && (regularity.averageBedtime || regularity.averageWakeTime) && (
        <motion.div variants={listItem} className="panel mb-4">
          <h2 className="mb-4">睡眠規律性</h2>

          {regularity.averageBedtime && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-ink">入睡時間規律性</span>
                {/* 星星只用顏色與填滿表達程度，讀螢幕軟體看不到；名稱補在
                      群組上，個別星星就不必逐顆唸。 */}
                <div
                  className="flex gap-1"
                  role="img"
                  aria-label={`5 顆星中的 ${bedtimeStars} 顆`}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={`w-4 h-4 ${
                        i <= bedtimeStars
                          ? 'text-butter-dark fill-butter-dark'
                          : 'text-ink/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink-muted">
                平均入睡時間：
                {regularity.averageBedtime}
              </p>
            </div>
          )}

          {regularity.averageWakeTime && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-ink">清醒時間規律性</span>
                <div
                  className="flex gap-1"
                  role="img"
                  aria-label={`5 顆星中的 ${wakeTimeStars} 顆`}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={`w-4 h-4 ${
                        i <= wakeTimeStars
                          ? 'text-butter-dark fill-butter-dark'
                          : 'text-ink/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink-muted">
                平均清醒時間：
                {regularity.averageWakeTime}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
