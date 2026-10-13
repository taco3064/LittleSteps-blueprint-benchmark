import { FEEDING_SIDES, getFeedingSideLabel } from '~app/domain/logHelpers';
import { FIELD, LABEL } from './formPresentation';
import type { LogForm } from './useLogForm';

export default function FeedingQuantityFields({ form }: { form: LogForm }) {
  const { duration, amount, side, setDuration, setAmount, setSide, isPumping }
    = form;

  return (
    <>
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
