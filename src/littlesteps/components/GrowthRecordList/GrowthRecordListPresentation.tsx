import { AnimatePresence, motion } from 'framer-motion';

import { Pencil, Trash2 } from 'lucide-react';

import { GrowthRecord } from '~app/family/domain/familyRecords';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { listItem, stagger, tap } from '~app/platform/components/Motion';

import { formatDate } from '~app/platform/domain/calendar';
interface GrowthRecordListPresentation6Props {
  record: GrowthRecord;
  onEdit: (record: GrowthRecord) => void;
  handleDelete: (recordId: string) => Promise<void>;
}

interface GrowthRecordListPresentation7Props {
  record: GrowthRecord;
  getPercentileColor: (percentile?: number) => string;
}

interface GrowthRecordListPresentation5Props {
  record: GrowthRecord;
  onEdit: (record: GrowthRecord) => void;
  handleDelete: (recordId: string) => Promise<void>;
  getPercentileColor: (percentile?: number) => string;
}

interface GrowthRecordListPresentation4Props {
  records: GrowthRecord[];
  onEdit: (record: GrowthRecord) => void;
  handleDelete: (recordId: string) => Promise<void>;
  getPercentileColor: (percentile?: number) => string;
}

interface GrowthRecordListPresentation3Props {
  records: GrowthRecord[];
  onEdit: (record: GrowthRecord) => void;
  handleDelete: (recordId: string) => Promise<void>;
  getPercentileColor: (percentile?: number) => string;
}

interface GrowthRecordListPresentation2Props {
  records: GrowthRecord[];
  onEdit: (record: GrowthRecord) => void;
  handleDelete: (recordId: string) => Promise<void>;
  getPercentileColor: (percentile?: number) => string;
}

export function GrowthRecordListPresentation() {
  return (
    <div className="panel text-center">
      <div
        className={
          'inline-block w-8 h-8 border-4 border-primary border-t-transparent '
          + 'rounded-full animate-spin'
        }
      />
      <p className="text-ink-muted mt-4">載入中...</p>
    </div>
  );
}

export function GrowthRecordListPresentation1() {
  return (
    <EmptyState
      theme={SERVICE_THEME.littlesteps}
      title="尚無記錄"
      description="點擊「新增記錄」開始追蹤成長數據"
    />
  );
}

export function GrowthRecordListPresentation6({
  record, onEdit, handleDelete,
}: GrowthRecordListPresentation6Props) {
  return (
    <div className="flex items-start justify-between mb-3">
      <span className="font-semibold">{formatDate(record.date)}</span>
      <div className="flex items-center gap-1 -my-2.5">
        <motion.button
          whileTap={tap}
          onClick={() => onEdit(record)}
          className="btn-icon"
          aria-label={`編輯 ${formatDate(record.date)} 的記錄`}
        >
          <Pencil className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileTap={tap}
          onClick={() => handleDelete(record.id)}
          className="btn-icon text-red-600 hover:bg-red-50"
          aria-label={`刪除 ${formatDate(record.date)} 的記錄`}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

export function GrowthRecordListPresentation7({
  record, getPercentileColor,
}: GrowthRecordListPresentation7Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {record.weight !== undefined && (
        <div className="flex flex-col p-2.5 bg-secondary-soft rounded-lg">
          <span className="text-xs text-ink-muted mb-1">體重</span>
          <span className="font-bold whitespace-nowrap">
            {record.weight}
            {' '}
            kg
          </span>
          {record.percentile?.weight && (
            <span
              className={`text-xs mt-1 font-medium ${getPercentileColor(record.percentile.weight)}`}
            >
              P
              {record.percentile.weight.toFixed(0)}
            </span>
          )}
        </div>
      )}

      {record.height !== undefined && (
        <div className="flex flex-col p-2.5 bg-secondary-soft rounded-lg">
          <span className="text-xs text-ink-muted mb-1">身高</span>
          <span className="font-bold whitespace-nowrap">
            {record.height}
            {' '}
            cm
          </span>
          {record.percentile?.height && (
            <span
              className={`text-xs mt-1 font-medium ${getPercentileColor(record.percentile.height)}`}
            >
              P
              {record.percentile.height.toFixed(0)}
            </span>
          )}
        </div>
      )}

      {record.headCircumference !== undefined && (
        <div className="flex flex-col p-2.5 bg-secondary-soft rounded-lg">
          <span className="text-xs text-ink-muted mb-1">頭圍</span>
          <span className="font-bold whitespace-nowrap">
            {record.headCircumference}
            {' '}
            cm
          </span>
          {record.percentile?.headCircumference && (
            <span
              className={`text-xs mt-1 font-medium ${getPercentileColor(record.percentile.headCircumference)}`}
            >
              P
              {record.percentile.headCircumference.toFixed(0)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function GrowthRecordListPresentation5({
  record, onEdit, handleDelete, getPercentileColor,
}: GrowthRecordListPresentation5Props) {
  return (
    <motion.div
      key={record.id}
      variants={listItem}
      exit="hidden"
      layout
      className="border border-ink/10 rounded-xl p-4"
    >
      <GrowthRecordListPresentation6
        record={record}
        onEdit={onEdit}
        handleDelete={handleDelete}
      />

      {/*
                One wash for all three tiles: the label names the field, so a
                different pastel per measurement was distinguishing nothing.
                Values are `whitespace-nowrap` — `8.6 kg` wrapped at 360px.
              */}
      <GrowthRecordListPresentation7
        record={record}
        getPercentileColor={getPercentileColor}
      />

      {record.notes && (
        <p className="mt-3 p-3 bg-warm-white rounded-lg text-sm text-ink-muted">
          {record.notes}
        </p>
      )}
    </motion.div>
  );
}

export function GrowthRecordListPresentation4({
  records, onEdit, handleDelete, getPercentileColor,
}: GrowthRecordListPresentation4Props) {
  return (
    <AnimatePresence mode="popLayout">
      {records.map((record) => (
        <GrowthRecordListPresentation5
          key={record.id}
          record={record}
          onEdit={onEdit}
          handleDelete={handleDelete}
          getPercentileColor={getPercentileColor}
        />
      ))}
    </AnimatePresence>
  );
}

export function GrowthRecordListPresentation3({
  records, onEdit, handleDelete, getPercentileColor,
}: GrowthRecordListPresentation3Props) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <GrowthRecordListPresentation4
        records={records}
        onEdit={onEdit}
        handleDelete={handleDelete}
        getPercentileColor={getPercentileColor}
      />
    </motion.div>
  );
}

export function GrowthRecordListPresentation2({
  records, onEdit, handleDelete, getPercentileColor,
}: GrowthRecordListPresentation2Props) {
  return (
    <div className="panel">
      <h2 className="mb-4">歷史記錄</h2>
      <GrowthRecordListPresentation3
        records={records}
        onEdit={onEdit}
        handleDelete={handleDelete}
        getPercentileColor={getPercentileColor}
      />
    </div>
  );
}
