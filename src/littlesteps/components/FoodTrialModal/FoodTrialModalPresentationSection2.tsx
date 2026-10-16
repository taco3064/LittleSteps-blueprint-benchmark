import { FIELD } from './FIELD';
import { FoodTrialModalPresentationProps } from './FoodTrialModalPresentationProps';
import { LABEL } from './LABEL';

export function FoodTrialModalPresentationSection2({
  category, setCategory,
}: Pick<FoodTrialModalPresentationProps, 'category' | 'setCategory'>) {
  return (
    <div>
      <label htmlFor="food-category" className={LABEL}>
        食物分類
      </label>
      <select
        id="food-category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={FIELD}
      >
        <option value="">選擇分類（選填）</option>
        <option value="蔬菜">蔬菜</option>
        <option value="水果">水果</option>
        <option value="穀類">穀類</option>
        <option value="蛋白質">蛋白質</option>
        <option value="豆類">豆類</option>
        <option value="奶製品">奶製品</option>
        <option value="其他">其他</option>
      </select>
    </div>
  );
}
