import { Plus } from 'lucide-react';
import { LABEL, ERROR_BOX } from './formPresentation';
import type { FoodTrialForm } from './useFoodTrialForm';

import AllergyReactionList from './AllergyReactionList';
import AllergyReactionFields from './AllergyReactionFields';

export default function FoodAllergyFields({ form }: { form: FoodTrialForm }) {
  const { hasAllergy, reactionError, setHasAllergy, addAllergyReaction } = form;

  return (
    <>
      {/* Has Allergy Toggle */}
      <div className="card bg-warm-white flex items-center justify-between">
        <span className="font-medium">有過敏反應</span>
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
      </div>

      {/* Allergy Reactions */}
      {hasAllergy && (
        <div className="space-y-3">
          <div className={LABEL}>過敏反應記錄</div>

          <AllergyReactionList form={form} />
          {/* Add New Reaction */}
          <div className="card bg-butter-soft border border-butter/40">
            <div className="text-sm font-medium mb-3">新增過敏反應</div>

            <div className="space-y-3">
              <AllergyReactionFields form={form} />
              {reactionError && (
                <p role="alert" className={ERROR_BOX}>
                  {reactionError}
                </p>
              )}

              <button
                type="button"
                onClick={addAllergyReaction}
                className="btn-secondary w-full"
              >
                <Plus className="w-4 h-4" />
                新增反應記錄
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
