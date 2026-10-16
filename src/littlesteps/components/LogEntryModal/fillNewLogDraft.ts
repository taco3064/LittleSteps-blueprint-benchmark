import { getCurrentDateTimeLocal } from '~app/platform/domain/calendar';
import { DailyLog, DiaperData, FeedingData } from '~app/family/domain/familyRecords';

export function fillNewLogDraft({
  logType, lastLog, setTimestamp, setStartTime, setEndTime, setNightWakings,
  setNotes, setDuration, setAmount, setFeedingType, setSide, setDiaperType,
  setConsistency,
}: {
  logType: 'feeding' | 'sleep' | 'diaper';
  lastLog: DailyLog | null | undefined;
  setTimestamp: import('react').Dispatch<import('react').SetStateAction<string>>;
  setStartTime: import('react').Dispatch<import('react').SetStateAction<string>>;
  setEndTime: import('react').Dispatch<import('react').SetStateAction<string>>;
  setNightWakings: import('react').Dispatch<import('react').SetStateAction<string>>;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
  setDuration: import('react').Dispatch<import('react').SetStateAction<string>>;
  setAmount: import('react').Dispatch<import('react').SetStateAction<string>>;
  setFeedingType: import('react').Dispatch<
    import('react').SetStateAction<
      | 'breast_left'
      | 'breast_right'
      | 'breast_both'
      | 'breast_milk_bottle'
      | 'formula'
      | 'solid'
      | 'pumping'
    >
  >;
  setSide: import('react').Dispatch<
    import('react').SetStateAction<
      '' | NonNullable<'left' | 'right' | 'both' | undefined>
    >
  >;
  setDiaperType: import('react').Dispatch<
    import('react').SetStateAction<'both' | 'pee' | 'poop'>
  >;
  setConsistency: import('react').Dispatch<
    import('react').SetStateAction<'normal' | 'soft' | 'hard' | undefined>
  >;
}) {
  /*
        新增：時間永遠是現在，其餘沿用上一筆同類型的紀錄。備註不沿用——那是
        當下那一次的事，重複出現只會變成錯的敘述。第一次記錄的孩子沒有上一筆，
        就回到原本的預設值，不需要空狀態也不該報錯。
      */
  const lastFeeding
    = logType === 'feeding' ? (lastLog?.data as FeedingData | undefined) : undefined;

  const lastDiaper
    = logType === 'diaper' ? (lastLog?.data as DiaperData | undefined) : undefined;

  const feeding = feedingDefaults(lastFeeding);
  const diaper = diaperDefaults(lastDiaper);

  setTimestamp(getCurrentDateTimeLocal());
  setStartTime(getCurrentDateTimeLocal());
  setEndTime('');
  setNightWakings('');
  setNotes('');
  setDuration(feeding.duration);
  setAmount(feeding.amount);
  setFeedingType(feeding.feedingType);
  setSide(feeding.side);
  setDiaperType(diaper.type);
  setConsistency(diaper.consistency);
}

function feedingDefaults(data?: FeedingData) {
  return {
    duration: data?.duration?.toString() ?? '',
    amount: data?.amount?.toString() ?? '',
    feedingType: data?.feedingType ?? 'breast_left',
    side: data?.side ?? ('' as const),
  };
}

function diaperDefaults(data?: DiaperData) {
  return { type: data?.type ?? 'pee', consistency: data?.consistency ?? 'normal' };
}
