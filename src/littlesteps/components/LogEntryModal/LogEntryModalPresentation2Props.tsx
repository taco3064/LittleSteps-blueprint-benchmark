export interface LogEntryModalPresentation2Props {
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
}
