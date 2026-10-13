import type { VaccineSchedule } from '../records';
export const entryPneumococcal2m: VaccineSchedule
  // 13 價肺炎鏈球菌的公費常規時程是 3 劑：出生滿 2 個月、4 個月與 12-15 個月。
  // 曾經多出來的「24 個月第 4 劑」沒有出現在任何官方頁面上，連它自己引用的那
  // 一頁都寫著常規只有 3 劑。
  //
  // 高危險群那一劑——「如為高危險群對象，出生滿6個月時可增加接種1劑」——是真
  // 的，而且現在是一列真正的資料：pneumococcal-highrisk-6m，在 6 個月那一段。
  //
  // #23 當時把整件事寫在第 2 劑的 notes 裡，因為讀資料的兩個地方都只看
  // funding，一列 national + eligibility 會對每一個健康寶寶的家長說「你漏打
  // 了一劑公費疫苗」。#33 之後 eligibility 有人讀了，條件與出處就跟著它自己
  // 那一列走；第 2 劑只留下時機那一句——4 個月是 6 個月之前的最後一次門診，
  // 而問醫師要趁還來得及的時候。同一份條件不要在兩個地方各抄一次。
  = {
    id: 'pneumococcal-2m',
    name: '13價肺炎鏈球菌疫苗 第1劑',
    timing: '出生滿2個月',
    funding: 'national',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/mIlV6UzT8mIK49ADAOjz2w',
    ageInMonths: 2,
    ageLabel: '2個月',
    doses: 3,
    currentDose: 1,
    sideEffects: ['發燒', '注射部位紅腫疼痛', '煩躁', '嗜睡'],
  };
export const entryPneumococcal4m: VaccineSchedule = {
  id: 'pneumococcal-4m',
  name: '13價肺炎鏈球菌疫苗 第2劑',
  timing: '出生滿4個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/mIlV6UzT8mIK49ADAOjz2w',
  ageInMonths: 4,
  ageLabel: '4個月',
  doses: 3,
  currentDose: 2,
  sideEffects: ['發燒', '注射部位紅腫疼痛', '煩躁', '嗜睡'],
  // 條件與出處都在 pneumococcal-highrisk-6m 那一列上，這裡只留時機：
  // 4 個月是 6 個月之前的最後一次門診，問醫師要趁還來得及的時候。
  notes:
    '高危險群幼兒出生滿6個月時可公費增加接種1劑，孩子算不算高危險群，這次回診正好可以問醫師',
};
export const entryPneumococcalHighrisk6m: VaccineSchedule
  // 公費，但只給名單上的孩子——時程表以前表達不了這件事，#33 之後可以。
  //
  // 出處未經覆核，見檔頭的第二個例外與 issue #73。
  //
  // 疾管署的 PCV13 頁寫的是「全面推動嬰幼兒接種3劑PCV13，接種
  // 時程依序為出生滿2個月、4個月及12-15個月，如為高危險群對象，出生滿6個月
  // 時可增加接種1劑」。常規那 3 劑各自成列，這一列是那句話的後半段，所以
  // doses 是 1 而不是 4：它不是 PCV13 常規時程的第 4 劑，是另外增加的一劑。
  //
  // eligibility 有值，於是 isScheduledDose 不把它算成待辦——它不會出現在提
  // 醒清單、不會變成「下一劑」、也不算進「還有幾劑公費疫苗沒記錄」。條件在
  // 疫苗頁上不必展開就看得到，行事曆匯出也帶著它，該知道的家長會讀到。
  //
  // 誰算高危險群不抄進來：疾管署有一份 ICD code 參考表，那才是認定的依據，
  // 抄一份進 app 只是多一份會過期的副本。sourceUrl 就指著那一頁。
  = {
    id: 'pneumococcal-highrisk-6m',
    name: '13價肺炎鏈球菌疫苗（高危險群增加1劑）',
    timing: '出生滿6個月',
    funding: 'national',
    eligibility:
      '如為高危險群對象，出生滿6個月時可增加接種1劑；是否屬高危險群依疾管署「幼童肺炎鏈球菌高危險群之ICD code參考表」認定，請洽小兒科醫師',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/t-6cjd2WDeB6NdExzrQCVw',
    ageInMonths: 6,
    ageLabel: '6個月',
    doses: 1,
    currentDose: 1,
    sideEffects: ['發燒', '注射部位紅腫疼痛', '煩躁', '嗜睡'],
    notes:
      '公費常規時程是出生滿2個月、4個月與12-15個月共3劑；這是高危險群幼兒（如免疫功能不全、人工耳植入、'
      + '慢性心臟或肺部疾病等）才增加的1劑，不符合條件的孩子沒有漏打',
  };
export const entryPneumococcal15v6m: VaccineSchedule = {
  id: 'pneumococcal-15v-6m',
  name: '15價肺炎鏈球菌疫苗（加強版）',
  timing: '出生滿6個月起',
  funding: 'self-paid',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/ORBnRmMgImeUqPApKawmwA',
  ageInMonths: 6,
  ageLabel: '6個月起',
  doses: 1,
  currentDose: 1,
  sideEffects: ['發燒', '注射部位紅腫疼痛', '煩躁', '嗜睡'],
  notes:
    '自費疫苗，為13價肺炎鏈球菌的升級版，額外保護2種血清型（22F, 33F），提供更全面的保護力',
};
export const entryPneumococcal12m: VaccineSchedule = {
  id: 'pneumococcal-12m',
  name: '13價肺炎鏈球菌疫苗 第3劑',
  timing: '出生滿12個月',
  funding: 'national',
  sourceUrl: 'https://www.cdc.gov.tw/Category/Page/mIlV6UzT8mIK49ADAOjz2w',
  ageInMonths: 12,
  ageLabel: '12個月',
  doses: 3,
  currentDose: 3,
  sideEffects: ['發燒', '注射部位紅腫疼痛', '煩躁', '嗜睡'],
  notes: '公費常規時程共3劑，接種完這一劑就完成了',
};
