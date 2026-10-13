import { X } from 'lucide-react';
import { formatDate } from '~app/domain/dateHelpers';
import type { FoodTrialForm } from './useFoodTrialForm';

export default function AllergyReactionList({ form }: { form: FoodTrialForm }) {
  const { allergyReactions, removeAllergyReaction } = form;

  return (
    <>
      {allergyReactions.map((reaction, index) => (
        <div key={index} className="card bg-red-50 border border-red-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-medium text-red-900 mb-1">
                {reaction.type === 'rash'
                  ? '紅疹'
                  : reaction.type === 'diarrhea'
                    ? '腹瀉'
                    : reaction.type === 'vomiting'
                      ? '嘔吐'
                      : reaction.type === 'constipation'
                        ? '便秘'
                        : reaction.type === 'runny_nose'
                          ? '流鼻涕'
                          : reaction.type === 'cough'
                            ? '咳嗽'
                            : reaction.type === 'eczema'
                              ? '濕疹'
                              : '其他'}
                {' - '}
                {reaction.severity === 'mild'
                  ? '輕微'
                  : reaction.severity === 'moderate'
                    ? '中度'
                    : '嚴重'}
              </div>
              <div className="text-sm text-red-700">{formatDate(reaction.date)}</div>
              {reaction.description && (
                <p className="text-sm text-red-800 mt-1">{reaction.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeAllergyReaction(index)}
              className="btn-icon -my-2.5 text-red-600 hover:bg-red-100"
              aria-label="移除這筆過敏反應"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
