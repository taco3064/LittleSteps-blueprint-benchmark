// Vaccine Types
/**
 * 一劑疫苗由誰出錢。
 *
 * 原本是 "public" | "private"，裝不下台灣真正的付費方式。最貴的一個例子是
 * RSV 單株抗體：國內核准兩種，其中一種「1 歲以下高危險群幼兒接種具健保給付
 * 條件」。壓成「自費」之後，早產兒的家長讀到的是一筆兩萬多元的自付額，然後
 * 放棄——而那正是最需要打的那群孩子。
 */
export type VaccineFunding
  /** 疾管署公費常規接種，符合年齡就免費 */
  = | 'national'
  /** 健保有條件給付，要符合 eligibility 寫的條件才給付 */
    | 'nhi-conditional'
  /** 自費 */
    | 'self-paid'
  /** 各縣市加碼，給付與否看戶籍地衛生局 */
    | 'local-varies';

export interface VaccineSchedule {
  id: string;
  name: string;
  timing: string;
  funding: VaccineFunding;
  /**
   * 誰符合條件。'nhi-conditional' 與 'local-varies' 一定要寫，並且逐字引用
   * 來源的用語——改寫過的條件在診間對不上，等於沒有條件。
   */
  eligibility?: string;
  /**
   * 已公告、但還沒生效的付費方式改變日期（YYYY-MM-DD）。
   *
   * funding 寫的一律是「今天」怎麼付。政策改變的日期一旦已經公告，資料檔的
   * 查證日期就擋不住它——改變日落在保鮮期內，檔案到那天仍然算「新鮮」，
   * 而 funding 已經是錯的。填了這一欄，測試會在日期過了之後轉紅，把一顆
   * 安靜的定時炸彈換成一條會叫的紅線。
   */
  fundingChangesOn?: string;
  /** 這一劑的出處。逐劑標，沒有出處的劑次不該存在。 */
  sourceUrl: string;
  ageInMonths?: number;
  ageLabel: string;
  doses: number;
  currentDose?: number;
  sideEffects: string[];
  notes?: string;
}

export interface VaccineSideEffect {
  category: string;
  icon: string;
  reactions: {
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    response: string;
  }[];
}

export interface VaccineEmergency {
  id: string;
  symptom: string;
  icon: string;
  action: string;
}
