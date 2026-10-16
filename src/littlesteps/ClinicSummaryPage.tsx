import { User } from 'firebase/auth';
import { useState } from 'react';
import { useToast } from '~app/platform/hooks/useToast';
import type { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';
import {
  ClinicSummaryView,
  ClinicSummaryView1,
  ClinicSummaryView2,
} from '~app/littlesteps/components/ClinicSummaryView';
import { buildClinicSummaryText } from '~app/littlesteps/domain/clinicSummary';
import { useClinicSummary } from '~app/littlesteps/hooks/useClinicSummary';
import { shareText } from '~app/littlesteps/services/share';

interface ClinicSummaryPageProps {
  currentChild?: ChildProfile;
  dailyLogs: DailyLog[];
  user: User | null;
}

export default function ClinicSummaryPage({
  currentChild, dailyLogs, user,
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
    return <ClinicSummaryView />;
  }

  // --- Loading state ---
  if (loading || !data) {
    return <ClinicSummaryView1 />;
  }

  // Prepare growth records for the table (oldest first so trend arrows make sense)
  const growthRows = [...data.recentGrowthRecords].reverse();

  return (
    <ClinicSummaryView2
      data={data}
      growthRows={growthRows}
      notes={notes}
      setNotes={setNotes}
      handleShare={handleShare}
      sharing={sharing}
    />
  );
}
