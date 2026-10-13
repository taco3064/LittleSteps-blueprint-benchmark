import { dateTimeLocalToISO, calculateDuration } from '~app/domain/dateHelpers';
import { FIELD, LABEL } from './formPresentation';
import type { LogForm } from './useLogForm';

import NightWakingFields from './NightWakingFields';

export default function SleepFields({ form }: { form: LogForm }) {
  const {
    startTime,
    endTime,
    setStartTime,
    setEndTime,
    hasSleepRange,
    sleepRangeError,
  } = form;

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
                  'bg-red-50 border border-red-200 rounded-xl p-3 '
                  + 'text-sm text-red-800'
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

      <NightWakingFields form={form} />
    </>
  );
}
