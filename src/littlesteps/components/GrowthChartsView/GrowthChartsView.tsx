import { motion } from 'framer-motion';

import { Plus } from 'lucide-react';

import { ChildProfile, GrowthRecord } from '~app/family/domain/familyRecords';

import GrowthRecordList from '../GrowthRecordList';

import AddGrowthRecordModal from '../AddGrowthRecordModal';

import GrowthChartDisplay from '../GrowthChartDisplay';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { listItem, stagger } from '~app/platform/components/Motion';

import { formatDate } from '~app/platform/domain/calendar';

import { WHO_MAX_AGE_MONTHS } from '~app/littlesteps/domain/growthChartData';
interface GrowthChartsView3Props {
  latestRecord: GrowthRecord;
}

interface GrowthChartsView2Props {
  latestRecord: GrowthRecord;
  correcting: boolean;
  displayAgeMonths: number;
  gestationLabel: string | null;
}

interface GrowthChartsView4Props {
  setSelectedChart: import('react').Dispatch<
    import('react').SetStateAction<'weight' | 'height' | 'headCircumference'>
  >;
  selectedChart: 'weight' | 'height' | 'headCircumference';
  records: GrowthRecord[];
  currentChild: ChildProfile;
}

interface GrowthChartsView1Props {
  childSwitcher: import('react').ReactNode;
  setIsModalOpen: import('react').Dispatch<import('react').SetStateAction<boolean>>;
  latestRecord: GrowthRecord;
  correcting: boolean;
  displayAgeMonths: number;
  gestationLabel: string | null;
  hasRecords: boolean;
  setSelectedChart: import('react').Dispatch<
    import('react').SetStateAction<'weight' | 'height' | 'headCircumference'>
  >;
  selectedChart: 'weight' | 'height' | 'headCircumference';
  records: GrowthRecord[];
  currentChild: ChildProfile;
  pastWhoRange: boolean;
  error: boolean;
  loading: boolean;
  setEditingRecord: import('react').Dispatch<
    import('react').SetStateAction<GrowthRecord | null>
  >;
  deleteRecord: (recordId: string) => Promise<void>;
  isModalOpen: boolean;
  closeModal: () => void;
  handleSave: (record: Omit<GrowthRecord, 'id'>) => Promise<void>;
  editingRecord: GrowthRecord | null;
}

const CHART_TABS: {
  value: 'weight' | 'height' | 'headCircumference';
  label: string;
}[] = [
  { value: 'weight', label: '體重' },
  { value: 'height', label: '身高' },
  { value: 'headCircumference', label: '頭圍' },
];

export function GrowthChartsView() {
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

export function GrowthChartsView3({ latestRecord }: GrowthChartsView3Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {latestRecord.weight !== undefined && (
        <div className="flex flex-col items-center p-4 bg-primary-soft rounded-2xl">
          <span className="text-2xl font-bold text-ink">
            {latestRecord.weight}
            {' '}
            kg
          </span>
          <span className="text-sm text-ink-muted mt-1">體重</span>
          {latestRecord.percentile?.weight && (
            <span className="text-sm text-primary-dark mt-1">
              第
              {' '}
              {latestRecord.percentile.weight.toFixed(0)}
              {' '}
              百分位
            </span>
          )}
        </div>
      )}
      {latestRecord.height !== undefined && (
        <div className="flex flex-col items-center p-4 bg-primary-soft rounded-2xl">
          <span className="text-2xl font-bold text-ink">
            {latestRecord.height}
            {' '}
            cm
          </span>
          <span className="text-sm text-ink-muted mt-1">身高</span>
          {latestRecord.percentile?.height && (
            <span className="text-sm text-primary-dark mt-1">
              第
              {' '}
              {latestRecord.percentile.height.toFixed(0)}
              {' '}
              百分位
            </span>
          )}
        </div>
      )}
      {latestRecord.headCircumference !== undefined && (
        <div className="flex flex-col items-center p-4 bg-primary-soft rounded-2xl">
          <span className="text-2xl font-bold text-ink">
            {latestRecord.headCircumference}
            {' '}
            cm
          </span>
          <span className="text-sm text-ink-muted mt-1">頭圍</span>
          {latestRecord.percentile?.headCircumference && (
            <span className="text-sm text-primary-dark mt-1">
              第
              {' '}
              {latestRecord.percentile.headCircumference.toFixed(0)}
              {' '}
              百分位
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function GrowthChartsView2({
  latestRecord, correcting, displayAgeMonths, gestationLabel,
}: GrowthChartsView2Props) {
  return (
    <motion.div variants={listItem} className="panel mb-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-sm text-ink-muted">
          最新記錄:
          {formatDate(latestRecord.date)}
        </p>
        {correcting && (
          <p className="text-sm font-medium text-primary-dark">
            矯正年齡
            {' '}
            {displayAgeMonths}
            {' '}
            個月（
            {gestationLabel}
            ）
          </p>
        )}
      </div>
      <GrowthChartsView3 latestRecord={latestRecord} />
    </motion.div>
  );
}

export function GrowthChartsView4({
  setSelectedChart, selectedChart, records, currentChild,
}: GrowthChartsView4Props) {
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

export function GrowthChartsView1({
  childSwitcher, setIsModalOpen, latestRecord, correcting, displayAgeMonths,
  gestationLabel, hasRecords, setSelectedChart, selectedChart, records, currentChild,
  pastWhoRange, error, loading, setEditingRecord, deleteRecord, isModalOpen,
  closeModal, handleSave, editingRecord,
}: GrowthChartsView1Props) {
  return (
    <div className="screen">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="screen-body-wide"
      >
        <motion.div
          variants={listItem}
          className="flex items-start justify-end mb-5"
        >
          {/* mr-auto 而不是把這一列改成 justify-between：切換器在單寶寶帳號下
              不渲染，那時這一列只剩「新增記錄」，仍然要靠 justify-end 靠右。 */}
          {childSwitcher}
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            <span>新增記錄</span>
          </button>
        </motion.div>

        {/* Latest Record Summary */}
        {latestRecord && (
          <GrowthChartsView2
            latestRecord={latestRecord}
            correcting={correcting}
            displayAgeMonths={displayAgeMonths}
            gestationLabel={gestationLabel}
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
          <GrowthChartsView4
            setSelectedChart={setSelectedChart}
            selectedChart={selectedChart}
            records={records}
            currentChild={currentChild}
          />
        )}

        {/*
          WHO 的標準只到 36 個月。過了以後 calculateZScore 會丟錯，
          useGrowthTracking 把它接住並略過百分位——紀錄照樣存下來，但畫面上
          那個 P 值就消失了，沒有任何說明。家長會以為是自己輸入有問題。
        */}
        {pastWhoRange && (
          <motion.div variants={listItem} className="card mb-6">
            <p className="text-sm text-ink-muted">
              WHO 生長標準涵蓋 0-
              {WHO_MAX_AGE_MONTHS}
              {' '}
              個月。滿
              {WHO_MAX_AGE_MONTHS}
              {' '}
              個月之後的紀錄只保留測量值，不再顯示百分位。
            </p>
          </motion.div>
        )}

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
