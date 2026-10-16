import { FOOD_NAME_LIMIT } from '~app/family/domain/recordLimits';
import { FIELD } from './FIELD';
import { FoodTrialModalPresentationProps } from './FoodTrialModalPresentationProps';
import { LABEL } from './LABEL';

export function FoodTrialModalPresentationSection1({
  foodName, setFoodName,
}: Pick<FoodTrialModalPresentationProps, 'foodName' | 'setFoodName'>) {
  return (
    <div>
      <label htmlFor="food-name" className={LABEL}>
        食物名稱
        {' '}
        <span className="text-red-600">*</span>
      </label>
      <input
        id="food-name"
        type="text"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
        placeholder="例如：高麗菜、香蕉、地瓜"
        maxLength={FOOD_NAME_LIMIT}
        className={FIELD}
      />
    </div>
  );
}
