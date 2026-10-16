import { formatDate } from '~app/platform/domain/calendar';
import { FoodTrialModalPresentation5Props } from './FoodTrialModalPresentation5Props';

export function FoodTrialModalPresentation5({
  reaction,
}: FoodTrialModalPresentation5Props) {
  return (
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
  );
}
