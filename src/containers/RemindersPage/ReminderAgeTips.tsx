import { motion } from 'framer-motion';
import AgeBandPicker from '~app/components/AgeBandPicker';
import { tipCategoryLabels } from '~app/domain/monthlyTips';
import { listItem } from '~app/domain/motion';
import type {
  ToddlerTipCategory,
} from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */

import type { ReminderModel } from './useReminderModel';

const THEME = SERVICE_THEME.littleexplorer;

const CATEGORY_ORDER: ToddlerTipCategory[] = [
  'safety',
  'feeding',
  'behavior',
  'health',
];

export function ReminderAgeTips({ model }: { model: ReminderModel }) {
  const { band, setBand, bandTips } = model;

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
                    <span className="text-explorer-meadow-ink shrink-0">
                      ·
                    </span>
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
