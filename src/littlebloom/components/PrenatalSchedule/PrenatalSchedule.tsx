import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, History } from 'lucide-react';
import { formatDate } from '~app/platform/domain/calendar';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import type {
  PrenatalItemStatus,
  ResolvedPrenatalItem,
} from '~app/littlebloom/domain/prenatalSchedule';
import { collapse, listItem, stagger } from '~app/platform/components/Motion';
import { pressable } from '~app/platform/components/Pressable';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import type { BloomShellProps } from '../BloomShell';
const THEME = SERVICE_THEME.littlebloom;

const SECTIONS: { status: PrenatalItemStatus; title: string }[] = [
  { status: 'overdue', title: '已過建議週數' },
  { status: 'due', title: '現在可以做' },
  { status: 'upcoming', title: '接下來' },
];

const DONE_SECTION: { status: PrenatalItemStatus; title: string } = {
  status: 'done',
  title: '已完成',
};

interface PrenatalScheduleProps {
  BloomShell: React.ComponentType<BloomShellProps>;
  weeks: number;
  currentChild: ChildProfile | null | undefined;
  renderSection: ({
    status,
    title,
  }: {
    status: PrenatalItemStatus;
    title: string;
  }) => JSX.Element | null;
  missingHistory: ResolvedPrenatalItem[];
  setHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  historyOpen: boolean;
  itemRow: (item: ResolvedPrenatalItem, beforeProfile?: boolean) => JSX.Element;
}

export default function PrenatalSchedule(props: PrenatalScheduleProps) {
  return (
    <props.BloomShell
      title="產檢時程"
      subtitle={`第 ${props.weeks + 1} 週 · 預產期 ${formatDate(props.currentChild?.pregnancyData?.dueDate)}`}
      backTo="littlebloom"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {SECTIONS.map(props.renderSection)}

        {props.missingHistory.length > 0 && (
          <motion.section variants={listItem}>
            <div
              className="card-tap"
              {...pressable(
                () => props.setHistoryOpen((open) => !open),
                props.historyOpen,
              )}
            >
              <div className="flex items-start gap-3">
                <History className={`w-5 h-5 mt-0.5 shrink-0 ${THEME.muted}`} />
                <div className="flex-1 min-w-0">
                  <h2 className={THEME.body}>
                    開始使用前就到期的項目
                    <span className={`ml-2 text-sm font-normal ${THEME.muted}`}>
                      {props.missingHistory.length}
                      {' '}
                      項
                    </span>
                  </h2>
                  <p className={`text-sm mt-1 leading-relaxed ${THEME.muted}`}>
                    這些項目在你開始使用之前就到期了，app
                    沒有那段紀錄，不代表沒做。手邊有孕婦健康手冊的話可以照著補登；不補也不會影響之後的提醒。
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: props.historyOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={`w-5 h-5 shrink-0 ${THEME.muted}`} />
                </motion.div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {props.historyOpen && (
                <motion.div {...collapse} className="overflow-hidden">
                  <ul className="space-y-3 pt-3">
                    {props.missingHistory.map((item) => props.itemRow(item, true))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {props.renderSection(DONE_SECTION)}

        <p className={`text-xs leading-relaxed px-1 ${THEME.muted}`}>
          週數依末次月經第一天推算，實際時程請以產檢醫師安排為準。標示為自費的項目不在公費補助範圍內。
        </p>
      </motion.div>
    </props.BloomShell>
  );
}
