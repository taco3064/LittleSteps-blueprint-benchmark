import type { VaccineSchedule } from '../records';
export const entryRotavirus2m: VaccineSchedule
  // 輪狀病毒是兩種劑型，不是同一支疫苗的兩種打法：疾管署寫「目前國內上市的
  // 廠牌有兩種(分別為2劑、3劑時程)」，2 劑型為出生滿 2、4 個月且最後 1 劑不
  // 得晚於出生後 24 週，3 劑型為出生滿 2、4、6 個月且不得晚於 32 週。壓成一
  // 列 2 劑時，打 3 劑型的家長會以為第 2 劑打完就結束——而那一劑過了 32 週
  // 就補不回來。
  //
  // 衛福部 2026/6/30 公告「輪狀病毒疫苗將於明(2027)年1月1日納入幼兒公費疫苗
  // 接種 併同提供2劑型及3劑型疫苗」，並載明接種年齡最小為出生滿 6 週、最大
  // 不得超過 8 個月，每劑最短間隔 4 週，原則以同廠牌完成接種：
  // https://www.mohw.gov.tw/cp-16-87058-1.html
  //
  // 給 2027 年來翻這五列的人：改成 national 不只是換一個 funding 值。公告的
  // 公費對象有年齡上限——「最小為出生滿6週，最大不得超過8個月」——所以那不是
  // 一句「符合年齡就免費」，翻牌時要一併把上限寫進 eligibility 或 notes，
  // 否則 9 個月大孩子的家長會被告知有一劑免費的疫苗可以打。
  = {
    id: 'rotavirus-2m',
    name: '口服輪狀病毒疫苗（2劑型） 第1劑',
    timing: '出生滿2個月',
    funding: 'self-paid',
    fundingChangesOn: '2027-01-01',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/Swi2NuzkthETRWhmAmFOnw',
    ageInMonths: 2,
    ageLabel: '2個月',
    doses: 2,
    currentDose: 1,
    sideEffects: ['輕微腹瀉', '嘔吐', '煩躁'],
    notes:
      '自費疫苗，最早出生滿6週可接種；2劑型的最後1劑不得晚於出生後24週，過了就補不回來。衛福部公告2027年1月1日起改為公費。'
      + '口服後一週內，寶寶糞便中可能帶有病毒，更換尿布後務必徹底洗手。公告全文：https://www.mohw.gov.tw/cp-16'
      + '-87058-1.html',
  };
export const entryRotavirus3dose2m: VaccineSchedule = {
  id: 'rotavirus-3dose-2m',
  name: '口服輪狀病毒疫苗（3劑型） 第1劑',
  timing: '出生滿2個月',
  funding: 'self-paid',
  fundingChangesOn: '2027-01-01',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/Swi2NuzkthETRWhmAmFOnw',
  ageInMonths: 2,
  ageLabel: '2個月',
  doses: 3,
  currentDose: 1,
  sideEffects: ['輕微腹瀉', '嘔吐', '煩躁'],
  notes:
    '自費疫苗，最早出生滿6週可接種，每劑間隔至少4週；3劑型的最後1劑不得晚於出生後32週，過了就補不回來。'
    + '衛福部公告2027年1月1日起改為公費。口服後一週內，寶寶糞便中可能帶有病毒，更換尿布後務必徹底洗手。公告全文：'
    + 'https://www.mohw.gov.tw/cp-16-87058-1.html',
};
export const entryRotavirus4m: VaccineSchedule = {
  id: 'rotavirus-4m',
  name: '口服輪狀病毒疫苗（2劑型） 第2劑',
  timing: '出生滿4個月',
  funding: 'self-paid',
  fundingChangesOn: '2027-01-01',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/Swi2NuzkthETRWhmAmFOnw',
  ageInMonths: 4,
  ageLabel: '4個月',
  doses: 2,
  currentDose: 2,
  sideEffects: ['輕微腹瀉', '嘔吐', '煩躁'],
  notes:
    '自費疫苗，2劑型的最後1劑不得晚於出生後24週接種，過了就補不回來。原則以同一廠牌完成接種。'
    + '衛福部公告2027年1月1日起改為公費。公告全文：https://www.mohw.gov.tw/cp-16-87058-1.ht'
    + 'ml',
};
export const entryRotavirus3dose4m: VaccineSchedule = {
  id: 'rotavirus-3dose-4m',
  name: '口服輪狀病毒疫苗（3劑型） 第2劑',
  timing: '出生滿4個月',
  funding: 'self-paid',
  fundingChangesOn: '2027-01-01',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/Swi2NuzkthETRWhmAmFOnw',
  ageInMonths: 4,
  ageLabel: '4個月',
  doses: 3,
  currentDose: 2,
  sideEffects: ['輕微腹瀉', '嘔吐', '煩躁'],
  notes:
    '自費疫苗，與前一劑間隔至少4週，原則以同一廠牌完成接種。3劑型還有第3劑，不得晚於出生後32週。'
    + '衛福部公告2027年1月1日起改為公費。公告全文：https://www.mohw.gov.tw/cp-16-87058-1.ht'
    + 'ml',
};
export const entryRotavirus3dose6m: VaccineSchedule = {
  id: 'rotavirus-3dose-6m',
  name: '口服輪狀病毒疫苗（3劑型） 第3劑',
  timing: '出生滿6個月',
  funding: 'self-paid',
  fundingChangesOn: '2027-01-01',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/Swi2NuzkthETRWhmAmFOnw',
  ageInMonths: 6,
  ageLabel: '6個月',
  doses: 3,
  currentDose: 3,
  sideEffects: ['輕微腹瀉', '嘔吐', '煩躁'],
  notes:
    '自費疫苗，3劑型的最後1劑不得晚於出生後32週接種，過了就補不回來。2劑型沒有這一劑。衛福部公告2027年1月1日起改為公費。'
    + '公告全文：https://www.mohw.gov.tw/cp-16-87058-1.html',
};
