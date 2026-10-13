import type { VaccineSchedule } from '../records';
export const entryMmr12m: VaccineSchedule = {
  id: 'mmr-12m',
  name: '麻疹腮腺炎德國麻疹混合疫苗 第1劑',
  timing: '出生滿12個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/1XnG2MJUtxJ6jwPn_wCjEA',
  ageInMonths: 12,
  ageLabel: '12個月',
  doses: 2,
  currentDose: 1,
  sideEffects: ['接種後5-12天可能發燒', '出疹', '咳嗽', '鼻炎', '注射部位腫痛'],
  notes: '可能在接種後5-12天出現發燒或出疹',
};
export const entryMmr5y: VaccineSchedule = {
  id: 'mmr-5y',
  name: '麻疹腮腺炎德國麻疹混合疫苗 第2劑',
  timing: '滿5歲至入小學前',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/1XnG2MJUtxJ6jwPn_wCjEA',
  ageInMonths: 60,
  ageLabel: '5歲',
  doses: 2,
  currentDose: 2,
  sideEffects: ['發燒', '出疹', '注射部位腫痛'],
};
