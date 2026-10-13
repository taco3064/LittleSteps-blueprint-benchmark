import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { stagger, listItem, collapse } from '~app/domain/motion';
import { pressable } from '~app/domain/pressable';
import { foodStages } from '~app/domain/complementaryFood';

interface FoodGuideStagesProps {
  /** 展開中的階段；null 表示全部收合。狀態留在頁面層，換檢視再回來才記得。 */
  expandedStage: number | null;
  onToggleStage: (level: number | null) => void;
}

/** 知識庫「發展階段」：三階段的奶量與副食品比例，可逐段展開。 */
export default function FoodGuideStages({
  expandedStage,
  onToggleStage,
}: FoodGuideStagesProps) {
  return (
    <div>
      <h2 className="mb-3">副食品與奶量轉換三階段</h2>
      <motion.div
        className="space-y-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {foodStages.map((stage) => {
          const isExpanded = expandedStage === stage.level;

          return (
            <motion.div
              key={stage.level}
              layout
              variants={listItem}
              className="card-tap"
              {...pressable(
                () => onToggleStage(isExpanded ? null : stage.level),
                isExpanded,
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={
                    'w-16 h-16 rounded-full bg-primary-light flex '
                    + 'flex-col items-center justify-center '
                    + 'text-primary-dark font-bold flex-shrink-0'
                  }
                >
                  <div className="text-xs">Level</div>
                  <div className="text-2xl leading-none">{stage.level}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3>{stage.name}</h3>
                      <p className="text-sm text-ink-muted">{stage.ageRange}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-ink-faint" />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div className="bg-secondary-light px-2 py-1 rounded">
                      <span className="text-secondary-dark">奶：</span>
                      <span className="font-medium text-secondary-dark">
                        {stage.milkRatio}
                      </span>
                    </div>
                    <div className="bg-mint-light px-2 py-1 rounded">
                      <span className="text-mint-dark">副食品：</span>
                      <span className="font-medium text-mint-dark">
                        {stage.foodRatio}
                      </span>
                    </div>
                  </div>

                  {/* 兩段文字在 390px 上並排會擠成兩欄，所以直接分行 */}
                  <div className="text-sm text-ink-muted space-y-0.5">
                    <div>{stage.mealsPerDay}</div>
                    <div>{stage.texture}</div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div {...collapse} className="overflow-hidden">
                        <StageDetails stage={stage} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function StageDetails({ stage }: { stage: (typeof foodStages)[number] }) {
  return (
    <div className="mt-3 pt-3 border-t border-ink/10 space-y-3">
      <div>
        <h4 className="mb-2">重點提示</h4>
        <ul className="space-y-1 list-disc pl-5 marker:text-primary">
          {stage.keyPoints.map((point, idx) => (
            <li key={idx} className="text-sm text-ink-muted">
              {point}
            </li>
          ))}
        </ul>
      </div>

      {stage.warnings && stage.warnings.length > 0 && (
        <div className="bg-primary-light rounded-xl p-3">
          <h4 className="text-primary-dark mb-2">特別注意</h4>
          <ul className="space-y-1 list-disc pl-5 marker:text-primary-dark">
            {stage.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-ink">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
