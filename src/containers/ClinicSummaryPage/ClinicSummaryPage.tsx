import VisitNotes from './VisitNotes';
import LoadingState from './LoadingState';
import { formatDateTime } from './display';
import ChildOverview from './ChildOverview';
import GrowthHistory from './GrowthHistory';
import VaccinationSummary from './VaccinationSummary';
import DailySummary from './DailySummary';
import HealthHistory from './HealthHistory';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { User } from '~app/domain/authUser';
import type { ChildProfile, DailyLog } from '~app/domain/records';
import { useClinicSummary } from '~app/hooks/useClinicSummary';
import { buildClinicSummaryText } from '~app/domain/clinicSummary';

import { shareText } from '~app/domain/share';

import EmptyState from '~app/components/EmptyState';
import { useToast } from '~app/hooks/useToast';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { stagger, listItem } from '~app/domain/motion';

interface ClinicSummaryPageProps {
  currentChild?: ChildProfile;
  dailyLogs: DailyLog[];
  user: User | null;
}

export default function ClinicSummaryPage({
  currentChild,
  dailyLogs,
  user,
}: ClinicSummaryPageProps) {
  const { data, loading } = useClinicSummary(currentChild, dailyLogs, user);
  const [notes, setNotes] = useState('');
  const [sharing, setSharing] = useState(false);
  const toast = useToast();

  const handleShare = async () => {
    if (!data) {
      return;
    }

    setSharing(true);

    try {
      // 系統分享面板自己就是回饋，取消也不需要說話。
      const outcome = await shareText(
        `看診摘要 - ${data.childName}`,
        buildClinicSummaryText(data, notes),
      );

      if (outcome === 'copied') {
        toast.show('看診摘要已複製到剪貼簿', 'success');
      }

      if (outcome === 'failed') {
        toast.show('分享失敗，請稍後再試');
      }
    } finally {
      setSharing(false);
    }
  };

  // --- Empty state ---
  if (!currentChild) {
    return (
      <div className="screen">
        <div className="screen-body-wide">
          <EmptyState
            theme={SERVICE_THEME.littlesteps}
            title="尚未建立寶寶檔案"
            description="請從左上角選單新增寶寶資料"
          />
        </div>
      </div>
    );
  }

  // --- Loading state ---
  if (loading || !data) {
    return <LoadingState />;
  }

  // Prepare growth records for the table (oldest first so trend arrows make sense)

  return (
    <div className="screen">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="screen-body-wide"
      >
        {/* 產生時間是 AppBar 標題沒帶到的資訊，看診時要唸給醫師聽，所以留著。 */}
        <motion.p variants={listItem} className="text-sm text-ink-muted mb-5">
          產生時間：
          {formatDateTime(data.generatedAt)}
        </motion.p>

        {/* ===== Section 1: 寶寶基本資料 ===== */}
        <ChildOverview data={data} />

        {/* ===== Section 2: 成長趨勢 ===== */}
        <GrowthHistory data={data} />

        {/* ===== Section 3: 疫苗紀錄 ===== */}
        <VaccinationSummary data={data} />

        {/* ===== Section 4: 近 7 天日常摘要 ===== */}
        <DailySummary data={data} />

        {/* ===== 完整健康時間軸 =====
            上面幾段是分項摘要，這一段是一條線：產檢、疫苗、成長、兒童健檢
            按日期排在一起。這份摘要原本只涵蓋四種紀錄裡的兩種，講到出生就斷了，
            而醫師想看的正是連續。 */}
        {data.healthTimeline.length > 0 && <HealthHistory data={data} />}

        {/* ===== Section 5: 特殊事項 ===== */}
        <VisitNotes notes={notes} setNotes={setNotes} />

        {/* 這一頁號稱「一鍵產生看診資料」，在此之前卻沒有任何帶得走的出口。 */}
        <motion.div variants={listItem} className="pb-4">
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="btn-primary w-full"
          >
            分享看診摘要
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
