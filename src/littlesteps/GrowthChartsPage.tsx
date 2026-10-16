import { confirmDelete } from '~app/platform/services/confirmation';
import { useToast } from '~app/platform/hooks/useToast';
import { ChildSwitcher } from '~app/family';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { User } from 'firebase/auth';
import { useState } from 'react';
import {
  correctedAgeMonths,
  gestationalAgeLabel,
  isCorrecting,
} from '~app/family/domain/correctedAge';
import { ChildProfile, GrowthRecord } from '~app/family/domain/familyRecords';
import {
  GrowthChartsView,
  GrowthChartsView1,
} from '~app/littlesteps/components/GrowthChartsView';
import { WHO_MAX_AGE_MONTHS } from '~app/littlesteps/domain/growthChartData';
import { useGrowthTracking } from '~app/littlesteps/hooks/useGrowthTracking';

interface GrowthChartsPageProps {
  currentChild?: ChildProfile;
  user: User | null;
}

export default function GrowthChartsPage({
  currentChild, user,
}: GrowthChartsPageProps) {
  const toast = useToast();
  const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedChart, setSelectedChart] = useState<
    'weight' | 'height' | 'headCircumference'
  >('weight');

  const { records, loading, error, addRecord, updateRecord, deleteRecord }
    = useGrowthTracking(currentChild?.id || null, user, currentChild ?? undefined);

  /*
    改一筆和新增一筆用同一張表：打錯的體重原本只能整筆刪掉重建。
    失敗時不接住——訊息與「表單留在原地」由 AddGrowthRecordModal 自己處理。
    editingRecord 是點下「編輯」那一刻的那一版，表單從它帶入，也拿它當比對
    的基準；listener 後來推來的新版不算，否則對方剛補的那一項會被當成清掉。
  */
  const handleSave = async (record: Omit<GrowthRecord, 'id'>) => {
    if (editingRecord) {
      await updateRecord(editingRecord.id, record, editingRecord);
    } else {
      await addRecord(record);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (confirmDelete('這筆成長記錄')) {
      try {
        await deleteRecord(recordId);
      } catch (error) {
        console.error('Failed to delete record:', error);
        toast.show('刪除失敗，請稍後再試');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  if (!currentChild) {
    return <GrowthChartsView />;
  }

  // 早產兒的百分位、曲線與這裡的年齡都用矯正年齡。WHO 的涵蓋範圍也一樣：
  // 判斷「超出三歲」要用同一把尺，否則一個矯正年齡 35 個月的早產兒會先被
  // 告知圖表不再適用，卻還畫得出來。
  const correcting = isCorrecting(currentChild);
  const displayAgeMonths = correctedAgeMonths(currentChild);
  const gestationLabel = gestationalAgeLabel(currentChild);
  // 孩子已經超出 WHO 的涵蓋範圍。只在這時候說，還沒滿三歲的家長不需要看到。
  const pastWhoRange = displayAgeMonths > WHO_MAX_AGE_MONTHS;

  return (
    <GrowthChartsView1
      childSwitcher={
        <ChildSwitcher theme={SERVICE_THEME.littlesteps} className="mr-auto" />
      }
      setIsModalOpen={setIsModalOpen}
      latestRecord={records[0]}
      correcting={correcting}
      displayAgeMonths={displayAgeMonths}
      gestationLabel={gestationLabel}
      hasRecords={records.length > 0}
      setSelectedChart={setSelectedChart}
      selectedChart={selectedChart}
      records={records}
      currentChild={currentChild}
      pastWhoRange={pastWhoRange}
      error={error}
      loading={loading}
      setEditingRecord={setEditingRecord}
      deleteRecord={handleDelete}
      isModalOpen={isModalOpen}
      closeModal={closeModal}
      handleSave={handleSave}
      editingRecord={editingRecord}
    />
  );
}
