import { BornNotice, MissingPregnancyNotice } from './UnavailableState';
import type { PrenatalPageProps } from './types';
import { THEME, SECTIONS, DONE_SECTION } from './presentation';
import { usePrenatalEditor } from './usePrenatalEditor';
import PrenatalHistory from './PrenatalHistory';
import PrenatalSection from './PrenatalSection';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { prenatalCheckupSchedule } from '~app/domain/prenatalCheckups';

import {
  resolvePrenatalItems,
  weeksPregnant,
} from '~app/domain/prenatalSchedule';

import BloomShell from '../BloomShell';

import { stagger } from '~app/domain/motion';

import { isPregnancyProfile } from '~app/domain/pregnancy';
import { formatDate } from '~app/domain/dateHelpers';
import { splitOverdueByProfileStart } from '~app/domain/profileHistory';

/**
 * 產檢時程：14 次公費產檢與各項篩檢，依末次月經推算日期。
 *
 * 這一頁補上首頁「產檢時程」按鈕原本的空實作（`onClick={() => {}}`），
 * 以及原本寫死在程式碼裡的假產檢資料。
 */
export default function PrenatalPage({
  currentChild,
  progress,
  onComplete,
  onUndo,
}: PrenatalPageProps) {
  /* 建檔前那一區預設收合：重點是「有這些東西」，不是逐條看完。 */
  const [historyOpen, setHistoryOpen] = useState(false);

  const editor = usePrenatalEditor({ onComplete, onUndo });
  const lmp = currentChild?.pregnancyData?.lastPeriodDate ?? '';

  const items = useMemo(
    () =>
      resolvePrenatalItems({
        lastPeriodDate: lmp,
        templates: prenatalCheckupSchedule,
        completed: progress,
      }),
    [lmp, progress],
  );

  /* 建檔之後才到期的才是真的逾期；建檔前的只是 app 沒有那段紀錄。 */
  const { overdue, missingHistory } = useMemo(
    () => splitOverdueByProfileStart(items, currentChild?.createdAt),
    [items, currentChild?.createdAt],
  );

  const weeks = lmp ? weeksPregnant(lmp) : 0;

  // 與 LittleBloomPage 同一個理由：出生後 lmp 仍在，只有 status 變成 archived。
  if (currentChild && lmp && !isPregnancyProfile(currentChild)) {
    return <BornNotice />;
  }

  if (!lmp) {
    return <MissingPregnancyNotice />;
  }

  return (
    <BloomShell
      title="產檢時程"
      subtitle={`第 ${weeks + 1} 週 · 預產期 ${formatDate(currentChild?.pregnancyData?.dueDate)}`}
      backTo="littlebloom"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {SECTIONS.map(({ status, title }) => (
          <PrenatalSection
            key={status}
            title={title}
            rows={
              status === 'overdue'
                ? overdue
                : items.filter((item) => item.status === status)
            }
            editor={editor}
          />
        ))}

        <PrenatalHistory
          missingHistory={missingHistory}
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          editor={editor}
        />

        <PrenatalSection
          title={DONE_SECTION.title}
          rows={items.filter((item) => item.status === DONE_SECTION.status)}
          editor={editor}
        />

        <p className={`text-xs leading-relaxed px-1 ${THEME.muted}`}>
          週數依末次月經第一天推算，實際時程請以產檢醫師安排為準。標示為自費的項目不在公費補助範圍內。
        </p>
      </motion.div>
    </BloomShell>
  );
}
