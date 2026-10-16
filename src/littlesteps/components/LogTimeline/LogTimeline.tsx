import { Droplets, Milk } from 'lucide-react';
import { isSameDay } from '~app/platform/domain/calendar';
import { DailyLog } from '~app/family/domain/familyRecords';
import { isPumpingLog } from '~app/littlesteps/domain/logHelpers';
import { getLogDetails } from './logDetails';
import {
  LogTimelinePresentation,
  LogTimelinePresentation1,
  LogTimelinePresentation2,
  LogTimelinePresentation3,
  LogTimelinePresentation4,
} from './LogTimelinePresentation';

interface LogTimelineProps {
  logs: DailyLog[];
  onEdit: (log: DailyLog) => void;
  onDelete: (logId: string, title: string) => void;
  /**
   * 目前登入者的 uid。只有別人記的那幾筆會標出記錄者——一個人自己用的時候，
   * 每一列都掛上自己的名字只是噪音。
   */
  currentUserId?: string | null;
  /** 要顯示哪一天。省略時是今天。 */
  date?: Date;
}

export default function LogTimeline({
  logs, onEdit, onDelete, currentUserId, date,
}: LogTimelineProps) {
  // Filter today's logs and sort by time (newest first)
  const shownDate = date ?? new Date();
  const isToday = isSameDay(shownDate, new Date());

  const todayLogs = logs
    .filter((log) => isSameDay(log.timestamp, shownDate))
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const handleDelete = (log: DailyLog) => {
    onDelete(log.id, `${getLogTitle(log)}記錄`);
  };

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

        return <LogTimelinePresentation Glyph={Glyph} />;
      }

      case 'sleep':
        return <LogTimelinePresentation1 />;
      case 'diaper':
        return <LogTimelinePresentation2 />;
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

  if (todayLogs.length === 0) {
    return <LogTimelinePresentation3 isToday={isToday} />;
  }

  return (
    <LogTimelinePresentation4
      todayLogs={todayLogs}
      getLogDetails={getLogDetails}
      getLogIcon={getLogIcon}
      getLogTitle={getLogTitle}
      currentUserId={currentUserId}
      onEdit={onEdit}
      handleDelete={handleDelete}
    />
  );
}
