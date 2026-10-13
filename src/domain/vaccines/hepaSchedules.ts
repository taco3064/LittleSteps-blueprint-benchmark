import type { VaccineSchedule } from '../records';
export const entryHepa12m: VaccineSchedule = {
  // id 保留歷史命名，避免既有使用者的 vaccineProgress 鍵變成孤兒。
  // 實際時程自 114/1/1 起已改為出生滿 18 個月，故 id 字面與月齡不符。
  id: 'hepa-12m',
  name: 'A型肝炎疫苗 第1劑',
  timing: '出生滿18個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/2Tj7bMQQXoyKu2BvJma89w',
  ageInMonths: 18,
  ageLabel: '18個月',
  doses: 2,
  currentDose: 1,
  sideEffects: ['注射部位疼痛', '疲倦', '輕微發燒'],
};
export const entryHepa18m: VaccineSchedule = {
  // id 保留歷史命名（同 hepa-12m）；實際時程自 114/1/1 起為出生滿 27 個月。
  id: 'hepa-18m',
  name: 'A型肝炎疫苗 第2劑',
  timing: '出生滿27個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/2Tj7bMQQXoyKu2BvJma89w',
  ageInMonths: 27,
  ageLabel: '27個月',
  doses: 2,
  currentDose: 2,
  sideEffects: ['注射部位疼痛', '疲倦', '輕微發燒'],
  notes: '與第1劑至少間隔6個月',
};
