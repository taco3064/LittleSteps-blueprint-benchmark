import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { isCorrecting } from '~app/family/domain/correctedAge';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { calculateAgeDisplay } from '~app/family/domain/summaryCalculator';
import type {
  ResolvedCareTask,
  ToddlerAgeBand,
  ToddlerCareTip,
} from '~app/knowledge/domain/referenceModels';
import type { ScheduleStatus } from '~app/knowledge/domain/scheduleStatus';
import EmptyState from '~app/platform/components/EmptyState';
import { listItem, stagger, tap } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import CareHistory from '../CareHistory';
import type { ExplorerShellProps } from '../ExplorerShell';
import MonthlyCareTips from '../MonthlyCareTips';
const THEME = SERVICE_THEME.littleexplorer;
interface CareRemindersProps {
  ExplorerShell: React.ComponentType<ExplorerShellProps>;
  currentChild: ChildProfile | null | undefined;
  reminderBadge: number | undefined;
  outOfRange: JSX.Element | null;
  actionable: ResolvedCareTask[];
  sections: {
    status: ScheduleStatus;
    title: string;
    accent: string;
    rows: ResolvedCareTask[];
  }[];
  taskRow: (
    task: ResolvedCareTask,
    accent: string,
    beforeProfile?: boolean,
  ) => JSX.Element;
  missingHistory: ResolvedCareTask[];
  setHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  historyOpen: boolean;
  done: ResolvedCareTask[];
  onDownload: () => void;
  band: ToddlerAgeBand;
  setBand: React.Dispatch<React.SetStateAction<ToddlerAgeBand>>;
  bandTips: ToddlerCareTip[];
}

export default function CareReminders(props: CareRemindersProps) {
  return (
    <props.ExplorerShell
      active="reminders"
      childName={props.currentChild?.name}
      ageLabel={
        props.currentChild
          ? calculateAgeDisplay(props.currentChild.birthday)
          : undefined
      }
      reminderBadge={props.reminderBadge}
    >
      {props.outOfRange ?? (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* 這一頁的到期日全部依出生日期算，與生長曲線用的矯正年齡不同。
              早產兒的家長看得到兩套年齡，所以要說明哪一套用在哪裡——政府的
              健檢與疫苗時程沒有矯正年齡這回事。 */}
          {props.currentChild && isCorrecting(props.currentChild) && (
            <motion.p variants={listItem} className={`card text-sm ${THEME.muted}`}>
              健檢、疫苗與塗氟的到期日依實際出生日期計算，不因早產而延後。矯正年齡用在生長曲線與發展檢核。
            </motion.p>
          )}
          {props.actionable.length === 0
            ? (
                <motion.div variants={listItem}>
                  <EmptyState
                    theme={THEME}
                    title="目前沒有待辦"
                    description="接下來 90 天沒有到期的健檢、疫苗或塗氟。下一項到期時會自動出現在這裡。"
                  />
                </motion.div>
              )
            : (
                props.sections.map(({ status, title, accent, rows }) => (
                  <motion.section key={status} variants={listItem}>
                    <h2 className={`px-1 mb-2 ${THEME.body}`}>{title}</h2>
                    <ul className="space-y-3">
                      {rows.map((task) => props.taskRow(task, accent))}
                    </ul>
                  </motion.section>
                ))
              )}

          {props.missingHistory.length > 0 && (
            <CareHistory
              setHistoryOpen={props.setHistoryOpen}
              historyOpen={props.historyOpen}
              missingHistory={props.missingHistory}
              taskRow={props.taskRow}
            />
          )}

          {/* 已完成殿後，而且不算進 actionable：匯出與空狀態都只看還得動的項目。 */}
          {props.done.length > 0 && (
            <motion.section variants={listItem}>
              <h2 className={`px-1 mb-2 ${THEME.body}`}>
                已完成
                <span className={`ml-2 text-sm font-normal ${THEME.muted}`}>
                  {props.done.length}
                </span>
              </h2>
              <ul className="space-y-3">
                {props.done.map((task) => props.taskRow(task, ''))}
              </ul>
            </motion.section>
          )}

          {props.actionable.length > 0 && (
            <motion.button
              variants={listItem}
              type="button"
              whileTap={tap}
              onClick={props.onDownload}
              className="btn-secondary w-full text-explorer-bark"
            >
              <Download className="w-5 h-5" />
              匯出全部時程到行事曆
            </motion.button>
          )}

          <MonthlyCareTips
            band={props.band}
            setBand={props.setBand}
            bandTips={props.bandTips}
          />
        </motion.div>
      )}
    </props.ExplorerShell>
  );
}
