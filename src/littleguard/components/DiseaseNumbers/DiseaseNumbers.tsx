import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { formatRate } from '~app/littleguard/domain/radar';
import type { RadarCell } from '~app/littleguard/domain/radarModels';
import { collapse } from '~app/platform/components/Motion';

export function DiseaseNumbers({
  cell,
  national,
}: {
  cell: RadarCell;
  national: number | null;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setDetailsOpen(!detailsOpen)}
        aria-expanded={detailsOpen}
        aria-controls={detailsId}
        className={
          'w-full min-h-tap flex items-center justify-between gap-'
          + '2 text-left text-sm text-ink-muted'
        }
      >
        詳細數字
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-ink-faint transition-transform ${
            detailsOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {detailsOpen && (
          <motion.div {...collapse} id={detailsId} className="overflow-hidden">
            <div className="space-y-3 pt-1">
              <dl className="text-sm text-ink-muted space-y-1">
                <div className="flex justify-between gap-3">
                  <dt>這一週</dt>
                  <dd className="tabular-nums">
                    {formatRate(cell.rate)}
                    （
                    {cell.visits}
                    {' '}
                    人次）
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>前 8 週中位數</dt>
                  <dd className="tabular-nums">{formatRate(cell.trendBase)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>全國同一週</dt>
                  <dd className="tabular-nums">{formatRate(national)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>統計基數</dt>
                  <dd className="tabular-nums">
                    {cell.denom.toLocaleString('zh-TW')}
                    {' '}
                    次門診
                  </dd>
                </div>
              </dl>

              {/* 「/萬」與「統計基數」都是統計用詞，不解釋的話上面那四行等於沒給。 */}
              <p className="text-sm text-ink-faint">
                「/萬」是每一萬次健保門診裡有幾次是這個病，統計基數就是那一週的門診總次數。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
