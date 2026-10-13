import type { VaccineSchedule } from '../records';
export const entryHepbBirth: VaccineSchedule = {
  id: 'hepb-birth',
  name: 'B型肝炎疫苗 第1劑',
  timing: '出生24小時內',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/E8uaEwWTLCW_axUVTbDn1g',
  ageInMonths: 0,
  ageLabel: '出生',
  doses: 3,
  currentDose: 1,
  sideEffects: ['注射部位紅腫', '輕微發燒', '嘔吐'],
  notes:
    '出生後儘速接種。孕婦若為高傳染性帶原者（表面抗原RPHA效價≧1:2560），嬰兒需另注射B型肝炎免疫球蛋白',
};
export const entryHepb1m: VaccineSchedule = {
  id: 'hepb-1m',
  name: 'B型肝炎疫苗 第2劑',
  timing: '出生滿1個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/E8uaEwWTLCW_axUVTbDn1g',
  ageInMonths: 1,
  ageLabel: '1個月',
  doses: 3,
  currentDose: 2,
  sideEffects: ['注射部位紅腫', '輕微發燒'],
};
export const entryHepb6m: VaccineSchedule = {
  id: 'hepb-6m',
  name: 'B型肝炎疫苗 第3劑',
  timing: '出生滿6個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/E8uaEwWTLCW_axUVTbDn1g',
  ageInMonths: 6,
  ageLabel: '6個月',
  doses: 3,
  currentDose: 3,
  sideEffects: ['注射部位紅腫', '輕微發燒'],
};
