import type { AllergyReactionType, AllergySeverity } from '~app/domain/records';
import { ALLERGY_DESCRIPTION_LIMIT } from '~app/domain/recordLimits';
import { FIELD, LABEL } from './formPresentation';
import type { FoodTrialForm } from './useFoodTrialForm';

export default function AllergyReactionFields({ form }: { form: FoodTrialForm }) {
  const {
    newReactionType,
    newReactionSeverity,
    newReactionDescription,
    newReactionDate,
    setNewReactionType,
    setNewReactionSeverity,
    setNewReactionDescription,
    setNewReactionDate,
    today,
  } = form;

  return (
    <>
      <div>
        <label htmlFor="reaction-type" className={LABEL}>
          反應類型
        </label>
        <select
          id="reaction-type"
          value={newReactionType}
          onChange={(e) => setNewReactionType(e.target.value as AllergyReactionType)}
          className={FIELD}
        >
          <option value="rash">紅疹</option>
          <option value="diarrhea">腹瀉</option>
          <option value="vomiting">嘔吐</option>
          <option value="constipation">便秘</option>
          <option value="runny_nose">流鼻涕</option>
          <option value="cough">咳嗽</option>
          <option value="eczema">濕疹</option>
          <option value="other">其他</option>
        </select>
      </div>

      <div>
        <label htmlFor="reaction-severity" className={LABEL}>
          嚴重程度
        </label>
        <select
          id="reaction-severity"
          value={newReactionSeverity}
          onChange={(e) => setNewReactionSeverity(e.target.value as AllergySeverity)}
          className={FIELD}
        >
          <option value="mild">輕微</option>
          <option value="moderate">中度</option>
          <option value="severe">嚴重</option>
        </select>
      </div>

      <div>
        <label htmlFor="reaction-date" className={LABEL}>
          發生日期
        </label>
        <input
          id="reaction-date"
          type="date"
          value={newReactionDate}
          onChange={(e) => setNewReactionDate(e.target.value)}
          max={today}
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="reaction-description" className={LABEL}>
          補充說明
        </label>
        <textarea
          id="reaction-description"
          value={newReactionDescription}
          onChange={(e) => setNewReactionDescription(e.target.value)}
          placeholder="選填"
          rows={2}
          maxLength={ALLERGY_DESCRIPTION_LIMIT}
          className={`${FIELD} resize-none`}
        />
      </div>
    </>
  );
}
