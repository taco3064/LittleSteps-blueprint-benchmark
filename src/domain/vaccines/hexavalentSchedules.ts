import type { VaccineSchedule } from '../records';
export const entryHexavalent6m: VaccineSchedule
  // 六合一（含 B 肝的五合一升級版）疾管署沒有專頁，這裡引用的是五合一頁：
  // 它給的是這一劑替代掉的公費時程（2、4、6、18 個月），不是這個自費產品。
  = {
    id: 'hexavalent-6m',
    name: '六合一疫苗 第3劑（升級版）',
    timing: '出生滿6個月',
    funding: 'self-paid',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/4buEpU_Wqb7WhVNeDk84tg',
    ageInMonths: 6,
    ageLabel: '6個月',
    doses: 4,
    currentDose: 3,
    sideEffects: ['發燒', '注射部位腫脹', '煩躁不安', '食慾下降'],
    notes: '自費疫苗，為五合一疫苗的升級版，額外包含B型肝炎疫苗，一針抵兩針',
  };
export const entryHexavalent18m: VaccineSchedule = {
  id: 'hexavalent-18m',
  name: '六合一疫苗 第4劑（升級版）',
  timing: '出生滿18個月',
  funding: 'self-paid',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/4buEpU_Wqb7WhVNeDk84tg',
  ageInMonths: 18,
  ageLabel: '18個月',
  doses: 4,
  currentDose: 4,
  sideEffects: ['發燒', '注射部位腫脹', '煩躁不安', '食慾下降'],
  notes: '自費疫苗，為五合一疫苗的升級版，額外包含B型肝炎疫苗',
};
