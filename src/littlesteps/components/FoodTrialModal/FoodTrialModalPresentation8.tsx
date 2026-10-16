import { FoodTrialModalPresentation8Props } from './FoodTrialModalPresentation8Props';
import { FoodTrialModalPresentation9 } from './FoodTrialModalPresentation9';
import { LABEL } from './LABEL';

export function FoodTrialModalPresentation8({
  trialDates, removeTrialDate, addTrialDate, today,
}: FoodTrialModalPresentation8Props) {
  return (
    <div>
      <div className={LABEL}>嘗試日期記錄（4x3 法則）</div>
      <FoodTrialModalPresentation9
        trialDates={trialDates}
        removeTrialDate={removeTrialDate}
        addTrialDate={addTrialDate}
        today={today}
      />
    </div>
  );
}
