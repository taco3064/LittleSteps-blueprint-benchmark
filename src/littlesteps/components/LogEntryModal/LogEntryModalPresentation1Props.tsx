export interface LogEntryModalPresentation1Props {
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
}
