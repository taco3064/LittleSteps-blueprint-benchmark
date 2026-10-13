import { motion } from 'framer-motion';
import { fadeInUp } from '~app/domain/motion';
import { outingChecklist } from '~app/domain/outingChecklist';

export function OutingChecklist() {
  return (
    <motion.div
      key="checklist"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <p className="text-sm text-ink-muted leading-relaxed">
        帶孩子出門白跑一趟，多半不是因為運氣差，而是其中一項沒先問。
        出門前花兩分鐘對一遍。
      </p>
      {outingChecklist.map((item) => (
        <div key={item.id} className="card">
          <h3 className="text-ink mb-1">{item.question}</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            {item.why}
          </p>
        </div>
      ))}
    </motion.div>
  );
}
