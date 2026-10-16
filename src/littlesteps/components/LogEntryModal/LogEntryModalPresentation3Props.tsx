export interface LogEntryModalPresentation3Props {
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
}
