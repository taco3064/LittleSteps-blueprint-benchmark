import { isoToDateTimeLocal } from '~app/platform/domain/calendar';
import { DailyLog, SleepData } from '~app/family/domain/familyRecords';

export function fillSleepDraft({
  editingLog, setStartTime, setEndTime, setNightWakings, setNotes,
}: {
  editingLog: DailyLog;
  setStartTime: import('react').Dispatch<import('react').SetStateAction<string>>;
  setEndTime: import('react').Dispatch<import('react').SetStateAction<string>>;
  setNightWakings: import('react').Dispatch<import('react').SetStateAction<string>>;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
}) {
  const data = editingLog.data as SleepData;

  setStartTime(isoToDateTimeLocal(data.startTime));
  setEndTime(data.endTime ? isoToDateTimeLocal(data.endTime) : '');
  setNightWakings(data.nightWakings?.toString() ?? '');
  setNotes(data.notes || '');
}
