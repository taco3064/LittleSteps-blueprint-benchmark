import type { VaccineSchedule } from '../records';
export const entryJe15m: VaccineSchedule = {
  id: 'je-15m',
  name: '日本腦炎疫苗 第1劑',
  timing: '出生滿15個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/G-grOKyRVHDV8yGC-8NJrw',
  ageInMonths: 15,
  ageLabel: '15個月',
  doses: 2,
  currentDose: 1,
  sideEffects: ['發燒', '注射部位紅腫', '頭痛'],
  notes: '細胞培養活性減毒疫苗，間隔12個月接種第2劑',
};
export const entryJe27m: VaccineSchedule = {
  id: 'je-27m',
  name: '日本腦炎疫苗 第2劑',
  timing: '出生滿27個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/G-grOKyRVHDV8yGC-8NJrw',
  ageInMonths: 27,
  ageLabel: '27個月',
  doses: 2,
  currentDose: 2,
  sideEffects: ['發燒', '注射部位紅腫', '頭痛'],
  notes: '與第1劑間隔12個月；完成此劑即完成幼兒常規接種',
};
