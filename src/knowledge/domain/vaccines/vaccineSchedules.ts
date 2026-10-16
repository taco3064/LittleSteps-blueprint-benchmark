import { VaccineSchedule } from '../referenceModels';
import { laterInfantSchedules } from './laterInfantSchedules';

/**
 * 疫苗接種時程表。
 *
 * 2026-09-04 查證：逐劑對照疾管署「現行兒童預防接種時程表(兒童常規疫苗)」
 * 與各支疫苗的「疫苗簡介」頁面，每一劑的 sourceUrl 就是它的出處。
 *
 * 第一個例外：六合一（五合一的自費升級版）疾管署沒有專頁——自費疫苗項目頁只
 * 舉了輪狀病毒與腸病毒 A71。那兩劑引用的是五合一（DTaP-Hib-IPV）頁，它涵蓋
 * 的是這一劑替代掉的公費時程，不是這個自費產品本身。寧可標得出處不完整，
 * 也不編一個看起來對的網址。
 *
 * 第二個例外：pneumococcal-highrisk-6m 的 sourceUrl 指的不是它那句條文的出
 * 處。條文與公費身分出自 PCV13 的「疫苗簡介」頁（公費疫苗 →
 * https://www.cdc.gov.tw/Category/Page/mIlV6UzT8mIK49ADAOjz2w ），sourceUrl
 * 指的是那一頁在條文後面連出去的 ICD code 參考表——誰算高危險群由那張表認
 * 定，這是 #33 刻意的選擇（見那一列上方的註解）。
 *
 * 這一列 2026-09-06 新增時連不上疾管署（www.cdc.gov.tw 一律 403），四個欄
 * 位都待覆核，追蹤在 issue #73。2026-09-07 在連得到的環境上逐頁核完（#73）：
 * 「疫苗簡介」頁（最後更新 2026/2/11）在標題「公費對象及接種時程」底下寫的
 * 是「自104年1月起全面推動嬰幼兒接種3劑PCV13，接種時程依序為出生滿2個月、
 * 4個月及12-15個月，如為高危險群對象，出生滿6個月時可增加接種1劑。」——
 * eligibility 引的就是這一句，逐字相符；公費而且仍然限高危險群（不是全面
 * 適用、也沒有變成自費），所以 funding: "national" 加 eligibility 是對的；
 * 常規時程還是 2、4、12-15 個月共 3 劑，所以這一列的 doses: 1 站得住；
 * sourceUrl 打開仍是「幼童肺炎鏈球菌高危險群之ICD code參考表」（最後更新
 * 2025/3/10）。
 *
 * funding 不是布林：見 VaccineFunding。nhi-conditional 與 local-varies 一定
 * 要附 eligibility，而且逐字引用來源的用語。
 *
 * 已公告、但還沒生效的付費方式改變寫在 fundingChangesOn。檔頭的查證日期擋不
 * 住這一種錯：改變日就落在保鮮期裡，檔案到那天都還算「新鮮」，funding 卻已
 * 經是錯的。標了日期，測試會在那天之後轉紅。
 */
export const vaccineSchedules: VaccineSchedule[] = [
  {
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
  },
  // RSV 單株抗體：疾管署寫的是「目前國內核准上市的RSV單株抗體有2種」，兩種
  // 的付費方式不同——其中一種「1歲以下高危險群幼兒接種具健保給付條件」。
  // 原本這裡只有一列、標成自費，於是 32 週早產兒的家長讀到的是兩萬多元的
  // 自付額，然後放棄；而那正是最需要打的那群孩子。
  {
    id: 'rsv-monthly-birth',
    name: 'RSV短效單株抗體',
    timing: '每月接種1劑，最多接種6劑',
    funding: 'nhi-conditional',
    eligibility:
      '1歲以下高危險群幼兒接種具健保給付條件（如早產、患有先天性心臟病、慢性肺病等），實際條件請洽新生兒科或小兒科醫師',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/9GHyEWeyrfP65vjWpVjYYA',
    ageInMonths: 0,
    ageLabel: '出生',
    doses: 1,
    currentDose: 1,
    sideEffects: ['皮疹', '接種部位疼痛'],
    notes:
      '疾管署核准的RSV單株抗體有2種，這是每月接種的那一種；另一種為長效、接種1-2劑',
  },
  {
    id: 'rsv-birth',
    name: 'RSV長效單株抗體',
    timing: '出生穩定後即可施打',
    funding: 'self-paid',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/9GHyEWeyrfP65vjWpVjYYA',
    ageInMonths: 0,
    ageLabel: '出生',
    doses: 1,
    currentDose: 1,
    sideEffects: ['皮疹', '接種部位疼痛'],
    notes:
      '自費疫苗，接種1-2劑。1歲以下嬰兒出生後即可接種，尤其RSV重症高風險嬰兒（如早產、患有先天性心臟病、慢性肺病等）；1歲以上未滿2歲的重症高風險幼兒亦可接種',
  },
  {
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
  },
  {
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
  },
  {
    id: 'pentavalent-2m',
    name: '五合一疫苗 第1劑',
    timing: '出生滿2個月',
    funding: 'national',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/4buEpU_Wqb7WhVNeDk84tg',
    ageInMonths: 2,
    ageLabel: '2個月',
    doses: 4,
    currentDose: 1,
    sideEffects: ['發燒', '注射部位腫脹', '煩躁不安', '食慾下降'],
    notes: '含白喉、破傷風、百日咳、小兒麻痺、b型嗜血桿菌',
  },
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
  {
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
  },
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
  {
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
      '自費疫苗，最早出生滿6週可接種；2劑型的最後1劑不得晚於出生後24週，過了就補不回來。衛福部公告2027年1月1日起改為公費。口服後一週內，寶寶糞便中可能帶有病毒，更換尿布後務必徹底洗手。公告全文：https://www.mohw.gov.tw/cp-16-87058-1.html',
  },
  {
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
      '自費疫苗，最早出生滿6週可接種，每劑間隔至少4週；3劑型的最後1劑不得晚於出生後32週，過了就補不回來。衛福部公告2027年1月1日起改為公費。口服後一週內，寶寶糞便中可能帶有病毒，更換尿布後務必徹底洗手。公告全文：https://www.mohw.gov.tw/cp-16-87058-1.html',
  },
  {
    id: 'pentavalent-4m',
    name: '五合一疫苗 第2劑',
    timing: '出生滿4個月',
    funding: 'national',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/4buEpU_Wqb7WhVNeDk84tg',
    ageInMonths: 4,
    ageLabel: '4個月',
    doses: 4,
    currentDose: 2,
    sideEffects: ['發燒', '注射部位腫脹', '煩躁不安', '食慾下降'],
  },
  {
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
  },
  {
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
      '自費疫苗，2劑型的最後1劑不得晚於出生後24週接種，過了就補不回來。原則以同一廠牌完成接種。衛福部公告2027年1月1日起改為公費。公告全文：https://www.mohw.gov.tw/cp-16-87058-1.html',
  },
  {
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
      '自費疫苗，與前一劑間隔至少4週，原則以同一廠牌完成接種。3劑型還有第3劑，不得晚於出生後32週。衛福部公告2027年1月1日起改為公費。公告全文：https://www.mohw.gov.tw/cp-16-87058-1.html',
  },
  {
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
  },
  {
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
  },
  ...laterInfantSchedules,
];
