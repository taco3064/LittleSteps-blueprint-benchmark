import { motion } from 'framer-motion';
import { listItem } from '~app/domain/motion';

export default function VisitNotes({
  notes,
  setNotes,
}: {
  notes: string;
  setNotes: (notes: string) => void;
}) {
  return (
    <motion.section variants={listItem} className="panel mb-4">
      <h2>特殊事項</h2>
      {/* 這一欄不存進資料庫，所以要講清楚它只活到分享出去為止——否則
              家長會以為打完就記下來了，下次回診打開卻是空的。 */}
      <p className="text-sm text-ink-muted mt-1">
        只用於這次看診，不會儲存；按下方按鈕分享時會一起帶出去。
      </p>

      <textarea
        className={
          'w-full mt-4 p-4 rounded-xl border border-ink/10 '
          + 'bg-warm-white text-base text-ink placeholder-ink-faint '
          + 'resize-none'
        }
        rows={4}
        placeholder="可在此記錄要告知醫師的事項..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </motion.section>
  );
}
