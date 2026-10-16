import { motion } from 'framer-motion';
import type {
  ToddlerAgeBand,
  ToddlerCareTip,
  ToddlerTipCategory,
} from '~app/knowledge/domain/referenceModels';
import { tipCategoryLabels } from '~app/littleexplorer/domain/monthlyTips';
import { listItem } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import AgeBandPicker from '../AgeBandPicker';
const THEME = SERVICE_THEME.littleexplorer;

const CATEGORY_ORDER: ToddlerTipCategory[] = [
  'safety',
  'feeding',
  'behavior',
  'health',
];

interface MonthlyCareTipsProps {
  band: ToddlerAgeBand;
  setBand: React.Dispatch<React.SetStateAction<ToddlerAgeBand>>;
  bandTips: ToddlerCareTip[];
}

export default function MonthlyCareTips({
  band,
  setBand,
  bandTips,
}: MonthlyCareTipsProps) {
  return (
    <motion.section variants={listItem} className="pt-2">
      <h2 className={`px-1 mb-2 ${THEME.body}`}>這個月齡的注意事項</h2>
      <div className="mb-3">
        <AgeBandPicker selected={band} onSelect={setBand} />
      </div>

      <div className="space-y-3">
        {CATEGORY_ORDER.map((category) => {
          const tip = bandTips.find((t) => t.category === category);

          if (!tip) {
            return null;
          }

          return (
            <article key={category} className="panel">
              <span className={`text-xs font-medium ${THEME.muted}`}>
                {tipCategoryLabels[category]}
              </span>
              <h3 className={`mt-1 mb-2 ${THEME.body}`}>{tip.title}</h3>
              <ul className="space-y-1.5">
                {tip.highlights.map((line) => (
                  <li
                    key={line}
                    className={`text-sm flex gap-2 leading-relaxed ${THEME.body}`}
                  >
                    <span className="text-explorer-meadow-ink shrink-0">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </motion.section>
  );
}
