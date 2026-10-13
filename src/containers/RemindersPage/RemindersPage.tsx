import { motion } from 'framer-motion';
import {
  Download,
} from 'lucide-react';
import EmptyState from '~app/components/EmptyState';
import ExplorerShell from '../ExplorerShell';
import { isCorrecting } from '~app/domain/correctedAge';
import { downloadIcs } from '~app/domain/icsExport';
import { listItem, stagger, tap } from '~app/domain/motion';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { calculateAgeDisplay } from '~app/domain/summaryCalculator';

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */

import { ReminderAgeTips } from './ReminderAgeTips';
import { ReminderCompleted } from './ReminderCompleted';
import { reminderEligibility } from './ReminderEligibility';
import { ReminderHistory } from './ReminderHistory';
import { ReminderTaskRow } from './ReminderTaskRow';
import { useReminderModel, type RemindersPageProps } from './useReminderModel';

const THEME = SERVICE_THEME.littleexplorer;

export default function RemindersPage(props: RemindersPageProps) {
  const model = useReminderModel(props);

  const {
    currentChild,
    reminderBadge,
    done,
    missingHistory,
    sections,
    actionable,
  } = model;

  return (
    <ExplorerShell
      active="reminders"
      childName={currentChild?.name}
      ageLabel={
        currentChild ? calculateAgeDisplay(currentChild.birthday) : undefined
      }
      reminderBadge={reminderBadge}
    >
      {reminderEligibility(model) ?? (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* 這一頁的到期日全部依出生日期算，與生長曲線用的矯正年齡不同。
              早產兒的家長看得到兩套年齡，所以要說明哪一套用在哪裡——政府的
              健檢與疫苗時程沒有矯正年齡這回事。 */}
          {currentChild && isCorrecting(currentChild) && (
            <motion.p variants={listItem} className={`card text-sm ${THEME.muted}`}>
              健檢、疫苗與塗氟的到期日依實際出生日期計算，不因早產而延後。矯正年齡用在生長曲線與發展檢核。
            </motion.p>
          )}
          {actionable.length === 0
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
                sections.map(({ status, title, accent, rows }) => (
                  <motion.section key={status} variants={listItem}>
                    <h2 className={`px-1 mb-2 ${THEME.body}`}>{title}</h2>
                    <ul className="space-y-3">
                      {rows.map((task) => (
                        <ReminderTaskRow
                          key={task.template.id}
                          model={model}
                          task={task}
                          accent={accent}
                        />
                      ))}
                    </ul>
                  </motion.section>
                ))
              )}

          {missingHistory.length > 0 && (
            <ReminderHistory model={model} />
          )}

          {/* 已完成殿後，而且不算進 actionable：匯出與空狀態都只看還得動的項目。 */}
          {done.length > 0 && (
            <ReminderCompleted model={model} />
          )}

          {actionable.length > 0 && (
            <motion.button
              variants={listItem}
              type="button"
              whileTap={tap}
              onClick={() => downloadIcs(actionable, currentChild?.name ?? '寶寶')}
              className="btn-secondary w-full text-explorer-bark"
            >
              <Download className="w-5 h-5" />
              匯出全部時程到行事曆
            </motion.button>
          )}

          <ReminderAgeTips model={model} />
        </motion.div>
      )}
    </ExplorerShell>
  );
}
