import { FeedingData } from '~app/domain/records';
import { FEEDING_TYPES, getFeedingTypeLabel } from '~app/domain/logHelpers';
import { FIELD, LABEL } from './formPresentation';
import type { LogForm } from './useLogForm';

import FeedingQuantityFields from './FeedingQuantityFields';

export default function FeedingFields({ form }: { form: LogForm }) {
  const { timestamp, feedingType, setTimestamp, setFeedingType, isPumping } = form;

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

      <div>
        <label htmlFor="feeding-type" className={LABEL}>
          類型 *
        </label>
        <select
          id="feeding-type"
          value={feedingType}
          onChange={(e) =>
            setFeedingType(e.target.value as FeedingData['feedingType'])}
          className={FIELD}
          required
        >
          {FEEDING_TYPES.map((type) => (
            <option key={type} value={type}>
              {getFeedingTypeLabel(type)}
            </option>
          ))}
        </select>
        {isPumping && (
          <p className="mt-1 text-xs text-ink-faint">
            擠出來的量記在這裡，不會算進寶寶今天喝了多少
          </p>
        )}
      </div>
      <FeedingQuantityFields form={form} />
    </>
  );
}
