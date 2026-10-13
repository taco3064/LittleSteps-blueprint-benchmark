import { useMemo, useState } from 'react';
import NoChildNotice from '~app/components/NoChildNotice';
import { bandForMonths } from '~app/domain/ageBands';
import { calculateAge } from '~app/domain/dateHelpers';
import { toddlerCareTips } from '~app/domain/monthlyTips';
import { splitOverdueByProfileStart } from '~app/domain/profileHistory';
import type {
  CareTaskRecord,
  ChildProfile,
  ResolvedCareTask,
  ToddlerAgeBand,
} from '~app/domain/records';
import { useReminderForm } from './useReminderForm';

const UPCOMING_HORIZON_DAYS = 90;

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */
const SECTIONS: {
  status: ResolvedCareTask['status'];
  title: string;
  accent: string;
}[] = [
  {
    status: 'overdue',
    title: '已經逾期',
    accent: 'bg-explorer-clay/10 border border-explorer-clay/40',
  },
  { status: 'due', title: '現在可以做', accent: '' },
  { status: 'upcoming', title: '接下來 90 天', accent: '' },
];

export interface RemindersPageProps {
  currentChild?: ChildProfile | null;
  tasks: ResolvedCareTask[];
  reminderBadge?: number;
  onCompleteTask: (record: CareTaskRecord) => Promise<void>;
  /**
   * 取消一筆照護記錄。沒有它，日期填錯的完成就永遠改不回來——完成的項目會
   * 被這一頁篩掉，家長再也看不到、也碰不到那筆紀錄。
   */
  onUndoTask?: (taskId: string) => Promise<void>;
  /**
   * 新增／加入寶寶。LittleExplorer 自己開新增視窗，不把家長送去 LittleSteps
   * ——共用的是帳號與孩子資料，不是彼此的畫面。
   */
  onAddChild: React.ComponentProps<typeof NoChildNotice>['onAddChild'];
  onJoinChild?: (uuid: string) => Promise<void>;
}

export function useReminderModel(props: RemindersPageProps) {
  const { currentChild, tasks } = props;

  const ageMonths = currentChild ? calculateAge(currentChild.birthday) : 0;
  const [band, setBand] = useState<ToddlerAgeBand>(() => bandForMonths(ageMonths));
  const [historyOpen, setHistoryOpen] = useState(false);
  const form = useReminderForm(props);

  const visible = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.status === 'overdue'
          || task.status === 'due'
          || (task.status === 'upcoming' && task.daysUntilDue <= UPCOMING_HORIZON_DAYS),
      ),
    [tasks],
  );

  /*
   * 完成的項目要留得看得見。原本 visible 把 done 濾掉，於是一按下標記完成
   * 那一列就從畫面上消失——日期填錯也沒有任何入口可以改。
   */
  const done = useMemo(
    () => tasks.filter((task) => task.status === 'done'),
    [tasks],
  );

  /* 建檔之後才到期的才是真的逾期；建檔前的只是 app 沒有那段紀錄。 */
  const { overdue, missingHistory } = useMemo(
    () => splitOverdueByProfileStart(visible, currentChild?.createdAt),
    [visible, currentChild?.createdAt],
  );

  const sections = useMemo(
    () =>
      SECTIONS.map(({ status, title, accent }) => ({
        status,
        title,
        accent,
        rows:
          status === 'overdue'
            ? overdue
            : visible.filter((task) => task.status === status),
      })).filter(({ rows }) => rows.length > 0),
    [overdue, visible],
  );

  /* 空狀態與匯出都只看可行動的項目：建檔前的舊項目不該塞進家長的行事曆。 */
  const actionable = useMemo(() => sections.flatMap(({ rows }) => rows), [sections]);

  const bandTips = useMemo(
    () => toddlerCareTips.filter((tip) => tip.ageBand === band),
    [band],
  );

  return {
    ...props,
    ...form,
    ageMonths,
    band,
    setBand,
    historyOpen,
    setHistoryOpen,
    visible,
    done,
    overdue,
    missingHistory,
    sections,
    actionable,
    bandTips,
  };
}

export type ReminderModel = ReturnType<typeof useReminderModel>;
