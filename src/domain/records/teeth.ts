export type ToothJaw = 'upper' | 'lower';

export interface PrimaryTooth {
  id: string;
  /** 牙位名稱，例：上正中門齒 */
  name: string;
  jaw: ToothJaw;
  /** 由中線往外的順位 1-5，用於排出牙弓；左右各一顆共用同一個順位 */
  position: number;
  side: 'left' | 'right';
  /** 典型萌發月齡區間（含），僅供參考，個別差異大 */
  eruptFromMonth: number;
  eruptToMonth: number;
}

export interface ToothProgress {
  [toothId: string]: {
    erupted: boolean;
    eruptedDate?: string; // YYYY-MM-DD
  };
}
