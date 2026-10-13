import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { User } from '~app/domain/authUser';
import { ChildProfile, GrowthRecord } from '~app/domain/records';
import { useGrowthTracking } from '~app/hooks/useGrowthTracking';
import GrowthRecordList from '../GrowthRecordList';
import AddGrowthRecordModal from '../AddGrowthRecordModal';
import GrowthChartDisplay from '~app/components/GrowthChartDisplay';
import ChildSwitcher from '~app/components/ChildSwitcher';
import EmptyState from '~app/components/EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { stagger, listItem } from '~app/domain/motion';
import { formatDate } from '~app/domain/dateHelpers';
import {
  correctedAgeMonths,
  gestationalAgeLabel,
  isCorrecting,
} from '~app/domain/correctedAge';
import { WHO_MAX_AGE_MONTHS } from '~app/domain/growthChartData';

interface GrowthChartsPageProps {
  currentChild?: ChildProfile;
  user: User | null;
}

const CHART_TABS: {
  value: 'weight' | 'height' | 'headCircumference';
  label: string;
}[] = [
  { value: 'weight', label: '體重' },
  { value: 'height', label: '身高' },
  { value: 'headCircumference', label: '頭圍' },
];

export default function GrowthChartsPage({
  currentChild,
  user,
}: GrowthChartsPageProps) {
  const [selectedChart, setSelectedChart] = useState<
    'weight' | 'height' | 'headCircumference'
  >('weight');

  const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  if (!currentChild) {
    return <GrowthProfileNotice />;
  }

  const latestRecord = records[0]; // Already sorted newest first
  const hasRecords = records.length > 0;
  // 早產兒的百分位、曲線與這裡的年齡都用矯正年齡。WHO 的涵蓋範圍也一樣：
  // 判斷「超出三歲」要用同一把尺，否則一個矯正年齡 35 個月的早產兒會先被
  // 告知圖表不再適用，卻還畫得出來。
  const displayAgeMonths = correctedAgeMonths(currentChild);
  // 孩子已經超出 WHO 的涵蓋範圍。只在這時候說，還沒滿三歲的家長不需要看到。
  const pastWhoRange = displayAgeMonths > WHO_MAX_AGE_MONTHS;

  return (
    <div className="screen">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="screen-body-wide"
      >
        <GrowthRecordToolbar setIsModalOpen={setIsModalOpen} />

        {/* Latest Record Summary */}
        {latestRecord && (
          <LatestGrowthSummary
            latestRecord={latestRecord}
            currentChild={currentChild}
          />
        )}

        {/*
          Chart and its metric tabs only exist once there is something to plot.
          With no records at all, GrowthChartDisplay's 無法顯示圖表 card and
          GrowthRecordList's 尚無記錄 card stacked up saying the same thing; the
          list's card is the one that names the next step. A record that misses
          the selected metric still falls through to the chart's own message.
        */}
        {hasRecords && (
          <GrowthChartPanel
            currentChild={currentChild}
            records={records}
            selectedChart={selectedChart}
            setSelectedChart={setSelectedChart}
          />
        )}

        {/*
          WHO 的標準只到 36 個月。過了以後 calculateZScore 會丟錯，
          useGrowthTracking 把它接住並略過百分位——紀錄照樣存下來，但畫面上
          那個 P 值就消失了，沒有任何說明。家長會以為是自己輸入有問題。
        */}
        {pastWhoRange && <GrowthRangeNotice />}

        {/*
          讀取失敗時 records 是空的，直接交給清單就會印出「尚無記錄」——把
          「讀不到」講成「還沒量過」，家長會以為紀錄不見了。這裡先攔下來。
        */}
        {error
          ? (
              <motion.div variants={listItem} className="card">
                <p className="text-sm text-ink-muted">
                  讀不到成長記錄，請確認網路後重新載入
                </p>
              </motion.div>
            )
          : (
              <motion.div variants={listItem}>
                <GrowthRecordList
                  records={records}
                  loading={loading}
                  onEdit={(record) => {
                    setEditingRecord(record);
                    setIsModalOpen(true);
                  }}
                  onDelete={deleteRecord}
                />
              </motion.div>
            )}
      </motion.div>

      <AddGrowthRecordModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        childId={currentChild.id}
        editingRecord={editingRecord}
      />
    </div>
  );
}

function LatestGrowthSummary({
  latestRecord,
  currentChild,
}: {
  latestRecord: GrowthRecord;
  currentChild: ChildProfile;
}) {
  const correcting = isCorrecting(currentChild);
  const displayAgeMonths = correctedAgeMonths(currentChild);
  const gestationLabel = gestationalAgeLabel(currentChild);

  return (
    <motion.div variants={listItem} className="panel mb-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-sm text-ink-muted">
          {'最新記錄: '}
          {formatDate(latestRecord.date)}
        </p>
        {correcting && (
          <p className="text-sm font-medium text-primary-dark">
            {'矯正年齡 '}
            {displayAgeMonths}
            {' 個月（'}
            {gestationLabel}
            ）
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {latestRecord.weight !== undefined && (
          <div className="flex flex-col items-center p-4 bg-primary-soft rounded-2xl">
            <span className="text-2xl font-bold text-ink">
              {latestRecord.weight}
              {' kg'}
            </span>
            <span className="text-sm text-ink-muted mt-1">體重</span>
            {latestRecord.percentile?.weight && (
              <span className="text-sm text-primary-dark mt-1">
                {'第 '}
                {latestRecord.percentile.weight.toFixed(0)}
                {' 百分位'}
              </span>
            )}
          </div>
        )}
        {latestRecord.height !== undefined && (
          <div className="flex flex-col items-center p-4 bg-primary-soft rounded-2xl">
            <span className="text-2xl font-bold text-ink">
              {latestRecord.height}
              {' cm'}
            </span>
            <span className="text-sm text-ink-muted mt-1">身高</span>
            {latestRecord.percentile?.height && (
              <span className="text-sm text-primary-dark mt-1">
                {'第 '}
                {latestRecord.percentile.height.toFixed(0)}
                {' 百分位'}
              </span>
            )}
          </div>
        )}
        {latestRecord.headCircumference !== undefined && (
          <div className="flex flex-col items-center p-4 bg-primary-soft rounded-2xl">
            <span className="text-2xl font-bold text-ink">
              {latestRecord.headCircumference}
              {' cm'}
            </span>
            <span className="text-sm text-ink-muted mt-1">頭圍</span>
            {latestRecord.percentile?.headCircumference && (
              <span className="text-sm text-primary-dark mt-1">
                {'第 '}
                {latestRecord.percentile.headCircumference.toFixed(0)}
                {' 百分位'}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function GrowthChartPanel({
  currentChild,
  records,
  selectedChart,
  setSelectedChart,
}: {
  currentChild: ChildProfile;
  records: GrowthRecord[];
  selectedChart: 'weight' | 'height' | 'headCircumference';
  setSelectedChart: React.Dispatch<
    React.SetStateAction<'weight' | 'height' | 'headCircumference'>
  >;
}) {
  return (
    <>
      <motion.div variants={listItem} className="row-bleed flex gap-2 pb-2 mb-4">
        {CHART_TABS.map((chartTab) => (
          <button
            key={chartTab.value}
            onClick={() => setSelectedChart(chartTab.value)}
            className={`chip ${selectedChart === chartTab.value ? 'chip-on' : ''}`}
          >
            {chartTab.label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={listItem} className="mb-6">
        <GrowthChartDisplay
          records={records}
          measurementType={selectedChart}
          gender={currentChild.gender}
          birthday={currentChild.birthday}
          gestationalAgeWeeks={currentChild.gestationalAgeWeeks}
          gestationalAgeDays={currentChild.gestationalAgeDays}
        />
      </motion.div>
    </>
  );
}

function GrowthRangeNotice() {
  return (
    <motion.div variants={listItem} className="card mb-6">
      <p className="text-sm text-ink-muted">
        WHO 生長標準涵蓋 0-
        {WHO_MAX_AGE_MONTHS}
        {' 個月。滿'}
        {' '}
        {WHO_MAX_AGE_MONTHS}
        {' 個月之後的紀錄只保留測量值，不再顯示百分位。'}
      </p>
    </motion.div>
  );
}

function GrowthProfileNotice() {
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

function GrowthRecordToolbar({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <motion.div variants={listItem} className="flex items-start justify-end mb-5">
      {/* mr-auto 而不是把這一列改成 justify-between：切換器在單寶寶帳號下
              不渲染，那時這一列只剩「新增記錄」，仍然要靠 justify-end 靠右。 */}
      <ChildSwitcher service="littlesteps" className="mr-auto" />
      <button onClick={() => setIsModalOpen(true)} className="btn-primary">
        <Plus className="w-5 h-5" />
        <span>新增記錄</span>
      </button>
    </motion.div>
  );
}
