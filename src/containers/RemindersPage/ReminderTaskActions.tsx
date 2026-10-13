import { motion } from 'framer-motion';
import {
  CalendarPlus,
  Check,
  Syringe,
  Undo2,
} from 'lucide-react';
import { buildGoogleCalendarUrl } from '~app/domain/icsExport';
import { tap } from '~app/domain/motion';
import { goTo } from '~app/domain/navigate';
import type {
  ResolvedCareTask,
} from '~app/domain/records';

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */

import type { ReminderModel } from './useReminderModel';

export function ReminderTaskActions({ model, task, beforeProfile }: {

  model: ReminderModel;
  task: ResolvedCareTask;
  beforeProfile: boolean;
}) {
  const { currentChild, formFor, setFormFor, saving, openForm, undoTask } = model;
  const isVaccine = Boolean(task.template.vaccineId);
  const isDone = task.status === 'done';
  const showForm = formFor === task.template.id;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {isVaccine
        ? (
            <motion.button
              type="button"
              whileTap={tap}
              onClick={() => {
                goTo('littlesteps/vaccine-tracking');
              }}
              className="btn-secondary px-4 text-sm text-explorer-sky-ink"
            >
              <Syringe className="w-4 h-4" />
              到疫苗追蹤勾選
            </motion.button>
          )
        : isDone
          ? (
              <motion.button
                type="button"
                whileTap={tap}
                onClick={() => {
                  void undoTask(task.template.id);
                }}
                disabled={saving}
                className="btn-ghost text-sm disabled:opacity-60"
              >
                <Undo2 className="w-4 h-4" />
                取消完成
              </motion.button>
            )
          : (
              <motion.button
                type="button"
                whileTap={tap}
                onClick={() =>
                  showForm ? setFormFor(null) : openForm(task.template.id)}
                className="btn-secondary px-4 text-sm text-explorer-meadow-ink"
              >
                <Check className="w-4 h-4" />
                標記完成
              </motion.button>
            )}

      {/* 做完的項目不必再塞進行事曆。 */}
      {!beforeProfile && !isDone && (
        <a
          href={buildGoogleCalendarUrl(task, currentChild?.name ?? '寶寶')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-sm"
        >
          <CalendarPlus className="w-4 h-4" />
          加入 Google 日曆
        </a>
      )}
    </div>
  );
}
