import type { VaccineSchedule } from '../records';
export const entryEnterovirus: VaccineSchedule = {
  id: 'enterovirus',
  name: '腸病毒71型疫苗 第1劑',
  timing: '出生滿2個月至6歲',
  funding: 'self-paid',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/u87VWWvbc8dH6BcgAguctw',
  ageInMonths: 2,
  ageLabel: '2個月起',
  doses: 2,
  currentDose: 1,
  sideEffects: ['注射部位紅腫', '輕微發燒', '煩躁'],
  notes: '自費疫苗，間隔2個月接種第2劑。建議在6歲前完成接種，提早接種提早保護',
};
export const entryEnterovirus2: VaccineSchedule = {
  id: 'enterovirus-2',
  name: '腸病毒71型疫苗 第2劑',
  timing: '第1劑後2個月',
  funding: 'self-paid',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/u87VWWvbc8dH6BcgAguctw',
  ageInMonths: 4,
  ageLabel: '4個月',
  doses: 2,
  currentDose: 2,
  sideEffects: ['注射部位紅腫', '輕微發燒', '煩躁'],
  notes: '自費疫苗，與第1劑間隔至少2個月',
};
