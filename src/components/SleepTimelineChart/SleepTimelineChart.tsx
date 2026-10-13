import { motion } from 'framer-motion';
import { listItem, stagger } from '~app/domain/motion';
import { DailyLog, SleepData } from '~app/domain/records';
import { isNightSleep } from '~app/domain/sleepAnalysis';
import { toLocalDateKey } from '~app/domain/dateHelpers';

interface SleepTimelineChartProps {
  weekLogs: DailyLog[];
}

interface SleepPeriod {
  date: string;
  startHour: number;
  endHour: number;
  duration: number;
  isNight: boolean;
}

export default function SleepTimelineChart({ weekLogs }: SleepTimelineChartProps) {
  const sleepPeriodsByDate = groupSleepPeriods(weekLogs);

  // Get last 7 days
  const dates: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);
    dates.push(toLocalDateKey(date));
  }

  return (
    <div className="card">
      {/*
        The axis shares the rows' flex structure below, so the hour marks stay
        over the bars. It used to be a hand-guessed `px-16` and drifted.
      */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-20 flex-shrink-0" />
        <div className="flex-1 flex justify-between text-xs text-ink-faint">
          <span>0:00</span>
          <span>6:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {dates.map((date) => {
          const periods = sleepPeriodsByDate[date] || [];

          return (
            <motion.div
              key={date}
              variants={listItem}
              className="flex items-center gap-3"
            >
              <div className="w-20 text-xs text-ink-muted flex-shrink-0">
                {formatDateLabel(date)}
              </div>

              <div className="flex-1 relative h-8 bg-warm-white rounded-lg">
                {/* Hour markers */}
                <div className="absolute inset-0 flex">
                  {[0, 6, 12, 18, 24].map((hour) => (
                    <div
                      key={hour}
                      className="absolute h-full border-l border-ink/10"
                      style={{ left: `${(hour / 24) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Sleep periods: deeper blue reads as night, lighter as a nap. */}
                {periods.map((period, periodIndex) => {
                  const { left, width } = calculatePosition(
                    period.startHour,
                    period.endHour,
                  );

                  return (
                    <motion.div
                      key={periodIndex}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`absolute top-1 bottom-1 rounded-md ${
                        period.isNight ? 'bg-secondary-dark' : 'bg-secondary'
                      }`}
                      style={{ left, width, transformOrigin: 'left' }}
                      title={`${period.duration} 分鐘`}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary-dark" />
          <span>夜間睡眠</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary" />
          <span>白天小睡</span>
        </div>
      </div>
    </div>
  );
}

function groupSleepPeriods(weekLogs: DailyLog[]) {
  // Group sleep logs by date
  const sleepPeriodsByDate: { [date: string]: SleepPeriod[] } = {};

  // Filter completed sleep logs and group by date
  weekLogs
    .filter((log) => {
      const data = log.data as SleepData;

      return log.type === 'sleep' && data.endTime && data.duration;
    })
    .forEach((log) => {
      const data = log.data as SleepData;
      const startDate = new Date(data.startTime);
      const endDate = new Date(data.endTime!);

      // Use date string as key (YYYY-MM-DD)
      const dateKey = toLocalDateKey(startDate);

      const startHour = startDate.getHours() + startDate.getMinutes() / 60;
      const endHour = endDate.getHours() + endDate.getMinutes() / 60;

      const period: SleepPeriod = {
        date: dateKey,
        startHour,
        endHour,
        duration: data.duration!,
        isNight: isNightSleep(data.startTime),
      };

      if (!sleepPeriodsByDate[dateKey]) {
        sleepPeriodsByDate[dateKey] = [];
      }

      sleepPeriodsByDate[dateKey].push(period);
    });

  return sleepPeriodsByDate;
}

// Helper to format date label
const formatDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

  return `${month}/${day} (${weekday})`;
};

// Helper to calculate position and width
const calculatePosition = (startHour: number, endHour: number) => {
  // Handle cross-midnight sleep (e.g., 23:00 to 07:00)
  let adjustedEndHour = endHour;

  if (endHour < startHour) {
    adjustedEndHour = endHour + 24;
  }

  const left = (startHour / 24) * 100;
  const width = ((adjustedEndHour - startHour) / 24) * 100;

  return { left: `${left}%`, width: `${width}%` };
};
