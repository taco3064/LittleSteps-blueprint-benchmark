/**
 * 台灣公費產前檢查時程與孕期關鍵檢查。
 *
 * 全部為可由末次月經（LMP）精算的法定／官方建議時程，不含推測性內容。
 *
 * 時程查核（2026-08 對照官方頁面）：
 * - 公費產檢次數：自 110/7/1 起由 10 次調升為 **14 次**，並新增妊娠糖尿病篩檢、
 *   貧血檢驗與 2 次一般超音波（合計公費超音波 3 次）。新增的 4 次產檢分別落在
 *   妊娠第 8、24、30、37 週。
 *   衛生福利部「擴大補助產檢服務 7月1日正式上路」（110-06-30）
 *   https://www.mohw.gov.tw/cp-5017-61688-1.html
 * - 逐次建議週數與可併同申報的就醫序號，以「附表 2.2 產前檢查服務對象、時程、
 *   服務內容及補助金額」為準：第 1 次(第 8 週)、第 2 次(第 12 週)、第 3 次(第 16 週)、
 *   第 4 次(第 20 週)、第 5 次(第 24 週)、第 6 次(第 28 週)、第 7 次(第 30 週)、
 *   第 8 次(第 32 週)、第 9 次(第 34 週)、第 10 次(第 36 週)、第 11 次(第 37 週)、
 *   第 12 次(第 38 週)、第 13 次(第 39 週)、第 14 次(第 40 週)。
 *   https://www.tma.tw/files/meeting/N20211221153120_002.pdf
 * - 公費超音波 3 次：第 8-16 週、第 20 週前後（可併第 4-7 次產檢申報）、
 *   第 32 週後（可併第 8-14 次產檢申報）。同上附表 2.2。
 * - 貧血檢驗與妊娠糖尿病篩檢：妊娠第 24-28 週（可併第 5-6 次產檢申報）。同上附表 2.2。
 * - 產前乙型鏈球菌篩檢：妊娠第 35-37 週 1 次，每案補助 500 元（自 101/4/15 起全面補助）。
 *   國民健康署「孕婦乙型鏈球菌篩檢」https://www.hpa.gov.tw/Pages/List.aspx?nodeid=196
 * - 海洋性貧血（地中海型貧血）初篩：公費第 1 次血液常規（懷孕第 12 週前）中的
 *   平均紅血球體積 MCV ≦ 80 fL 者，須安排配偶檢查。
 *   衛生福利部「帶因夫妻孕期接受檢查，防治重型海洋性貧血兒」
 *   https://www.mohw.gov.tw/cp-2772-12164-1.html
 * - 第一孕期唐氏症篩檢（初唐）與胎兒頸部透明帶（NT）：妊娠 11-13+6 週，頭臀長 45-84 mm。
 *   中國醫藥大學附設醫院「唐氏症篩檢」https://www.cmuh.cmu.edu.tw/HealthEdus/Detail?no=5256
 * - 早發型子癲前症風險評估：與第一孕期篩檢同時進行；高風險者須於**妊娠 16 週前**
 *   開始每日低劑量阿斯匹靈 80-100 mg。
 *   國泰綜合醫院婦產科「子癲前症（妊娠毒血症）」衛教
 *   https://www.cgh.org.tw/ec99/rwd1320/allphoto/5000/588.pdf
 * - 第二孕期四指標母血唐氏症篩檢（中唐）：妊娠 15-20 週。同上中國醫藥大學附設醫院衛教。
 * - 羊膜穿刺：妊娠 16-18 週為最佳時機；34 歲以上等高風險孕婦補助 5,000 元，
 *   低收入戶或醫療資源不足地區最高 8,500 元。
 *   衛生福利部「高齡孕婦逐年增加 產前遺傳診斷補助更安心」
 *   https://www.mohw.gov.tw/cp-4634-51856-1.html
 * - 高層次超音波（level II）：建議妊娠 20-24 週進行，自費。
 *   國民健康署孕產婦關懷網站「準媽媽檢查篇 高層次超音波檢查說明」
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=3574&type=01
 * - 孕婦 Tdap（減量破傷風白喉非細胞性百日咳混合疫苗）：每次懷孕第 28-36 週自費接種 1 劑，
 *   部分縣市另有補助。
 *   衛生福利部疾病管制署「破傷風、白喉及百日咳相關疫苗」
 *   https://www.cdc.gov.tw/Category/Page/MXy9TPGNNXMS_rzotG7xzQ
 *
 * 週數定義：fromWeek / dueWeek / toWeek 皆為「已完成的妊娠週數」，與
 * `weeksPregnant()` 同一把尺。toWeek 代表該週仍可執行，故 toWeek = 37
 * 對應到臨床寫法的 37w6d。
 */

export type PrenatalItemKind = 'checkup' | 'ultrasound' | 'screening' | 'vaccine';

export interface PrenatalCheckupTemplate {
  id: string;
  kind: PrenatalItemKind;
  /** 第幾次公費產檢；非產檢項目留空 */
  visitNumber?: number;
  title: string;
  description: string;
  /** 建議週數 */
  dueWeek: number;
  /** 可執行週數區間 */
  fromWeek: number;
  toWeek: number;
  source: string;
}

export const prenatalItemKindLabels: Record<PrenatalItemKind, string> = {
  checkup: '公費產檢',
  ultrasound: '超音波',
  screening: '篩檢',
  vaccine: '疫苗接種',
};

const HPA_SCHEDULE
  = '衛生福利部國民健康署 — 產前檢查服務對象、時程、服務內容及補助金額（附表 2.2）';

/**
 * 14 次公費產檢。
 *
 * 每次的可執行區間以「本次建議週數起、到下次建議週數前一週止」表示：
 * 官方僅公告建議週數與孕期分期（第 1-2 次未滿 13 週、第 3-6 次 13-28 週、
 * 第 7-14 次 29 週以上），實務上準媽咪只要在下一次產檢前完成即可。
 * 第 1 次往前放寬到第 6 週（多數人此時才驗出懷孕並領到孕婦健康手冊），
 * 第 14 次往後開到第 42 週（37-42 週均為正常生產期）。
 */
const checkups: PrenatalCheckupTemplate[] = [
  {
    id: 'prenatal-visit-1',
    kind: 'checkup',
    visitNumber: 1,
    title: '第 1 次公費產檢（第 8 週）',
    description:
      '例行檢查（問診、體重、血壓、尿蛋白、尿糖），並提供流產徵兆、高危險妊娠與孕期營養衛教指導。記得帶健保卡與孕婦健康手冊。',
    dueWeek: 8,
    fromWeek: 6,
    toWeek: 11,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-2',
    kind: 'checkup',
    visitNumber: 2,
    title: '第 2 次公費產檢（第 12 週）',
    description:
      '本次是抽血大關：血液常規（含 MCV）、血型、Rh 因子、德國麻疹抗體、B 型肝炎血清標誌、梅毒（VDRL／RPR）與尿液常規，'
      + '另含家族史與身體檢查。德國麻疹抗體陰性者，產後可免費接種 1 劑 MMR 疫苗。',
    dueWeek: 12,
    fromWeek: 12,
    toWeek: 15,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-3',
    kind: 'checkup',
    visitNumber: 3,
    title: '第 3 次公費產檢（第 16 週）',
    description: '例行檢查，並提供早產防治衛教指導。',
    dueWeek: 16,
    fromWeek: 16,
    toWeek: 19,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-4',
    kind: 'checkup',
    visitNumber: 4,
    title: '第 4 次公費產檢（第 20 週）',
    description:
      '例行檢查，並提供早產防治衛教指導。第 2 次公費超音波通常安排在這一次。',
    dueWeek: 20,
    fromWeek: 20,
    toWeek: 23,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-5',
    kind: 'checkup',
    visitNumber: 5,
    title: '第 5 次公費產檢（第 24 週）',
    description:
      '例行檢查，並提供早產徵兆及孕期營養衛教指導。妊娠糖尿病篩檢與貧血檢驗可於本次或第 6 次一併完成。',
    dueWeek: 24,
    fromWeek: 24,
    toWeek: 27,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-6',
    kind: 'checkup',
    visitNumber: 6,
    title: '第 6 次公費產檢（第 28 週）',
    description: '例行檢查。自本次起改為每 2 週產檢 1 次。',
    dueWeek: 28,
    fromWeek: 28,
    toWeek: 29,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-7',
    kind: 'checkup',
    visitNumber: 7,
    title: '第 7 次公費產檢（第 30 週）',
    description:
      '例行檢查。第 29 週起屬妊娠第 3 期，後期產前健康照護衛教指導可搭配第 7 至第 14 次任 1 次執行。',
    dueWeek: 30,
    fromWeek: 30,
    toWeek: 31,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-8',
    kind: 'checkup',
    visitNumber: 8,
    title: '第 8 次公費產檢（第 32 週）',
    description:
      '例行檢查，並於妊娠 32 週前後再做 1 次梅毒（VDRL）等實驗室檢驗。第 3 次公費超音波可自本次起安排。',
    dueWeek: 32,
    fromWeek: 32,
    toWeek: 33,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-9',
    kind: 'checkup',
    visitNumber: 9,
    title: '第 9 次公費產檢（第 34 週）',
    description: '例行檢查。乙型鏈球菌篩檢可於第 9 至第 12 次產檢擇 1 次搭配執行。',
    dueWeek: 34,
    fromWeek: 34,
    toWeek: 35,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-10',
    kind: 'checkup',
    visitNumber: 10,
    title: '第 10 次公費產檢（第 36 週）',
    description:
      '例行檢查。自第 36 週起改為每週產檢 1 次，可與醫師確認生產方式與待產包準備。',
    dueWeek: 36,
    fromWeek: 36,
    toWeek: 36,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-11',
    kind: 'checkup',
    visitNumber: 11,
    title: '第 11 次公費產檢（第 37 週）',
    description: '例行檢查。第 37 週起已屬足月，請留意產兆並確認就醫動線。',
    dueWeek: 37,
    fromWeek: 37,
    toWeek: 37,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-12',
    kind: 'checkup',
    visitNumber: 12,
    title: '第 12 次公費產檢（第 38 週）',
    description: '例行檢查，含胎心音、胎位與水腫評估。',
    dueWeek: 38,
    fromWeek: 38,
    toWeek: 38,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-13',
    kind: 'checkup',
    visitNumber: 13,
    title: '第 13 次公費產檢（第 39 週）',
    description: '例行檢查，密切追蹤胎動與宮縮情形。',
    dueWeek: 39,
    fromWeek: 39,
    toWeek: 39,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-visit-14',
    kind: 'checkup',
    visitNumber: 14,
    title: '第 14 次公費產檢（第 40 週）',
    description:
      '最後 1 次公費產檢。37-42 週均為正常生產期；若超過 40 週仍有產檢需求，醫療院所可於第 41、42 週向國民健康署專案申請。',
    dueWeek: 40,
    fromWeek: 40,
    toWeek: 42,
    source: HPA_SCHEDULE,
  },
];

/** 公費超音波（3 次）與自費高層次超音波。 */
const ultrasounds: PrenatalCheckupTemplate[] = [
  {
    id: 'prenatal-ultrasound-1',
    kind: 'ultrasound',
    title: '第 1 次公費超音波（第 8-16 週）',
    description:
      '確定胎兒心跳、評估著床位置、胎數、胎兒大小並校正預產期。可併同第 1 至第 3 次產檢申報。',
    dueWeek: 8,
    fromWeek: 8,
    toWeek: 16,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-ultrasound-2',
    kind: 'ultrasound',
    title: '第 2 次公費超音波（第 20 週前後）',
    description:
      '檢查胎數、胎兒大小、心跳、胎盤位置與羊水量。可併同第 4 至第 7 次產檢申報。',
    dueWeek: 20,
    fromWeek: 18,
    toWeek: 30,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-ultrasound-3',
    kind: 'ultrasound',
    title: '第 3 次公費超音波（第 32 週後）',
    description:
      '確認胎位、胎兒大小、胎盤位置與羊水量，作為生產方式的判斷依據。可併同第 8 至第 14 次產檢申報。',
    dueWeek: 32,
    fromWeek: 32,
    toWeek: 40,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-anomaly-scan',
    kind: 'ultrasound',
    title: '高層次超音波（第 20-24 週）',
    description:
      '自費。由專科醫師系統性檢查胎兒腦部、頭頸部、心臟、胸腹部、脊椎、四肢與臍帶胎盤，約需半小時至 1 小時。'
      + '週數過大時胎兒肢體重疊會降低判讀品質，錯過就補不回來，須提前預約。無法診斷唐氏症等染色體異常。',
    dueWeek: 20,
    fromWeek: 20,
    toWeek: 24,
    source: '衛生福利部國民健康署孕產婦關懷網站 — 準媽媽檢查篇 高層次超音波檢查說明',
  },
];

/** 有硬性週數窗口、錯過就無法補做的篩檢。 */
const screenings: PrenatalCheckupTemplate[] = [
  {
    id: 'prenatal-thalassemia',
    kind: 'screening',
    title: '海洋性貧血（地中海型貧血）初篩',
    description:
      '公費，包含在第 1 次抽血的血液常規中。平均紅血球體積 MCV ≦ 80 fL 時，須再安排準爸爸抽血；若雙方 MCV 均 ≦ '
      + '80 fL，須進一步做同型帶因者檢查。夫妻為同型帶因者時，胎兒須接受產前遺傳診斷（甲型約第 10 週絨毛採樣、乙型可於 '
      + '16-20 週羊膜穿刺），因此愈早驗完愈有時間反應。',
    dueWeek: 12,
    fromWeek: 8,
    toWeek: 12,
    source: '衛生福利部 — 帶因夫妻孕期接受檢查，防治重型海洋性貧血兒',
  },
  {
    id: 'prenatal-nuchal-translucency',
    kind: 'screening',
    title: '胎兒頸部透明帶（NT）與早發型子癲前症風險評估',
    description:
      '自費（部分縣市有補助），限妊娠 11-13+6 週、胎兒頭臀長 45-84 mm 時測量，過了就量不到。同一次可合併平均動脈壓、'
      + '子宮動脈血流阻力與 PlGF、PAPP-A 計算早發型子癲前症風險；高風險者須在妊娠 16 週前開始每日低劑量阿斯匹靈 '
      + '80-100 mg 才有預防效果。',
    dueWeek: 11,
    fromWeek: 11,
    toWeek: 13,
    source:
      '國立臺灣大學醫學院附設醫院新竹臺大分院 — 頸部透明帶檢查；國泰綜合醫院婦產科 — 子癲前症衛教',
  },
  {
    id: 'prenatal-first-trimester-down',
    kind: 'screening',
    title: '第一孕期唐氏症篩檢（初唐）',
    description:
      '自費，妊娠 11-13+6 週。合併頸部透明帶厚度、母血 PAPP-A 與 hCG，加上年齡、體重、週數計算風險，可檢出 '
      + '82-87% 的唐氏兒。風險值大於 1/270 時，建議進一步做羊膜穿刺等產前染色體檢查。',
    dueWeek: 11,
    fromWeek: 11,
    toWeek: 13,
    source: '中國醫藥大學附設醫院 — 唐氏症篩檢衛教單張',
  },
  {
    id: 'prenatal-second-trimester-down',
    kind: 'screening',
    title: '第二孕期四指標母血唐氏症篩檢（中唐）',
    description:
      '自費，妊娠 15-20 週抽母血分析血清標誌，偵測率約 60-83%。錯過第一孕期篩檢者的替代方案；風險值大於 1/270 時建議接續羊膜穿刺。',
    dueWeek: 16,
    fromWeek: 15,
    toWeek: 20,
    source: '中國醫藥大學附設醫院 — 唐氏症篩檢衛教單張',
  },
  {
    id: 'prenatal-amniocentesis',
    kind: 'screening',
    title: '羊膜穿刺（產前染色體診斷）',
    description:
      '妊娠 16-18 週為最佳時機。34 歲以上、曾生育過異常兒、本人或配偶有家族遺傳疾病史，或篩檢結果為高風險者，國民健康署補助 '
      + '5,000 元；低收入戶或設籍醫療資源不足地區者最高補助 8,500 元。細胞培養需時，愈早做愈有決策空間。',
    dueWeek: 16,
    fromWeek: 16,
    toWeek: 20,
    source: '衛生福利部 — 高齡孕婦逐年增加 產前遺傳診斷補助更安心',
  },
  {
    id: 'prenatal-gdm',
    kind: 'screening',
    title: '妊娠糖尿病篩檢（第 24-28 週）',
    description:
      '公費，可併同第 5 或第 6 次產檢。空腹及口服 75 公克葡萄糖後 1 小時、2 小時測血漿葡萄糖；空腹 ≧ 92、1 小時 '
      + '≧ 180、2 小時 ≧ 153 mg/dL 任一項符合即診斷為妊娠糖尿病。需空腹前往，記得先與診所確認抽血時間。',
    dueWeek: 24,
    fromWeek: 24,
    toWeek: 28,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-anemia',
    kind: 'screening',
    title: '孕婦貧血檢驗（第 24-28 週）',
    description:
      '公費，可併同第 5 或第 6 次產檢，與妊娠糖尿病篩檢同一次抽血完成。檢查 WBC、RBC、Hb、Hct、MCV 及血小板計數；'
      + '第 2 孕期血色素低於 10.5 g/dL 即診斷為貧血，可及早補充鐵與葉酸。',
    dueWeek: 24,
    fromWeek: 24,
    toWeek: 28,
    source: HPA_SCHEDULE,
  },
  {
    id: 'prenatal-gbs',
    kind: 'screening',
    title: '產前乙型鏈球菌（GBS）篩檢（第 35-37 週）',
    description:
      '公費補助每案 500 元，妊娠第 35 至 37 週 1 次，可搭配第 9 至第 12 次產檢執行。以棉棒採集陰道外口、'
      + '會陰及肛門口檢體培養，約 1 週出結果；陽性者待產時施打抗生素，可預防新生兒早發型敗血症。培養需時，'
      + '太晚做會來不及在生產前拿到報告。',
    dueWeek: 35,
    fromWeek: 35,
    toWeek: 37,
    source: '衛生福利部國民健康署 — 孕婦乙型鏈球菌篩檢補助方案',
  },
];

/** 孕期疫苗。 */
const vaccines: PrenatalCheckupTemplate[] = [
  {
    id: 'prenatal-tdap',
    kind: 'vaccine',
    title: 'Tdap 百日咳疫苗（第 28-36 週）',
    description:
      '自費（部分縣市有補助），每次懷孕都應接種 1 劑減量破傷風白喉非細胞性百日咳混合疫苗。接種後 2-4 週產生抗體並經胎盤傳給胎兒，'
      + '補上寶寶出生後至滿 2 個月才能自行接種的空窗期。孕期未接種者，應於產後儘速補種。',
    dueWeek: 28,
    fromWeek: 28,
    toWeek: 36,
    source: '衛生福利部疾病管制署 — 孕婦 Tdap 疫苗接種建議',
  },
];

export const prenatalCheckupSchedule: PrenatalCheckupTemplate[] = [
  ...checkups,
  ...ultrasounds,
  ...screenings,
  ...vaccines,
];
