import type {
  DailyLog,
  FeedingData,
  SleepData,
  DiaperData,
} from '~app/domain/records';
import { dateTimeLocalToISO, calculateDuration } from '~app/domain/dateHelpers';
import type { LogFormState, LogEntryModalProps } from './logFormState';

function feedingPayload(form: LogFormState): FeedingData {
  const { feedingType, duration, amount, side, notes } = form;

  return {
    feedingType,
    duration: duration ? parseInt(duration) : undefined,
    amount: amount ? parseInt(amount) : undefined,
    // 哪一邊只對擠奶有意義；改成別的類型時不要留下上一次選的值。
    side: feedingType === 'pumping' && side ? side : undefined,
    notes: notes.trim() || undefined,
  };
}

function sleepPayload(form: LogFormState): SleepData {
  const { startTime, endTime, nightWakings, notes } = form;
  const parsedWakings = parseInt(nightWakings, 10);

  const sleepData: SleepData = {
    startTime: dateTimeLocalToISO(startTime),
    endTime: endTime ? dateTimeLocalToISO(endTime) : undefined,
    // 留白就是沒問到，不能存成 0：夜醒趨勢與睡眠分數都得分得出這兩件事。
    nightWakings: Number.isNaN(parsedWakings)
      ? undefined
      : Math.max(0, parsedWakings),
    notes: notes.trim() || undefined,
  };

  // Calculate duration if endTime is provided
  if (endTime) {
    sleepData.duration = calculateDuration(sleepData.startTime, sleepData.endTime!);
  }

  return sleepData;
}

function diaperPayload(form: LogFormState): DiaperData {
  const { diaperType, consistency, notes } = form;

  return {
    type: diaperType,
    consistency:
      diaperType === 'poop' || diaperType === 'both' ? consistency : undefined,
    notes: notes.trim() || undefined,
  };
}

export function logPayload(
  form: LogFormState,
  props: LogEntryModalProps,
): Omit<DailyLog, 'id'> {
  const { editingLog, logType } = props;

  const builders = {
    feeding: feedingPayload,
    sleep: sleepPayload,
    diaper: diaperPayload,
  };

  return {
    childId: '',
    type: logType,
    timestamp: dateTimeLocalToISO(
      logType === 'sleep' ? form.startTime : form.timestamp,
    ),
    data: builders[logType](form),
    createdAt: editingLog?.createdAt || new Date().toISOString(),
    updatedAt: editingLog ? new Date().toISOString() : undefined,
  };
}
