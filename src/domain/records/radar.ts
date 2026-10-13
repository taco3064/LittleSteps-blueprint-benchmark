// ============================================================
// LittleGuard（疫情雷達）
// ============================================================

/** 樣本可靠度。分母門檻見 spec §4.6：1,000 與 300。 */
export type RadarReliability = 'ok' | 'small' | 'insufficient';

export interface RadarCell {
  /** 每萬健保門診就診人次中的該病就診數。 */
  rate: number | null;
  /** 本週之前 8 週（不含本週）的 rate 中位數。 */
  trendBase: number | null;
  ratio: number | null;
  /** 本週該縣市 ÷ 全國同週。 */
  geoRatio: number | null;
  visits: number;
  denom: number;
  reliability: RadarReliability;
  /** 含本週在內的最近 8 週 rate。 */
  spark: (number | null)[];
}

export interface RadarData {
  week: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  verifiedOn: string;
  source: string;
  sourceUrls: string[];
  license: string;
  diseases: string[];
  ageBands: string[];
  calibration: {
    trendP25: number;
    /** 中位數。撐起「ratio 接近 1 就是平常」這個前提，radar.ts 的門檻註解引用它。 */
    trendP50: number;
    trendP75: number;
    trendP90: number;
    sampleSize: number;
  };
  national: Record<string, Record<string, { rate: number | null }>>;
  counties: Record<string, Record<string, Record<string, RadarCell>>>;
}
