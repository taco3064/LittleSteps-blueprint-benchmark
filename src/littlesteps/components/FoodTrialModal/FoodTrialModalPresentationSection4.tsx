import { FoodTrialModalPresentationProps } from './FoodTrialModalPresentationProps';
import { LABEL } from './LABEL';
import { PREFERENCES } from './PREFERENCES';

export function FoodTrialModalPresentationSection4({
  preference, setPreference,
}: Pick<FoodTrialModalPresentationProps, 'preference' | 'setPreference'>) {
  return (
    <div>
      <div id="food-preference-label" className={LABEL}>
        寶寶喜好度
      </div>
      <div
        role="group"
        aria-labelledby="food-preference-label"
        className="flex flex-wrap gap-2"
      >
        {PREFERENCES.map((pref) => (
          <button
            key={pref.value}
            type="button"
            aria-pressed={preference === pref.value}
            onClick={() => setPreference(pref.value)}
            className={`chip ${preference === pref.value ? 'chip-on' : ''}`}
          >
            {pref.label}
          </button>
        ))}
      </div>
    </div>
  );
}
