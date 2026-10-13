// Growth Charts Types (生長曲線)
export interface GrowthRecord {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  height?: number; // cm
  headCircumference?: number; // cm
  /**
   * 讀取時由 useGrowthTracking 依孩子檔案算出來，寫入端不存。資料庫裡的舊
   * 紀錄可能還帶著寫入當下算的那一份，算不出來時會拿它當備援。
   */
  percentile?: {
    weight?: number; // 0-100
    height?: number;
    headCircumference?: number;
  };
  notes?: string;
}

export type MeasurementType = 'weight' | 'height' | 'headCircumference';

export type Gender = 'male' | 'female';

export type PercentileCategory = 'low' | 'normal' | 'high';

// WHO Growth Chart Standards (LMS method)
export interface WHOStandard {
  ageMonths: number;
  L: number; // Box-Cox transformation
  M: number; // Median
  S: number; // Coefficient of variation
}
