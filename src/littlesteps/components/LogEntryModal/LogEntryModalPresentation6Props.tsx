export interface LogEntryModalPresentation6Props {
  timestamp: string;
  setTimestamp: import('react').Dispatch<import('react').SetStateAction<string>>;
  diaperType: 'both' | 'pee' | 'poop';
  setDiaperType: import('react').Dispatch<
    import('react').SetStateAction<'both' | 'pee' | 'poop'>
  >;
  consistency: 'normal' | 'soft' | 'hard' | undefined;
  setConsistency: import('react').Dispatch<
    import('react').SetStateAction<'normal' | 'soft' | 'hard' | undefined>
  >;
}
