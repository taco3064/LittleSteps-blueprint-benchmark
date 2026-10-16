import type { ScheduleStatus } from '../scheduleStatus';

export type MonthRange = '0-2' | '3-4' | '5-6' | '7-9' | '10-12';

export interface Milestone {
  id: string;
  monthRange: MonthRange;
  category: 'physical' | 'motor' | 'cognitive' | 'feeding';
  title: string;
  summary: string;
  details: string;
  tips: string[];
}

export type Category = 'physical' | 'motor' | 'cognitive' | 'feeding' | 'all';

// Care Guidelines Types
export interface GeneralSafetyItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface MonthlyCareGuide {
  month: number;
  title: string;
  category: 'physiological' | 'feeding' | 'safety';
  highlights: string[];
}

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

// Complementary Food Types
export interface FoodStage {
  level: number;
  name: string;
  ageRange: string;
  milkRatio: string;
  foodRatio: string;
  mealsPerDay: string;
  texture: string;
  keyPoints: string[];
  warnings?: string[];
}

export interface FoodProgressionByAge {
  ageRange: string;
  texture: string;
  frequency: string;
  purpose: string;
}

export interface FoodAllergyLevel {
  level: 'low' | 'medium' | 'high';
  ageRange: string;
  foods: string[];
}

export interface MonthlyFoodMenu {
  month: string;
  focus: string;
  foods: string[];
}

export interface FingerFoodGuideline {
  category: string;
  examples: string[];
}

export interface FoodPrinciple {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FoodWarning {
  id: string;
  title: string;
  description: string;
  icon: string;
  severity: 'danger' | 'warning' | 'info';
}

// Complementary Food Additional Types
export interface FeedingPrinciple {
  title: string;
  description: string;
}

export interface CookingTip {
  title: string;
  description: string;
}

export interface CookingTipCategory {
  category: string;
  tips: CookingTip[];
}

export interface FoodHandlingItem {
  food: string;
  canEat: boolean;
  note: string;
}

export interface FoodHandlingCategory {
  category: string;
  items: FoodHandlingItem[];
}

export interface FoodRestrictionItem {
  food: string;
  ageLimit: string;
  reason: string;
}

export interface FoodRestrictionCategory {
  category: string;
  items: FoodRestrictionItem[];
}

export interface FoodQAItem {
  question: string;
  answer: string;
}

export type MeasurementType = 'weight' | 'height' | 'headCircumference';

export type PercentileCategory = 'low' | 'normal' | 'high';

// WHO Growth Chart Standards (LMS method)
export interface WHOStandard {
  ageMonths: number;
  L: number; // Box-Cox transformation
  M: number; // Median
  S: number; // Coefficient of variation
}

// Wiki Types (shared presentational model; each sub-app owns its own category set)
export interface WikiCategoryColors {
  bg: string;
  text: string;
  pill: string;
}

export interface WikiArticle<Category extends string = string> {
  id: string;
  title: string;
  summary: string;
  category: Category;
  causes: string[];
  solutions: { step: string; detail: string }[];
  warningSignals: string[];
  relatedArticleIds: string[];
  icon: string;
}

// Baby Wiki (寶寶百科) — LittleSteps
export type WikiCategory
  = 'skin' | 'oral' | 'motor' | 'digestive' | 'fever' | 'sleep' | 'daily';

export type BabyWikiArticle = WikiArticle<WikiCategory>;

// Pregnancy Wiki (孕期知識庫) — LittleBloom
export type PregnancyWikiCategory
  = 'nutrition' | 'health' | 'symptoms' | 'checkup' | 'lifestyle';

export type PregnancyWikiArticle = WikiArticle<PregnancyWikiCategory>;

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

export type ToddlerTipCategory = 'safety' | 'feeding' | 'behavior' | 'health';

export interface ToddlerCareTip {
  ageBand: ToddlerAgeBand;
  category: ToddlerTipCategory;
  title: string;
  /** 3-4 條具體重點 */
  highlights: string[];
}

export type CareTaskKind
  = 'health-check' | 'dev-screening' | 'vaccine' | 'dental' | 'admin';

export interface CareTaskTemplate {
  id: string;
  kind: CareTaskKind;
  title: string;
  description: string;
  /** 建議施行月齡；到期日 = birthday + dueMonth */
  dueMonth: number;
  /** 可執行區間起（月齡） */
  fromMonth: number;
  /** 可執行區間迄（月齡），逾此即 overdue */
  toMonth: number;
  /** 法源／出處 */
  source: string;
  /**
   * 若完成狀態已由 LittleSteps 的 vaccineProgress 承載，指向該筆記錄。
   * 必須與 vaccineDose 成對出現。
   */
  vaccineId?: string;
  /** 對應 VaccineSchedule.currentDose；單靠 vaccineId 無法分辨劑次 */
  vaccineDose?: number;
}

/**
 * 照護任務的狀態就是共用的排程狀態（common/utils/scheduleStatus）。
 * 別名保留是為了不動既有的匯入點；成員不再各寫一份。
 */
export type CareTaskStatus = ScheduleStatus;

export interface ResolvedCareTask {
  template: CareTaskTemplate;
  dueDate: string; // YYYY-MM-DD
  windowEnd: string; // YYYY-MM-DD
  status: CareTaskStatus;
  /** 距建議日的天數；負數表示已過 */
  daysUntilDue: number;
  completedDate?: string;
}

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

// Toddler Wiki (幼兒百科) — LittleExplorer
export type ToddlerWikiCategory
  = | 'toilet' // 如廁訓練
    | 'language' // 語言發展
    | 'emotion' // 情緒與行為
    | 'eating' // 飲食與挑食
    | 'sleep' // 睡眠轉換
    | 'safety' // 學步期安全
    | 'health' // 生病與就醫
    | 'preschool';
// 入園與社交

/**
 * 幼兒百科文章。
 *
 * `ageRange` 是這篇最相關的月齡區間，含頭不含尾，起始值對齊
 * `TODDLER_AGE_BANDS` 的界線（12/15/18/24/30）。橫跨整個幼兒期的常備知識
 * 用 `[12, 36]`。用途只有排序與標籤——任何年齡都讀得到每一篇。
 */
export interface ToddlerWikiArticle extends WikiArticle<ToddlerWikiCategory> {
  ageRange: [number, number];
}
