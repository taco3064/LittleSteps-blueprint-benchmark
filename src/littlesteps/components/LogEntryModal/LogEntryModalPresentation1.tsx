import {
  FEEDING_SIDES,
  getFeedingSideLabel,
} from '~app/littlesteps/domain/logHelpers';
import { FIELD } from './FIELD';
import { LABEL } from './LABEL';
import { LogEntryModalPresentation1Props } from './LogEntryModalPresentation1Props';
import { LogEntryModalPresentation2 } from './LogEntryModalPresentation2';

export function LogEntryModalPresentation1({
  timestamp, setTimestamp, feedingType, setFeedingType, isPumping, side, setSide,
  duration, setDuration, amount, setAmount,
}: LogEntryModalPresentation1Props) {
  return (
    <>
      <div>
        <label htmlFor="feeding-time" className={LABEL}>
          時間 *
        </label>
        <input
          id="feeding-time"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className={FIELD}
          required
        />
      </div>

      <LogEntryModalPresentation2
        feedingType={feedingType}
        setFeedingType={setFeedingType}
        isPumping={isPumping}
      />

      {isPumping && (
        <div>
          <label htmlFor="feeding-side" className={LABEL}>
            哪一邊
          </label>
          <select
            id="feeding-side"
            value={side}
            onChange={(e) => setSide(e.target.value as typeof side)}
            className={FIELD}
          >
            <option value="">不記錄</option>
            {FEEDING_SIDES.map((value) => (
              <option key={value} value={value}>
                {getFeedingSideLabel(value)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="feeding-duration" className={LABEL}>
          時長（分鐘）
        </label>
        <input
          id="feeding-duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={FIELD}
          placeholder="例如: 15"
          min="0"
        />
      </div>

      <div>
        <label htmlFor="feeding-amount" className={LABEL}>
          {isPumping ? '擠出量（ml）' : '奶量（ml）'}
        </label>
        <input
          id="feeding-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={FIELD}
          placeholder="例如: 120"
          min="0"
        />
      </div>
    </>
  );
}
