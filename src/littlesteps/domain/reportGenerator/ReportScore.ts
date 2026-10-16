export interface ReportScore {
  /**
   * 樣本太少時沒有分數。
   *
   * 這三個分數量的都是「天與天之間差多少」，兩天的記錄再怎麼算都得不出規律，
   * 只會把偶然講成結論——而 0 分在畫面上是紅色的「需注意」。
   */
  score: number | null;
  label: string;
  /** 這個分數是用幾天的記錄算出來的 */
  loggedDays: number;
}
