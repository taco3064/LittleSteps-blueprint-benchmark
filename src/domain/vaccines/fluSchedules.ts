import type { VaccineSchedule } from '../records';
export const entryFlu1y: VaccineSchedule = {
  id: 'flu-1y',
  name: '流感疫苗',
  timing: '滿6個月以上，每年接種',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/sc9enn8wcrLIufbqD9MFpw',
  ageInMonths: 6,
  ageLabel: '6個月起',
  doses: 1,
  sideEffects: ['注射部位痠痛', '輕微發燒', '疲倦', '頭痛', '肌肉痠痛'],
  notes: '每年10月開始接種。8歲以下初次接種需接種2劑，間隔4週以上',
};
