import { DailyLog } from '~app/family/domain/familyRecords';

export interface LogEntryModalPresentationProps {
  isOpen: boolean;
  onClose: () => void;
  getTitle: () => string;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  logType: 'feeding' | 'sleep' | 'diaper';
  timestamp: string;
  setTimestamp: import('react').Dispatch<import('react').SetStateAction<string>>;
  feedingType:
    | 'solid'
    | 'breast_left'
    | 'breast_right'
    | 'breast_both'
    | 'breast_milk_bottle'
    | 'formula'
    | 'pumping';
  setFeedingType: import('react').Dispatch<
    import('react').SetStateAction<
      | 'solid'
      | 'breast_left'
      | 'breast_right'
      | 'breast_both'
      | 'breast_milk_bottle'
      | 'formula'
      | 'pumping'
    >
  >;
  isPumping: boolean;
  side: '' | NonNullable<'left' | 'right' | 'both' | undefined>;
  setSide: import('react').Dispatch<
    import('react').SetStateAction<
      '' | NonNullable<'left' | 'right' | 'both' | undefined>
    >
  >;
  duration: string;
  setDuration: import('react').Dispatch<import('react').SetStateAction<string>>;
  amount: string;
  setAmount: import('react').Dispatch<import('react').SetStateAction<string>>;
  startTime: string;
  setStartTime: import('react').Dispatch<import('react').SetStateAction<string>>;
  endTime: string;
  setEndTime: import('react').Dispatch<import('react').SetStateAction<string>>;
  hasSleepRange: boolean;
  sleepRangeError:
    '結束時間要晚於開始時間；睡到隔天的話，結束時間請選隔天的日期。' | null;
  stepNightWakings: (delta: number) => void;
  nightWakings: string;
  setNightWakings: import('react').Dispatch<import('react').SetStateAction<string>>;
  diaperType: 'both' | 'pee' | 'poop';
  setDiaperType: import('react').Dispatch<
    import('react').SetStateAction<'both' | 'pee' | 'poop'>
  >;
  consistency: 'normal' | 'soft' | 'hard' | undefined;
  setConsistency: import('react').Dispatch<
    import('react').SetStateAction<'normal' | 'soft' | 'hard' | undefined>
  >;
  notes: string;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
  isSubmitting: boolean;
  error: string | null;
  editingLog: DailyLog | null | undefined;
}
