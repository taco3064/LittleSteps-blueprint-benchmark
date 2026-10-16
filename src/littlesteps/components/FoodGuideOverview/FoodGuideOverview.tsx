import { motion } from 'framer-motion';
import { getLucideIcon } from '~app/platform/components/LucideIcons';
import { listItem, stagger } from '~app/platform/components/Motion';
import {
  feedingMethods,
  feedingPrinciples,
  foodPrinciples,
  foodProgression,
  foodQA,
  startingSignals,
} from '~app/littlesteps/domain/complementaryFood';

/** 知識庫「開始使用指南」：原則、時機、餵食法、質地轉變與問答。 */
export default function FoodGuideOverview() {
  return (
    <div className="space-y-6">
      <FoodGuideOverviewSection1 />

      <FoodGuideOverviewSection2 />

      <FoodGuideOverviewSection3 />

      <FoodGuideOverviewSection4 />

      <FoodGuideOverviewSection5 />

      <FoodGuideOverviewSection6 />
    </div>
  );
}

function FoodGuideOverviewSection1() {
  return (
    <div>
      <h2 className="mb-3">副食品添加三大原則</h2>
      <motion.div
        className="space-y-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {foodPrinciples.map((principle) => {
          const IconComponent = getLucideIcon(principle.icon);

          return (
            <motion.div key={principle.id} variants={listItem} className="card">
              <div className="flex gap-3">
                {IconComponent && (
                  <IconComponent className="w-5 h-5 text-primary-dark shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="mb-1">{principle.title}</h3>
                  <p className="text-sm text-ink-muted">{principle.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function FoodGuideOverviewSection2() {
  return (
    <div>
      <h2 className="mb-3">開始副食品的時機</h2>
      <div className="card">
        <ul className="space-y-1.5 list-disc pl-5 marker:text-primary">
          {startingSignals.map((signal, idx) => (
            <li key={idx} className="text-sm text-ink">
              {signal}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FoodGuideOverviewSection3() {
  return (
    <div>
      <h2 className="mb-3">常見副食品餵食法</h2>
      <div className="space-y-2">
        {feedingMethods.map((method) => (
          <div key={method.id} className="card">
            <h3 className="mb-1">{method.name}</h3>
            <p className="text-sm text-ink-muted">{method.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodGuideOverviewSection4() {
  return (
    <div>
      <h2 className="mb-3">質地與頻率轉變</h2>
      <div className="space-y-3">
        {foodProgression.map((progression, idx) => (
          <div key={idx} className="card bg-butter-soft">
            <div className="flex items-start gap-3">
              <div
                className={
                  'w-12 h-12 rounded-xl bg-secondary-light flex items-center '
                  + 'justify-center flex-shrink-0 font-bold text-secondary-dark'
                }
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="mb-1">{progression.ageRange}</h3>
                <div className="text-sm text-ink-muted space-y-1">
                  <div>
                    <span className="font-medium">質地：</span>
                    {progression.texture}
                  </div>
                  <div>
                    <span className="font-medium">頻率：</span>
                    {progression.frequency}
                  </div>
                  <div>
                    <span className="font-medium">目的：</span>
                    {progression.purpose}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodGuideOverviewSection5() {
  return (
    <div>
      <h2 className="mb-3">副食品添加基本原則</h2>
      <div className="space-y-2">
        {feedingPrinciples.map((principle, idx) => (
          <div key={idx} className="card">
            <h3 className="mb-1">{principle.title}</h3>
            <p className="text-sm text-ink-muted">{principle.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodGuideOverviewSection6() {
  return (
    <div>
      <h2 className="mb-3">副食品常見問答</h2>
      <div className="space-y-3">
        {foodQA.map((qa, idx) => (
          <div key={idx} className="card bg-secondary-soft">
            <h3 className="mb-2">{qa.question}</h3>
            <p className="text-sm text-ink">{qa.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
