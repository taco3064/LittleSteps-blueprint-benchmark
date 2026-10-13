import type { VaccineSchedule } from '../records';
export const entryRsvMonthlyBirth: VaccineSchedule
  // RSV 單株抗體：疾管署寫的是「目前國內核准上市的RSV單株抗體有2種」，兩種
  // 的付費方式不同——其中一種「1歲以下高危險群幼兒接種具健保給付條件」。
  // 原本這裡只有一列、標成自費，於是 32 週早產兒的家長讀到的是兩萬多元的
  // 自付額，然後放棄；而那正是最需要打的那群孩子。
  = {
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
  };
export const entryRsvBirth: VaccineSchedule = {
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
};
