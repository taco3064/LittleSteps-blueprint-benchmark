import { motion } from 'framer-motion';

import { CheckCircle2, XCircle } from 'lucide-react';

import { getLucideIcon } from '~app/platform/components/LucideIcons';

import { listItem, stagger } from '~app/platform/components/Motion';

import {
  cookingTips,
  foodHandlingTips,
  foodWarnings,
  infantFoodRestrictions,
} from '~app/littlesteps/domain/complementaryFood';
interface FoodGuideSafetyPresentation7Props {
  category: import('~app/knowledge/domain/referenceModels').FoodHandlingCategory;
}

interface FoodGuideSafetyPresentation6Props {
  idx: number;
  category: import('~app/knowledge/domain/referenceModels').FoodHandlingCategory;
}

const SEVERITY_COLOR: Record<string, string> = {
  danger: 'bg-primary-light text-primary-dark',
  warning: 'bg-butter-light text-butter-dark',
  info: 'bg-secondary-light text-secondary-dark',
};

export function FoodGuideSafetyPresentation2() {
  return (
    <motion.div
      className="space-y-3"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {foodWarnings.map((warning) => {
        const IconComponent = getLucideIcon(warning.icon);

        return (
          <motion.div
            key={warning.id}
            variants={listItem}
            className={`card ${SEVERITY_COLOR[warning.severity] ?? 'bg-ink/5 text-ink'}`}
          >
            <div className="flex gap-3">
              {IconComponent && (
                <IconComponent className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="mb-1">{warning.title}</h3>
                <p className="text-sm">{warning.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function FoodGuideSafetyPresentation1() {
  return (
    <div>
      <h2 className="mb-3">專業提醒與禁忌</h2>
      <FoodGuideSafetyPresentation2 />
    </div>
  );
}

export function FoodGuideSafetyPresentation3() {
  return (
    <div>
      <h2 className="mb-3">嬰幼兒飲食禁忌</h2>
      <div className="space-y-4">
        {infantFoodRestrictions.map((category, idx) => (
          <div key={idx}>
            <h3 className="mb-2">{category.category}</h3>
            <div className="space-y-2">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className="card bg-primary-soft">
                  <h4 className="text-primary-dark">{item.food}</h4>
                  <p className="text-sm text-ink mt-1">
                    <span className="font-medium">{item.ageLimit}</span>
                    {' '}
                    -
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FoodGuideSafetyPresentation7({
  category,
}: FoodGuideSafetyPresentation7Props) {
  return (
    <div className="space-y-2">
      {category.items.map((item, itemIdx) => (
        <div
          key={itemIdx}
          className={`card ${item.canEat ? 'bg-mint-soft' : 'bg-primary-soft'}`}
        >
          <div className="flex items-start gap-2">
            {/* 能吃／不能吃只靠這個符號區分 */}
            {item.canEat
              ? (
                  <CheckCircle2 className="w-4 h-4 text-mint-dark flex-shrink-0 mt-1" />
                )
              : (
                  <XCircle className="w-4 h-4 text-primary-dark flex-shrink-0 mt-1" />
                )}
            <div className="flex-1">
              <h4>{item.food}</h4>
              <p className="text-sm text-ink mt-1">{item.note}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FoodGuideSafetyPresentation6({
  idx, category,
}: FoodGuideSafetyPresentation6Props) {
  return (
    <div key={idx}>
      <h3 className="mb-2">{category.category}</h3>
      <FoodGuideSafetyPresentation7 category={category} />
    </div>
  );
}

export function FoodGuideSafetyPresentation5() {
  return (
    <div className="space-y-4">
      {foodHandlingTips.map((category, idx) => (
        <FoodGuideSafetyPresentation6 key={idx} idx={idx} category={category} />
      ))}
    </div>
  );
}

export function FoodGuideSafetyPresentation4() {
  return (
    <div>
      <h2 className="mb-3">食材特殊處理</h2>
      <FoodGuideSafetyPresentation5 />
    </div>
  );
}

export function FoodGuideSafetyPresentation() {
  return (
    <div className="space-y-6">
      <FoodGuideSafetyPresentation1 />

      <FoodGuideSafetyPresentation3 />

      <div>
        <h2 className="mb-3">烹調與保存技巧</h2>
        <div className="space-y-4">
          {cookingTips.map((category, idx) => (
            <div key={idx}>
              <h3 className="mb-2">{category.category}</h3>
              <div className="space-y-2">
                {category.tips.map((tip, tipIdx) => (
                  <div key={tipIdx} className="card bg-butter-soft">
                    <h4 className="mb-1">{tip.title}</h4>
                    <p className="text-sm text-ink">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FoodGuideSafetyPresentation4 />
    </div>
  );
}
