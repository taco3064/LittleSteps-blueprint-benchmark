import { FIELD } from './FIELD';
import { FoodTrialModalPresentationProps } from './FoodTrialModalPresentationProps';
import { LABEL } from './LABEL';

export function FoodTrialModalPresentationSection3({
  firstTriedDate, setFirstTriedDate, today,
}: Pick<
  FoodTrialModalPresentationProps,
  'firstTriedDate' | 'setFirstTriedDate' | 'today'
>) {
  return (
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
  );
}
