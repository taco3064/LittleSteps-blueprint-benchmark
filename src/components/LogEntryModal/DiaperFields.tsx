import { DiaperData } from '~app/domain/records';
import {
  CONSISTENCIES, DIAPER_TYPES, getConsistencyLabel, getDiaperTypeLabel,
} from '~app/domain/logHelpers';
import { FIELD, LABEL } from './formPresentation';
import type { LogForm } from './useLogForm';

export default function DiaperFields({ form }: { form: LogForm }) {
  const {
    timestamp,
    diaperType,
    consistency,
    setTimestamp,
    setDiaperType,
    setConsistency,
  } = form;

  return (
    <>
      <div>
        <label htmlFor="diaper-time" className={LABEL}>
          時間 *
        </label>
        <input
          id="diaper-time"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className={FIELD}
          required
        />
      </div>

      <div>
        <label htmlFor="diaper-type" className={LABEL}>
          類型 *
        </label>
        <select
          id="diaper-type"
          value={diaperType}
          onChange={(e) => setDiaperType(e.target.value as DiaperData['type'])}
          className={FIELD}
          required
        >
          {DIAPER_TYPES.map((type) => (
            <option key={type} value={type}>
              {getDiaperTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {(diaperType === 'poop' || diaperType === 'both') && (
        <div>
          <label htmlFor="diaper-consistency" className={LABEL}>
            性狀
          </label>
          <select
            id="diaper-consistency"
            value={consistency}
            onChange={(e) =>
              setConsistency(e.target.value as DiaperData['consistency'])}
            className={FIELD}
          >
            {CONSISTENCIES.map((value) => (
              <option key={value} value={value}>
                {getConsistencyLabel(value)}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
