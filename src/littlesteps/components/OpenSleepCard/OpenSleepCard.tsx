import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { tap } from '~app/platform/components/Motion';
import { formatDate, formatDuration, formatTime } from '~app/platform/domain/calendar';
import { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import {
  STALE_OPEN_SLEEP_MINUTES,
  isStaleOpenSleep,
  openSleepElapsedMinutes,
} from '~app/littlesteps/domain/logHelpers';

interface OpenSleepCardProps {
  /** The sleep log that has no end time yet. */
  log: DailyLog;
  /** One-tap close: sets the end time to now. */
  onWake: (log: DailyLog) => void | Promise<void>;
  /** A session open too long needs its real end time, not a pretend wake at now. */
  onFixEndTime: (log: DailyLog) => void;
}

/** Recompute the elapsed time every half minute, so the reading is at most 30s stale. */
const TICK_MS = 30_000;

/**
 * The live card for a sleep that is still running.
 *
 * Starting one was always a single tap. Ending one meant finding the entry in
 * the timeline, opening it, driving a datetime picker and saving - five
 * interactions, all of them while a baby is crying. This card turns the close
 * back into one button, and puts "still asleep" where it can be seen without
 * opening anything.
 */
export default function OpenSleepCard({
  log, onWake, onFixEndTime,
}: OpenSleepCardProps) {
  const data = log.data as SleepData;
  const [now, setNow] = useState(() => new Date());
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), TICK_MS);

    return () => window.clearInterval(timer);
  }, []);

  const handleWake = async () => {
    setIsClosing(true);

    try {
      await onWake(log);
    } finally {
      setIsClosing(false);
    }
  };

  if (isStaleOpenSleep(log, now)) {
    return (
      <div className="card bg-butter-light">
        <p className="font-bold text-butter-dark">這段睡眠還沒有結束時間</p>
        <p className="mt-1 text-sm text-ink-muted">
          從
          {' '}
          {formatDate(data.startTime)}
          {' '}
          {formatTime(data.startTime)}
          {' '}
          開始，已經超過
          {' '}
          {STALE_OPEN_SLEEP_MINUTES / 60}
          {' '}
          小時。補上結束時間之前，它不會算進睡眠統計。
        </p>
        <button
          type="button"
          onClick={() => onFixEndTime(log)}
          className="btn-secondary w-full mt-3"
        >
          補上結束時間
        </button>
      </div>
    );
  }

  return (
    <div className="card flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-ink-muted">睡著了</p>
        <p className="text-2xl font-bold text-secondary-dark">
          {formatDuration(openSleepElapsedMinutes(data, now))}
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {formatTime(data.startTime)}
          {' '}
          開始
        </p>
      </div>

      <motion.button
        type="button"
        whileTap={tap}
        onClick={handleWake}
        disabled={isClosing}
        className="btn-primary shrink-0"
      >
        {isClosing ? '記錄中…' : '醒了'}
      </motion.button>
    </div>
  );
}
