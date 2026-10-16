import { FoodTrialModalPresentation2Props } from './FoodTrialModalPresentation2Props';

export function FoodTrialModalPresentation2({
  hasAllergy, setHasAllergy,
}: FoodTrialModalPresentation2Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={hasAllergy}
      aria-label="有過敏反應"
      onClick={() => setHasAllergy(!hasAllergy)}
      className="h-tap flex items-center shrink-0"
    >
      <span
        className={`w-12 h-6 rounded-full flex items-center transition-colors ${
          hasAllergy ? 'bg-red-600' : 'bg-ink/25'
        }`}
      >
        <span
          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            hasAllergy ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
