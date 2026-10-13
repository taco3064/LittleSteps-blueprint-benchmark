import type { VaccineSchedule } from '../records';
export const entryVaricella12m: VaccineSchedule = {
  id: 'varicella-12m',
  name: '水痘疫苗 第1劑',
  timing: '出生滿12個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/3un9_HOLlYs3sIjoM6s3iA',
  ageInMonths: 12,
  ageLabel: '12個月',
  doses: 1,
  currentDose: 1,
  sideEffects: ['輕微發燒', '注射部位紅疹'],
  notes: '保護力約85%',
};
export const entryVaricella5y: VaccineSchedule = {
  id: 'varicella-5y',
  name: '水痘疫苗 第2劑',
  timing: '滿4歲至6歲',
  funding: 'self-paid',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/BIxUz7qOvlS9MJ3PH3VAZg',
  ageInMonths: 48,
  ageLabel: '4歲',
  doses: 2,
  currentDose: 2,
  sideEffects: ['輕微發燒', '注射部位紅疹', '疲倦'],
  notes: '自費疫苗。第1劑（12個月）保護力約85%，接種第2劑可將保護力提升至95%以上',
};
