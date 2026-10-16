import { motion } from 'framer-motion';

import { Baby, Edit, Moon, Trash2 } from 'lucide-react';

import { DailyLog } from '~app/family/domain/familyRecords';

import { formatTime } from '~app/platform/domain/calendar';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { listItem, stagger } from '~app/platform/components/Motion';
interface LogTimelinePresentationProps {
  Glyph: import('lucide-react').LucideIcon;
}

interface LogTimelinePresentation3Props {
  isToday: boolean;
}

interface LogTimelinePresentation7Props {
  log: DailyLog;
  getLogTitle: (log: DailyLog) => '擠奶' | '餵奶' | '睡眠' | '尿布';
  details: string;
  currentUserId: string | null | undefined;
}

interface LogTimelinePresentation6Props {
  getLogIcon: (log: DailyLog) => import('react/jsx-runtime').JSX.Element;
  log: DailyLog;
  getLogTitle: (log: DailyLog) => '擠奶' | '餵奶' | '睡眠' | '尿布';
  details: string;
  currentUserId: string | null | undefined;
  onEdit: (log: DailyLog) => void;
  handleDelete: (log: DailyLog) => void;
}

interface LogTimelinePresentation5Props {
  log: DailyLog;
  getLogIcon: (log: DailyLog) => import('react/jsx-runtime').JSX.Element;
  getLogTitle: (log: DailyLog) => '擠奶' | '餵奶' | '睡眠' | '尿布';
  details: string;
  currentUserId: string | null | undefined;
  onEdit: (log: DailyLog) => void;
  handleDelete: (log: DailyLog) => void;
}

interface LogTimelinePresentation4Props {
  todayLogs: DailyLog[];
  getLogDetails: (log: DailyLog) => string;
  getLogIcon: (log: DailyLog) => import('react/jsx-runtime').JSX.Element;
  getLogTitle: (log: DailyLog) => '擠奶' | '餵奶' | '睡眠' | '尿布';
  currentUserId: string | null | undefined;
  onEdit: (log: DailyLog) => void;
  handleDelete: (log: DailyLog) => void;
}

export function LogTimelinePresentation({ Glyph }: LogTimelinePresentationProps) {
  return <Glyph className="w-5 h-5 text-butter-dark" />;
}

export function LogTimelinePresentation1() {
  return <Moon className="w-5 h-5 text-secondary-dark" />;
}

export function LogTimelinePresentation2() {
  return <Baby className="w-5 h-5 text-mint-dark" />;
}

export function LogTimelinePresentation3({
  isToday,
}: LogTimelinePresentation3Props) {
  return (
    <EmptyState
      theme={SERVICE_THEME.littlesteps}
      title={isToday ? '今天還沒有記錄' : '這天沒有記錄'}
      description={isToday ? '點擊上方按鈕開始記錄吧！' : '這一天沒有留下任何紀錄'}
    />
  );
}

export function LogTimelinePresentation7({
  log, getLogTitle, details, currentUserId,
}: LogTimelinePresentation7Props) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-ink-faint">
          {formatTime(log.timestamp)}
        </span>
        <span className="font-bold">{getLogTitle(log)}</span>
      </div>

      {details && <p className="text-sm text-ink-muted">{details}</p>}

      {log.data.notes && (
        <p className="text-xs text-ink-faint mt-1">
          備註：
          {log.data.notes}
        </p>
      )}

      {/* 「上一餐誰餵的」是兩個人輪流照顧時最常問的問題。只在確定是
                    別人記的時候才顯示：舊紀錄沒有這個欄位，不能因為缺值就猜。 */}
      {log.createdByName && log.createdBy && log.createdBy !== currentUserId && (
        <p className="text-xs text-ink-faint mt-1">
          由
          {' '}
          {log.createdByName}
          {' '}
          記錄
        </p>
      )}
    </div>
  );
}

export function LogTimelinePresentation6({
  getLogIcon, log, getLogTitle, details, currentUserId, onEdit, handleDelete,
}: LogTimelinePresentation6Props) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">{getLogIcon(log)}</div>

      <LogTimelinePresentation7
        log={log}
        getLogTitle={getLogTitle}
        details={details}
        currentUserId={currentUserId}
      />

      <div className="flex gap-1 flex-shrink-0 -my-2.5">
        <button
          onClick={() => onEdit(log)}
          className="btn-icon text-secondary-dark hover:bg-secondary-soft"
          aria-label="編輯"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(log)}
          className="btn-icon text-red-600 hover:bg-red-50"
          aria-label="刪除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function LogTimelinePresentation5({
  log, getLogIcon, getLogTitle, details, currentUserId, onEdit, handleDelete,
}: LogTimelinePresentation5Props) {
  return (
    <motion.div key={log.id} variants={listItem} className="card">
      <LogTimelinePresentation6
        getLogIcon={getLogIcon}
        log={log}
        getLogTitle={getLogTitle}
        details={details}
        currentUserId={currentUserId}
        onEdit={onEdit}
        handleDelete={handleDelete}
      />
    </motion.div>
  );
}

export function LogTimelinePresentation4({
  todayLogs, getLogDetails, getLogIcon, getLogTitle, currentUserId, onEdit,
  handleDelete,
}: LogTimelinePresentation4Props) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {todayLogs.map((log) => {
        // 擠奶可以只記一個時間：側別、時長、奶量都是選填的，所以這一列真的可能
        // 沒有細節可寫。空的 <p> 撐出來的那道空白，會讓它看起來像漏掉了東西。
        const details = getLogDetails(log);

        return (
          <LogTimelinePresentation5
            key={log.id}
            log={log}
            getLogIcon={getLogIcon}
            getLogTitle={getLogTitle}
            details={details}
            currentUserId={currentUserId}
            onEdit={onEdit}
            handleDelete={handleDelete}
          />
        );
      })}
    </motion.div>
  );
}
