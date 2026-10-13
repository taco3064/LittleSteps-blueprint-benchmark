import type {
  DailyLog,
  FeedingData,
  SleepData,
  DiaperData,
} from '~app/domain/records';
import {
  getCurrentDateTimeLocal,
  isoToDateTimeLocal,
} from '~app/domain/dateHelpers';
export interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logData: Omit<DailyLog, 'id'>) => Promise<void>;
  logType: 'feeding' | 'sleep' | 'diaper';
  editingLog?: DailyLog | null;
  /**
   * 這個孩子上一筆同類型的紀錄，用來預填新增表單。
   *
   * 表單原本每次都從 `breast_left` 和空白奶量開始，所以一位喝配方奶的家長
   * 一天要重打同樣的 120 八次，而且是凌晨三點單手抱著小孩打。這裡帶進來的是
   * 真的填進欄位的值，不是灰色提示：家長要看得見接下來會存進去什麼。
   */
  lastLog?: DailyLog | null;
}

export function emptyLogForm() {
  return {
    timestamp: getCurrentDateTimeLocal(),
    feedingType: 'breast_left' as FeedingData['feedingType'],
    duration: '',
    amount: '',
    side: '' as '' | NonNullable<FeedingData['side']>,
    startTime: getCurrentDateTimeLocal(),
    endTime: '',
    nightWakings: '',
    diaperType: 'pee' as DiaperData['type'],
    consistency: 'normal' as DiaperData['consistency'],
    notes: '',
    isSubmitting: false,
    error: null as string | null,
  };
}

export type LogFormState = ReturnType<typeof emptyLogForm>;

function feedingDefaults(data: FeedingData): Partial<LogFormState> {
  return {
    feedingType: data.feedingType,
    duration: data.duration?.toString() || '',
    amount: data.amount?.toString() || '',
    side: data.side ?? '',
    notes: data.notes || '',
  };
}

function sleepDefaults(data: SleepData) {
  return {
    startTime: isoToDateTimeLocal(data.startTime),
    endTime: data.endTime ? isoToDateTimeLocal(data.endTime) : '',
    nightWakings: data.nightWakings?.toString() ?? '',
    notes: data.notes || '',
  };
}

function diaperDefaults(data: DiaperData): Partial<LogFormState> {
  return {
    diaperType: data.type,
    consistency: data.consistency || 'normal',
    notes: data.notes || '',
  };
}

function previousDefaults(
  logType: LogEntryModalProps['logType'],
  lastLog?: DailyLog | null,
) {
  if (logType === 'feeding' && lastLog) {
    return { ...feedingDefaults(lastLog.data as FeedingData), notes: '' };
  }

  if (logType === 'diaper' && lastLog) {
    return { ...diaperDefaults(lastLog.data as DiaperData), notes: '' };
  }

  return {};
}

export function initializeLogForm(
  current: LogFormState,
  props: Pick<LogEntryModalProps, 'editingLog' | 'logType' | 'lastLog'>,
): LogFormState {
  const { editingLog, logType, lastLog } = props;

  if (!editingLog) {
    return { ...emptyLogForm(), ...previousDefaults(logType, lastLog) };
  }

  const defaults = {
    feeding: () => feedingDefaults(editingLog.data as FeedingData),
    sleep: () => sleepDefaults(editingLog.data as SleepData),
    diaper: () => diaperDefaults(editingLog.data as DiaperData),
  };

  return {
    ...current,
    ...defaults[logType](),
    timestamp: isoToDateTimeLocal(editingLog.timestamp),
    error: null,
    isSubmitting: false,
  };
}
