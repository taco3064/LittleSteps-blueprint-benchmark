import { motion } from 'framer-motion';
import { Milk, Droplets, Moon, Baby, Edit, Trash2 } from 'lucide-react';
import { DailyLog, FeedingData, SleepData, DiaperData } from '~app/domain/records';
import {
  formatTime,
  formatDuration,
  isSameDay,
  calculateDuration,
} from '~app/domain/dateHelpers';
import {
  getConsistencyLabel,
  getDiaperTypeLabel,
  getFeedingSideLabel,
  getFeedingTypeLabel,
  isPumpingLog,
  isStaleOpenSleep,
} from '~app/domain/logHelpers';
import EmptyState from '../EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { listItem, stagger } from '~app/domain/motion';
import { confirmDelete } from '~app/domain/confirmDelete';

interface LogTimelineProps {
  logs: DailyLog[];
  onEdit: (log: DailyLog) => void;
  onDelete: (logId: string) => void;
  /**
   * 目前登入者的 uid。只有別人記的那幾筆會標出記錄者——一個人自己用的時候，
   * 每一列都掛上自己的名字只是噪音。
   */
  currentUserId?: string | null;
  /** 要顯示哪一天。省略時是今天。 */
  date?: Date;
}

export default function LogTimeline({
  logs,
  onEdit,
  onDelete,
  currentUserId,
  date,
}: LogTimelineProps) {
  // Filter today's logs and sort by time (newest first)
  const shownDate = date ?? new Date();
  const isToday = isSameDay(shownDate, new Date());

  const todayLogs = logs
    .filter((log) => isSameDay(log.timestamp, shownDate))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleDelete = (log: DailyLog) => {
    if (confirmDelete(`${getLogTitle(log)}記錄`)) {
      onDelete(log.id);
    }
  };

  if (todayLogs.length === 0) {
    return (
      <EmptyState
        theme={SERVICE_THEME.littlesteps}
        title={isToday ? '今天還沒有記錄' : '這天沒有記錄'}
        description={isToday ? '點擊上方按鈕開始記錄吧！' : '這一天沒有留下任何紀錄'}
      />
    );
  }

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
          <motion.div key={log.id} variants={listItem} className="card">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">{getLogIcon(log)}</div>

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
                {log.createdByName
                  && log.createdBy
                  && log.createdBy !== currentUserId && (
                  <p className="text-xs text-ink-faint mt-1">
                    {'由 '}
                    {log.createdByName}
                    {' 記錄'}
                  </p>
                )}
              </div>

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
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/*
    The one place a per-row icon earns its keep: three log types interleave in a
    long scroll, and the glyph is what lets you find "the feeds" at a glance.

    擠奶因此不能掛餵奶的奶瓶：那一列的字已經寫著「擠奶」，圖示卻還說它是一餐，
    掃過去找餵奶的家長會停在自己的擠奶紀錄上——跟總量把它加進去是同一個錯誤。
    水滴是擠出來的量，不是喝進去的。

    但兩者共用奶黃色：擠奶是餵食家族的一員，不是第四種類型，形狀已經分得開。
    primary-dark 是 LittleSteps 的服務重點色，花在一個類型標記上會讓擠奶變成
    整份清單最搶眼的一列——正好是報告與總量都刻意不強調的那一種；它跟同一列的
    紅色刪除鍵也只差三度色相。
  */
const getLogIcon = (log: DailyLog) => {
  switch (log.type) {
    case 'feeding': {
      const Glyph = isPumpingLog(log) ? Droplets : Milk;

      return <Glyph className="w-5 h-5 text-butter-dark" />;
    }

    case 'sleep':
      return <Moon className="w-5 h-5 text-secondary-dark" />;
    case 'diaper':
      return <Baby className="w-5 h-5 text-mint-dark" />;
  }
};

const getLogTitle = (log: DailyLog) => {
  switch (log.type) {
    case 'feeding':
      // 一列寫著「餵奶：擠奶」，是把媽媽的產出當成寶寶的一餐顯示出來——
      // 跟總量把它加進去是同一個錯誤，只是發生在她真的會讀的那個畫面上。
      return isPumpingLog(log) ? '擠奶' : '餵奶';
    case 'sleep':
      return '睡眠';
    case 'diaper':
      return '尿布';
  }
};

function getLogDetails(log: DailyLog) {
  if (log.type === 'feeding') {
    return feedingDetails(log.data as FeedingData);
  }

  if (log.type === 'sleep') {
    return sleepDetails(log);
  }

  return diaperDetails(log.data as DiaperData);
}

function feedingDetails(data: FeedingData) {
  // 擠奶的類型字已經是這一列的標題，再印一次會變成「擠奶 · 擠奶」。
  const parts
    = data.feedingType === 'pumping' ? [] : [getFeedingTypeLabel(data.feedingType)];

  if (data.side) {
    parts.push(getFeedingSideLabel(data.side));
  }

  if (data.duration) {
    parts.push(`${data.duration}分鐘`);
  }

  // 擠奶的 ml 是擠出來的量，不是喝進去的——同一個單位，兩件事。
  if (data.amount) {
    parts.push(`${data.amount}ml`);
  }

  return parts.join(' · ');
}

function sleepDetails(log: DailyLog) {
  const data = log.data as SleepData;

  const parts = [
    data.endTime
      ? formatDuration(data.duration ?? calculateDuration(data.startTime, data.endTime))
      : isStaleOpenSleep(log)
        ? '還沒有結束時間'
        : '進行中',
  ];

  // undefined 是沒問到，0 是家長說沒醒——只有後者值得印出來。
  if (data.nightWakings !== undefined) {
    parts.push(`夜醒 ${data.nightWakings} 次`);
  }

  return parts.join(' · ');
}

function diaperDetails(data: DiaperData) {
  const parts = [getDiaperTypeLabel(data.type)];
  // 性狀只對大便有意義。舊資料存過對照表不認得的值，那種時候寧可只寫類型，
  // 也不要印出一個後面空著的分隔點。
  const consistency = getConsistencyLabel(data.consistency);

  if (consistency && (data.type === 'poop' || data.type === 'both')) {
    parts.push(consistency);
  }

  return parts.join(' · ');
}
