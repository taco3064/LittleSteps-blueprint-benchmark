import { FOOD_NAME_LIMIT } from '~app/domain/recordLimits';
import { FIELD, LABEL } from './formPresentation';
import type { FoodTrialForm } from './useFoodTrialForm';

export default function FoodDetailsFields({ form }: { form: FoodTrialForm }) {
  const {
    foodName,
    category,
    firstTriedDate,
    setFoodName,
    setCategory,
    setFirstTriedDate,
    today,
  } = form;

  return (
    <>
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
          // 上限就是規則的上限。超過它回來的是 PERMISSION_DENIED，表單只會照印
          // SDK 的原文，家長看不出該改什麼。備註與過敏反應說明同理。
          maxLength={FOOD_NAME_LIMIT}
          className={FIELD}
        />
      </div>

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

      <div>
        <label htmlFor="food-first-tried" className={LABEL}>
          首次嘗試日期
          {' '}
          <span className="text-red-600">*</span>
        </label>
        <input
          id="food-first-tried"
          type="date"
          value={firstTriedDate}
          onChange={(e) => setFirstTriedDate(e.target.value)}
          max={today}
          className={FIELD}
        />
      </div>
    </>
  );
}
