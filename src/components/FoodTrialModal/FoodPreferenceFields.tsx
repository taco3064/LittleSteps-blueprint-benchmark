import type { FoodPreference } from '~app/domain/records';
import { LABEL } from './formPresentation';
import type { FoodTrialForm } from './useFoodTrialForm';

const PREFERENCES: { value: FoodPreference; label: string }[] = [
  { value: 'love', label: '超愛' },
  { value: 'like', label: '喜歡' },
  { value: 'neutral', label: '普通' },
  { value: 'dislike', label: '不喜歡' },
  { value: 'refuse', label: '拒絕' },
];

export default function FoodPreferenceFields({ form }: { form: FoodTrialForm }) {
  const { preference, setPreference } = form;

  return (
    <>
      {/*
                This was a row of five emoji faces. The preference itself is a real
                choice, so the glyphs became labels — and chips wrap instead of
                squeezing five cells into a 360px row.
              */}
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
    </>
  );
}
