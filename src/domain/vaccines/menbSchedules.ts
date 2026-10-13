import type { VaccineSchedule } from '../records';
export const entryMenb2m: VaccineSchedule = {
  id: 'menb-2m',
  name: 'B型流行性腦脊髓膜炎疫苗 第1劑',
  timing: '出生滿2個月起',
  funding: 'self-paid',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/cTs_1wINWKYOxjzn_hi8fg',
  ageInMonths: 2,
  ageLabel: '2個月起',
  doses: 2,
  currentDose: 1,
  sideEffects: ['發燒', '注射部位腫脹疼痛', '煩躁不安', '嗜睡'],
  notes: '自費疫苗，間隔至少1個月接種第2劑。建議在流行季節前完成接種',
};
export const entryMenb4m: VaccineSchedule = {
  id: 'menb-4m',
  name: 'B型流行性腦脊髓膜炎疫苗 第2劑',
  timing: '第1劑後至少1個月',
  funding: 'self-paid',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/cTs_1wINWKYOxjzn_hi8fg',
  ageInMonths: 4,
  ageLabel: '4個月',
  doses: 2,
  currentDose: 2,
  sideEffects: ['發燒', '注射部位腫脹疼痛', '煩躁不安', '嗜睡'],
  notes: '自費疫苗，與第1劑間隔至少1個月',
};
