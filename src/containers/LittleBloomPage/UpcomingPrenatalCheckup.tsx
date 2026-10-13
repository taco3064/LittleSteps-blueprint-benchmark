import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { formatDate } from '~app/domain/dateHelpers';
import { listItem, tap } from '~app/domain/motion';
import { goTo } from '~app/domain/navigate';
import { prenatalCheckupSchedule } from '~app/domain/prenatalCheckups';
import { resolvePrenatalItems } from '~app/domain/prenatalSchedule';
import type { PrenatalCheckupProgress } from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
const THEME = SERVICE_THEME.littlebloom;

export default function UpcomingPrenatalCheckup({
  lmp,
  progress,
}: {
  lmp: string;
  progress: PrenatalCheckupProgress;
}) {
  const nextItem = useMemo(() => {
    if (!lmp) {
      return null;
    }

    const items = resolvePrenatalItems({
      lastPeriodDate: lmp,
      templates: prenatalCheckupSchedule,
      completed: progress,
    });

    return (
      items.find((item) => item.status === 'overdue')
      ?? items.find((item) => item.status === 'due')
      ?? items.find((item) => item.status === 'upcoming')
      ?? null
    );
  }, [lmp, progress]);

  return (
    <>
      <motion.section variants={listItem} className="panel">
        <h3 className={`mb-4 ${THEME.body}`}>下一項產檢</h3>
        {nextItem
          ? (
              <motion.button
                type="button"
                whileTap={tap}
                onClick={() => {
                  goTo('littlebloom/prenatal');
                }}
                className={
                  'w-full text-left rounded-2xl bg-bloom-cream p-4'
                  + ' hover:bg-bloom-sand transition-colors'
                }
              >
                <p className={`font-semibold ${THEME.body}`}>
                  {nextItem.template.visitNumber
                    ? `第 ${nextItem.template.visitNumber} 次 · `
                    : ''}
                  {nextItem.template.title}
                </p>
                <p className={`text-sm mt-1 ${THEME.muted}`}>
                  {'建議第 '}
                  {nextItem.template.dueWeek}
                  {' 週 · '}
                  {formatDate(nextItem.dueDate)}
                  {nextItem.status === 'overdue' && ' · 已過建議週數'}
                </p>
              </motion.button>
            )
          : (
              <p className={`text-sm ${THEME.muted}`}>所有產檢項目都完成了。</p>
            )}
      </motion.section>
    </>
  );
}
