import { FeedingData } from '~app/family/domain/familyRecords';
import {
  FEEDING_TYPES,
  getFeedingTypeLabel,
} from '~app/littlesteps/domain/logHelpers';
import { FIELD } from './FIELD';
import { LABEL } from './LABEL';
import { LogEntryModalPresentation2Props } from './LogEntryModalPresentation2Props';

export function LogEntryModalPresentation2({
  feedingType, setFeedingType, isPumping,
}: LogEntryModalPresentation2Props) {
  return (
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
  );
}
