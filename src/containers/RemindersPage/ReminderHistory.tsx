import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  History,
} from 'lucide-react';
import { collapse, listItem } from '~app/domain/motion';
import { pressable } from '~app/domain/pressable';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */

import { ReminderTaskRow } from './ReminderTaskRow';
import type { ReminderModel } from './useReminderModel';

const THEME = SERVICE_THEME.littleexplorer;

export function ReminderHistory({ model }: { model: ReminderModel }) {
  const { historyOpen, setHistoryOpen, missingHistory } = model;

  return (
    <motion.section variants={listItem}>
      <div
        className="card-tap"
        {...pressable(() => setHistoryOpen((open) => !open), historyOpen)}
      >
        <div className="flex items-start gap-3">
          <History className={`w-5 h-5 mt-0.5 shrink-0 ${THEME.muted}`} />
          <div className="flex-1 min-w-0">
            <h2 className={THEME.body}>
              開始使用前就到期的項目
              <span className={`ml-2 text-sm font-normal ${THEME.muted}`}>
                {missingHistory.length}
                {' 項'}
              </span>
            </h2>
            <p className={`text-sm mt-1 leading-relaxed ${THEME.muted}`}>
              這些項目在你開始使用之前就到期了，app
              沒有那段紀錄，不代表沒做。手邊有兒童健康手冊的話可以照著補登；不補也不會影響之後的提醒。
            </p>
          </div>
          <motion.div
            animate={{ rotate: historyOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className={`w-5 h-5 shrink-0 ${THEME.muted}`} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {historyOpen && (
          <motion.div {...collapse} className="overflow-hidden">
            <ul className="space-y-3 pt-3">
              {missingHistory.map((task) => (
                <ReminderTaskRow
                  key={task.template.id}
                  model={model}
                  task={task}
                  accent=""
                  beforeProfile
                />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
