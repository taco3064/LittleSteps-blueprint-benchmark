import { motion } from 'framer-motion';
import { stagger, listItem } from '~app/domain/motion';
import {
  monthlyFoodMenus,
  vegetableAllergyLevels,
  fruitAllergyLevels,
  fingerFoodGuidelines,
} from '~app/domain/complementaryFood';

const ALLERGY_LEVEL_COLOR: Record<string, string> = {
  low: 'bg-mint-light text-mint-dark',
  medium: 'bg-butter-light text-butter-dark',
  high: 'bg-primary-light text-primary-dark',
};

const ALLERGY_LEVEL_LABEL: Record<string, string> = {
  low: '低敏',
  medium: '中敏',
  high: '高敏',
};

/** 過敏等級清單在蔬菜與水果兩段的呈現完全一樣，只有資料不同。 */
function AllergyLevelList({
  title,
  levels,
}: {
  title: string;
  levels: { level: string; ageRange: string; foods: string[] }[];
}) {
  return (
    <div>
      <h2 className="mb-3">{title}</h2>
      <div className="space-y-3">
        {levels.map((level) => (
          <div key={level.level} className="card">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  ALLERGY_LEVEL_COLOR[level.level] ?? 'bg-ink/5 text-ink-muted'
                }`}
              >
                {ALLERGY_LEVEL_LABEL[level.level] ?? level.level}
              </span>
              <span className="text-sm text-ink-muted">{level.ageRange}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {level.foods.map((food, idx) => (
                <span key={idx} className="text-sm text-ink bg-ink/5 px-2 py-1 rounded">
                  {food}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 知識庫「菜單建議」：月份推薦、蔬果過敏等級與手指食物。 */
export default function FoodGuideMenu() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3">試敏菜單與月份推薦</h2>
        <motion.div
          className="space-y-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {monthlyFoodMenus.map((menu, idx) => (
            <motion.div key={idx} variants={listItem} className="card">
              <h3>{menu.month}</h3>
              <p className="text-sm text-ink-muted mb-2">
                重點：
                {menu.focus}
              </p>
              <div className="flex flex-wrap gap-2">
                {menu.foods.map((food, foodIdx) => (
                  <span
                    key={foodIdx}
                    className={
                      'px-2 py-1 bg-secondary-light text-secondary-dark '
                      + 'rounded-lg text-sm font-medium'
                    }
                  >
                    {food}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AllergyLevelList title="蔬菜類過敏等級" levels={vegetableAllergyLevels} />
      <AllergyLevelList title="水果類過敏等級" levels={fruitAllergyLevels} />

      <div>
        <h2 className="mb-3">手指食物推薦（7-8個月起）</h2>
        <div className="space-y-2">
          {fingerFoodGuidelines.map((guideline) => (
            <div key={guideline.category} className="card">
              <h3 className="mb-2">{guideline.category}</h3>
              <div className="flex flex-wrap gap-2">
                {guideline.examples.map((example, idx) => (
                  <span
                    key={idx}
                    className="text-sm text-ink bg-butter-light px-2 py-1 rounded"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
