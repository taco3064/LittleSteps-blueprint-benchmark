import { calculateDuration, dateTimeLocalToISO } from '~app/platform/domain/calendar';
import { FIELD } from './FIELD';
import { LABEL } from './LABEL';
import { LogEntryModalPresentation3Props } from './LogEntryModalPresentation3Props';
import { LogEntryModalPresentation4 } from './LogEntryModalPresentation4';

export function LogEntryModalPresentation3({
  startTime, setStartTime, endTime, setEndTime, hasSleepRange, sleepRangeError,
  stepNightWakings, nightWakings, setNightWakings,
}: LogEntryModalPresentation3Props) {
  return (
    <>
      <div>
        <label htmlFor="sleep-start" className={LABEL}>
          開始時間 *
        </label>
        <input
          id="sleep-start"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={FIELD}
          required
        />
      </div>

      <div>
        <label htmlFor="sleep-end" className={LABEL}>
          結束時間
        </label>
        <input
          id="sleep-end"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className={FIELD}
        />
        <p className="mt-1 text-xs text-ink-faint">不填表示還在睡</p>
      </div>

      {hasSleepRange
        && (sleepRangeError
          ? (
              <p
                role="alert"
                className={
                  'bg-red-50 border border-red-200 rounded-xl p-3 text-sm '
                  + 'text-red-800'
                }
              >
                {sleepRangeError}
              </p>
            )
          : (
              <div className="bg-secondary-light rounded-xl p-3">
                <p className="text-sm text-secondary-dark">
                  時長：
                  {calculateDuration(
                    dateTimeLocalToISO(startTime),
                    dateTimeLocalToISO(endTime),
                  )}
                  {' '}
                  分鐘
                </p>
              </div>
            ))}

      {/*
                    夜醒次數問在這裡，因為關掉一段睡眠就是想起這件事的那一刻。
                    在這之前，週報有一張夜醒趨勢卡，但全 app 沒有任何地方寫得進
                    這個欄位——那張卡永遠說「持平」。
                  */}
      <LogEntryModalPresentation4
        stepNightWakings={stepNightWakings}
        nightWakings={nightWakings}
        setNightWakings={setNightWakings}
      />
    </>
  );
}
