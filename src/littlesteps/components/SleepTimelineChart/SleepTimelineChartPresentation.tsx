import { motion } from 'framer-motion';

import { listItem, stagger } from '~app/platform/components/Motion';
interface SleepTimelineChartPresentation3Props {
  periods: SleepPeriod[];
  calculatePosition: (
    startHour: number,
    endHour: number,
  ) => { left: string; width: string };
}

interface SleepTimelineChartPresentation2Props {
  date: string;
  formatDateLabel: (dateStr: string) => string;
  periods: SleepPeriod[];
  calculatePosition: (
    startHour: number,
    endHour: number,
  ) => { left: string; width: string };
}

interface SleepTimelineChartPresentation1Props {
  dates: string[];
  sleepPeriodsByDate: { [date: string]: SleepPeriod[] };
  formatDateLabel: (dateStr: string) => string;
  calculatePosition: (
    startHour: number,
    endHour: number,
  ) => { left: string; width: string };
}

interface SleepTimelineChartPresentationProps {
  dates: string[];
  sleepPeriodsByDate: { [date: string]: SleepPeriod[] };
  formatDateLabel: (dateStr: string) => string;
  calculatePosition: (
    startHour: number,
    endHour: number,
  ) => { left: string; width: string };
}

interface SleepPeriod {
  date: string;
  startHour: number;
  endHour: number;
  duration: number;
  isNight: boolean;
}

export function SleepTimelineChartPresentation3({
  periods, calculatePosition,
}: SleepTimelineChartPresentation3Props) {
  return (
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
        const { left, width } = calculatePosition(period.startHour, period.endHour);

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
  );
}

export function SleepTimelineChartPresentation2({
  date, formatDateLabel, periods, calculatePosition,
}: SleepTimelineChartPresentation2Props) {
  return (
    <motion.div key={date} variants={listItem} className="flex items-center gap-3">
      <div className="w-20 text-xs text-ink-muted flex-shrink-0">
        {formatDateLabel(date)}
      </div>

      <SleepTimelineChartPresentation3
        periods={periods}
        calculatePosition={calculatePosition}
      />
    </motion.div>
  );
}

export function SleepTimelineChartPresentation1({
  dates, sleepPeriodsByDate, formatDateLabel, calculatePosition,
}: SleepTimelineChartPresentation1Props) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {dates.map((date) => {
        const periods = sleepPeriodsByDate[date] || [];

        return (
          <SleepTimelineChartPresentation2
            key={date}
            date={date}
            formatDateLabel={formatDateLabel}
            periods={periods}
            calculatePosition={calculatePosition}
          />
        );
      })}
    </motion.div>
  );
}

export function SleepTimelineChartPresentation({
  dates, sleepPeriodsByDate, formatDateLabel, calculatePosition,
}: SleepTimelineChartPresentationProps) {
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

      <SleepTimelineChartPresentation1
        dates={dates}
        sleepPeriodsByDate={sleepPeriodsByDate}
        formatDateLabel={formatDateLabel}
        calculatePosition={calculatePosition}
      />

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
