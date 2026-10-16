import { DailyLog, FeedingData } from '~app/family/domain/familyRecords';

export function fillFeedingDraft({
  editingLog, setFeedingType, setDuration, setAmount, setSide, setNotes,
}: {
  editingLog: DailyLog;
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
  setDuration: import('react').Dispatch<import('react').SetStateAction<string>>;
  setAmount: import('react').Dispatch<import('react').SetStateAction<string>>;
  setSide: import('react').Dispatch<
    import('react').SetStateAction<
      '' | NonNullable<'left' | 'right' | 'both' | undefined>
    >
  >;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
}) {
  const data = editingLog.data as FeedingData;

  setFeedingType(data.feedingType);
  setDuration(data.duration?.toString() || '');
  setAmount(data.amount?.toString() || '');
  setSide(data.side ?? '');
  setNotes(data.notes || '');
}
