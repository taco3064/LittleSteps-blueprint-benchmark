import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, History } from 'lucide-react';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import { collapse, listItem } from '~app/platform/components/Motion';
import { pressable } from '~app/platform/components/Pressable';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littleexplorer;
interface CareHistoryProps {
  setHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  historyOpen: boolean;
  missingHistory: ResolvedCareTask[];
  taskRow: (
    task: ResolvedCareTask,
    accent: string,
    beforeProfile?: boolean,
  ) => JSX.Element;
}

export default function CareHistory({
  setHistoryOpen,
  historyOpen,
  missingHistory,
  taskRow,
}: CareHistoryProps) {
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
                {' '}
                項
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
              {missingHistory.map((task) => taskRow(task, '', true))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
