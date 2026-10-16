import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { listItem, stagger } from '~app/platform/components/Motion';
import { type CrossWikiHit } from '~app/portal/domain/crossWikiSearch';
import type { ServiceTheme } from '../ServiceTheme';

interface CrossWikiResultsProps {
  hits: CrossWikiHit[];
  total: number;
  onSelect: (hit: CrossWikiHit) => void;
  theme: ServiceTheme;
}

/**
 * 其他階段的知識庫裡也有的答案。
 *
 * 排在自己的結果下面而不是混在一起：家長現在在的是這個階段，這一段是
 * 「順便告訴你別處也有」，不是搜尋結果的一部分。每一筆都標明來自哪個
 * 知識庫，點了就帶著同一個關鍵字跳過去。
 */
export default function CrossWikiResults({
  hits,
  total,
  onSelect,
  theme,
}: CrossWikiResultsProps) {
  if (hits.length === 0) {
    return null;
  }

  return (
    <div className="pt-2">
      <h3 className={`text-sm mb-1 ${theme.body}`}>其他階段也有相關文章</h3>
      <p className={`text-xs mb-3 ${theme.muted}`}>
        {total > hits.length
          ? `另外兩個知識庫共 ${total} 篇，先顯示 ${hits.length} 篇`
          : `另外兩個知識庫共 ${total} 篇`}
      </p>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {hits.map((hit) => (
          <motion.button
            key={`${hit.service}-${hit.id}`}
            type="button"
            variants={listItem}
            // 帶著關鍵字過去，落地後不必重打一次。交給 goTo 一次完成——
            // 自己先 pushState 再 goTo 的話，goTo 會判定「已經在這個路徑」
            // 而不發事件，於是網址變了畫面沒換。
            onClick={() => onSelect(hit)}
            className="card-tap w-full text-left"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className={`text-xs mb-0.5 ${theme.muted}`}>
                  {hit.sourceLabel}
                </p>
                <h4 className="mb-1">{hit.title}</h4>
                <p className="text-sm text-ink-muted line-clamp-2">
                  {hit.summary}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-ink-faint shrink-0 mt-1" />
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
