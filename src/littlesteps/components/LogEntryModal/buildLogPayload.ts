import { calculateDuration, dateTimeLocalToISO } from '~app/platform/domain/calendar';
import type {
  DiaperData,
  FeedingData,
  SleepData,
} from '~app/family/domain/familyRecords';

interface LogDraft {
  logType: 'feeding' | 'sleep' | 'diaper';
  timestamp: string;
  feedingType: FeedingData['feedingType'];
  duration: string;
  amount: string;
  side: '' | NonNullable<FeedingData['side']>;
  notes: string;
  startTime: string;
  endTime: string;
  nightWakings: string;
  diaperType: DiaperData['type'];
  consistency: DiaperData['consistency'];
}

function feedingPayload(draft: LogDraft) {
  const data: FeedingData = {
    feedingType: draft.feedingType,
    duration: draft.duration ? parseInt(draft.duration) : undefined,
    amount: draft.amount ? parseInt(draft.amount) : undefined,
    side: draft.feedingType === 'pumping' && draft.side ? draft.side : undefined,
    notes: draft.notes.trim() || undefined,
  };

  return { data, finalTimestamp: dateTimeLocalToISO(draft.timestamp) };
}

function sleepPayload(draft: LogDraft) {
  const finalTimestamp = dateTimeLocalToISO(draft.startTime);
  const parsedWakings = parseInt(draft.nightWakings, 10);

  const data: SleepData = {
    startTime: dateTimeLocalToISO(draft.startTime),
    endTime: draft.endTime ? dateTimeLocalToISO(draft.endTime) : undefined,
    nightWakings: Number.isNaN(parsedWakings)
      ? undefined
      : Math.max(0, parsedWakings),
    notes: draft.notes.trim() || undefined,
  };

  if (draft.endTime) {
    data.duration = calculateDuration(data.startTime, data.endTime!);
  }

  return { data, finalTimestamp };
}

function diaperPayload(draft: LogDraft) {
  const data: DiaperData = {
    type: draft.diaperType,
    consistency:
      draft.diaperType === 'poop' || draft.diaperType === 'both'
        ? draft.consistency
        : undefined,
    notes: draft.notes.trim() || undefined,
  };

  return { data, finalTimestamp: dateTimeLocalToISO(draft.timestamp) };
}

export function buildLogPayload(draft: LogDraft) {
  if (draft.logType === 'feeding') {
    return feedingPayload(draft);
  }

  if (draft.logType === 'sleep') {
    return sleepPayload(draft);
  }

  return diaperPayload(draft);
}
