// ============================================================
// LittleExplorer（幼兒期 1-3 歲）
// ============================================================

export type ToddlerAgeBand = '12-15' | '15-18' | '18-24' | '24-30' | '30-36';

export type DevelopmentDomain
  = | 'gross-motor' // 粗動作
    | 'fine-motor' // 細動作
    | 'language' // 語言溝通
    | 'cognitive' // 認知
    | 'social';
// 身邊處理與社會性

export interface DevelopmentCheckItem {
  id: string;
  ageBand: ToddlerAgeBand;
  domain: DevelopmentDomain;
  /** 家長可直接判斷的題目 */
  title: string;
  /** 觀察情境與判準 */
  detail: string;
  /** 在家可以怎麼練 */
  tips: string[];
}

export interface DevelopmentWarning {
  ageBand: ToddlerAgeBand;
  /** 以「缺席」描述的警訊，例：「18 個月仍不會獨立行走」 */
  signals: string[];
  /** 轉介建議 */
  action: string;
}

export interface DevelopmentCheckProgress {
  [checkItemId: string]: {
    achieved: boolean;
    achievedDate?: string; // YYYY-MM-DD
  };
}

export type ToddlerTipCategory = 'safety' | 'feeding' | 'behavior' | 'health';

export interface ToddlerCareTip {
  ageBand: ToddlerAgeBand;
  category: ToddlerTipCategory;
  title: string;
  /** 3-4 條具體重點 */
  highlights: string[];
}
