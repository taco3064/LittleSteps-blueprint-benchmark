import type { VaccineSchedule } from '../records';
export const entryBcg5m: VaccineSchedule = {
  id: 'bcg-5m',
  name: '卡介苗',
  timing: '出生滿5-8個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/0xsE-bNbZiWWo_it9SfvPg',
  ageInMonths: 5,
  ageLabel: '5個月',
  doses: 1,
  currentDose: 1,
  sideEffects: [
    '接種後7-14天紅色小結節',
    '4-6週膿泡或潰瘍',
    '2-3個月自然癒合',
    '可能形成疤痕',
  ],
  notes: '預防結核病，建議接種時間為出生滿5-8個月，寶寶體重需達2500公克以上',
};
