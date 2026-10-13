import { motion } from 'framer-motion';
import { listItem } from '~app/domain/motion';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */

import { ReminderTaskRow } from './ReminderTaskRow';
import type { ReminderModel } from './useReminderModel';

const THEME = SERVICE_THEME.littleexplorer;

export function ReminderCompleted({ model }: { model: ReminderModel }) {
  const { done } = model;

  return (
    <motion.section variants={listItem}>
      <h2 className={`px-1 mb-2 ${THEME.body}`}>
        已完成
        <span className={`ml-2 text-sm font-normal ${THEME.muted}`}>
          {done.length}
        </span>
      </h2>
      <ul className={
        ''
        + ' space-y-3'
      }
      >
        {done.map((task) => (
          <ReminderTaskRow
            key={task.template.id}
            model={model}
            task={task}
            accent=""
          />
        ))}
      </ul>
    </motion.section>
  );
}
