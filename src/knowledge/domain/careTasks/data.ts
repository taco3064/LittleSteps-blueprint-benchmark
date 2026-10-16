import type { CareTaskKind, CareTaskTemplate } from '../referenceModels/index';

export const careTaskKindLabels: Record<CareTaskKind, string> = {
  'health-check': '兒童健檢',
  'dev-screening': '發展篩檢',
  vaccine: '疫苗接種',
  dental: '牙齒塗氟',
  admin: '資格登記',
};

/**
 * 1-3 歲照護時程。全部為可由出生日精算的法定時程，不含推測性內容。
 *
 * 疫苗類任務不擁有自己的完成狀態：vaccineId + vaccineDose 指向
 * LittleSteps 的 vaccineProgress，由該處作為唯一真相來源。
 * 單靠 vaccineId 無法分辨劑次（vaccineProgress 的形狀是
 * `{ [vaccineId]: { doses: { [n]: ... } } }`），故兩者必須成對。
 *
 * 時程查核（2026-08 對照官方頁面）：
 * - 兒童預防保健服務：國健署「兒童預防保健服務7+2」自 115/7/1 起由 7 次調增為 9 次；
 *   4-10 個月的 1 次拆為 4-6 個月與 6-12 個月各 1 次，3-7 歲的 1 次拆為 3-5 歲與
 *   5-7 歲各 1 次。故 1 歲後的 3 次為第 6（1 歲 6 個月-2 歲）、第 7（2-3 歲）、
 *   第 8（3-5 歲）次。
 *   衛福部新聞「兒童預防保健增至9次 7月1日正式上路」（115-04-01）
 *   https://www.mohw.gov.tw/cp-7398-85990-1.html
 * - 兒童發展篩檢服務：自 113/7/1 起未滿 7 歲共 6 階段——6-10 個月、10 個月-1 歲 6 個月、
 *   1 歲 6 個月-2 歲、2-3 歲、3-5 歲、5-未滿 7 歲，每階段各補助 1 次。
 *   國健署「兒童發展篩檢服務方案」https://www.hpa.gov.tw/Pages/List.aspx?nodeid=4824
 * - 兒童預防接種時程：以本專案勘誤後的 `littlesteps/data/vaccines.ts` 為準
 *   （日本腦炎 15 / 27 個月共 2 劑；A 型肝炎自 114/1/1 起改為 18 / 27 個月）。
 *   careTasks.test.ts 會逐筆交叉比對 dueMonth 與 ageInMonths、vaccineDose 與 currentDose。
 * - 牙齒塗氟：未滿 6 歲每半年 1 次（每次須間隔 6 個月以上），健保給付。
 *   健保署口腔預防保健服務規定。
 */
export const careTaskTemplates: CareTaskTemplate[] = [
  // --- 兒童預防保健服務（未滿 7 歲共 9 次，1 歲後 3 次）---
  // 註：次數編號依 115/7/1 上路的「7+2」新制。舊制 7 次時這 3 次為第 5-7 次。
  {
    id: 'health-check-18m',
    kind: 'health-check',
    title: '兒童預防保健 第 6 次',
    description:
      '1 歲 6 個月至未滿 2 歲的免費健檢，含生長評估、身體檢查、發展評估與衛教指導。攜帶健保卡與兒童健康手冊。',
    dueMonth: 18,
    fromMonth: 18,
    toMonth: 24,
    source: '衛生福利部國民健康署 — 兒童預防保健服務',
  },
  {
    id: 'health-check-24m',
    kind: 'health-check',
    title: '兒童預防保健 第 7 次',
    description: '2 歲至未滿 3 歲的免費健檢。攜帶健保卡與兒童健康手冊。',
    dueMonth: 24,
    fromMonth: 24,
    toMonth: 36,
    source: '衛生福利部國民健康署 — 兒童預防保健服務',
  },
  {
    id: 'health-check-36m',
    kind: 'health-check',
    title: '兒童預防保健 第 8 次',
    description:
      '3 歲至未滿 5 歲的免費健檢，本階段僅補助 1 次。攜帶健保卡與兒童健康手冊。',
    dueMonth: 36,
    fromMonth: 36,
    toMonth: 60,
    source: '衛生福利部國民健康署 — 兒童預防保健服務',
  },

  // --- 兒童發展篩檢服務（113/7/1 上路，6 階段，1-3 歲涵蓋 3 個）---
  {
    id: 'dev-screening-12m',
    kind: 'dev-screening',
    title: '兒童發展篩檢（10 個月-1 歲 6 個月）',
    description:
      '以標準化篩檢工具評估發展狀況，具健保身分即可接受政府補助的篩檢。攜帶健保卡與兒童健康手冊。',
    dueMonth: 12,
    fromMonth: 12,
    toMonth: 18,
    source: '衛生福利部 — 兒童發展篩檢服務',
  },
  {
    id: 'dev-screening-18m',
    kind: 'dev-screening',
    title: '兒童發展篩檢（1 歲 6 個月-2 歲）',
    description:
      '以標準化篩檢工具評估粗大動作、精細動作、語言認知與社會發展，每階段各補助 1 次。攜帶健保卡與兒童健康手冊。',
    dueMonth: 18,
    fromMonth: 18,
    toMonth: 24,
    source: '衛生福利部 — 兒童發展篩檢服務',
  },
  {
    id: 'dev-screening-24m',
    kind: 'dev-screening',
    title: '兒童發展篩檢（2-3 歲）',
    description:
      '以標準化篩檢工具評估發展狀況，每階段各補助 1 次，可與兒童預防保健服務一併執行。攜帶健保卡與兒童健康手冊。',
    dueMonth: 24,
    fromMonth: 24,
    toMonth: 36,
    source: '衛生福利部 — 兒童發展篩檢服務',
  },

  // --- 常規疫苗（公費）---
  // 註：hepa-12m / hepa-18m 的 id 為歷史命名，實際時程已於 114/1/1
  //     調整為 18 / 27 個月。id 保留是為了不讓既有使用者的接種進度變成孤兒鍵。
  //     因此 vaccine-hepa-1 是 hepa-12m 卻 dueMonth 18、vaccine-hepa-2 是
  //     hepa-18m 卻 dueMonth 27——這是正確的，請勿「修正」。
  {
    id: 'vaccine-mmr-1',
    kind: 'vaccine',
    title: 'MMR 疫苗 第 1 劑',
    description:
      '麻疹、腮腺炎、德國麻疹混合疫苗，可與水痘疫苗同時分開不同部位接種。',
    dueMonth: 12,
    fromMonth: 12,
    toMonth: 15,
    source: '衛生福利部疾病管制署 — 現行兒童預防接種時程',
    vaccineId: 'mmr-12m',
    vaccineDose: 1,
  },
  {
    id: 'vaccine-varicella-1',
    kind: 'vaccine',
    title: '水痘疫苗 第 1 劑',
    description: '可與 MMR 同時分開不同部位接種；若未同時接種應至少間隔 28 天。',
    dueMonth: 12,
    fromMonth: 12,
    toMonth: 15,
    source: '衛生福利部疾病管制署 — 現行兒童預防接種時程',
    vaccineId: 'varicella-12m',
    vaccineDose: 1,
  },
  {
    id: 'vaccine-pcv-3',
    kind: 'vaccine',
    title: '13 價肺炎鏈球菌疫苗 第 3 劑',
    description: '完成幼兒基礎接種的最後一劑。',
    dueMonth: 12,
    fromMonth: 12,
    toMonth: 15,
    source: '衛生福利部疾病管制署 — 現行兒童預防接種時程',
    vaccineId: 'pneumococcal-12m',
    vaccineDose: 3,
  },
  {
    id: 'vaccine-je-1',
    kind: 'vaccine',
    title: '日本腦炎疫苗 第 1 劑',
    description:
      '細胞培養活性減毒疫苗，幼兒常規共 2 劑。2 歲以下建議接種於大腿前外側。',
    dueMonth: 15,
    fromMonth: 15,
    toMonth: 18,
    source: '衛生福利部疾病管制署 — 日本腦炎活性減毒疫苗 Q&A',
    vaccineId: 'je-15m',
    vaccineDose: 1,
  },
  {
    id: 'vaccine-pentavalent-4',
    kind: 'vaccine',
    title: '五合一疫苗 第 4 劑',
    description: '白喉、破傷風、百日咳、小兒麻痺、b 型嗜血桿菌的追加劑。',
    dueMonth: 18,
    fromMonth: 18,
    toMonth: 21,
    source: '衛生福利部疾病管制署 — 五合一疫苗 Q&A',
    vaccineId: 'pentavalent-18m',
    vaccineDose: 4,
  },
  {
    id: 'vaccine-hepa-1',
    kind: 'vaccine',
    title: 'A 型肝炎疫苗 第 1 劑',
    description: '自 114/1/1 起調整為滿 18 個月接種第 1 劑。',
    dueMonth: 18,
    fromMonth: 18,
    toMonth: 21,
    source: '衛生福利部疾病管制署 — 現行兒童預防接種時程',
    vaccineId: 'hepa-12m',
    vaccineDose: 1,
  },
  {
    id: 'vaccine-je-2',
    kind: 'vaccine',
    title: '日本腦炎疫苗 第 2 劑',
    description: '與第 1 劑間隔 12 個月；完成此劑即完成幼兒常規接種。',
    dueMonth: 27,
    fromMonth: 27,
    toMonth: 30,
    source: '衛生福利部疾病管制署 — 日本腦炎活性減毒疫苗 Q&A',
    vaccineId: 'je-27m',
    vaccineDose: 2,
  },
  {
    id: 'vaccine-hepa-2',
    kind: 'vaccine',
    title: 'A 型肝炎疫苗 第 2 劑',
    description:
      '自 114/1/1 起調整為滿 27 個月接種第 2 劑，與第 1 劑至少間隔 6 個月。',
    dueMonth: 27,
    fromMonth: 27,
    toMonth: 30,
    source: '衛生福利部疾病管制署 — 現行兒童預防接種時程',
    vaccineId: 'hepa-18m',
    vaccineDose: 2,
  },

  // --- 牙齒塗氟（未滿 6 歲每 6 個月 1 次，健保給付）---
  // 以離散記錄表達週期，與 vaccines.ts 表達多劑次的作法一致，
  // 省掉一整套週期展開邏輯。
  {
    id: 'fluoride-12m',
    kind: 'dental',
    title: '牙齒塗氟（滿 1 歲）',
    description:
      '未滿 6 歲兒童每 6 個月 1 次，由健保給付。長第一顆牙後即可開始。攜帶健保卡與兒童健康手冊。',
    dueMonth: 12,
    fromMonth: 12,
    toMonth: 18,
    source: '中央健康保險署 — 兒童牙齒預防保健',
  },
  {
    id: 'fluoride-18m',
    kind: 'dental',
    title: '牙齒塗氟（滿 1 歲 6 個月）',
    description:
      '未滿 6 歲兒童每 6 個月 1 次，由健保給付。與前次須間隔 6 個月以上。',
    dueMonth: 18,
    fromMonth: 18,
    toMonth: 24,
    source: '中央健康保險署 — 兒童牙齒預防保健',
  },
  {
    id: 'fluoride-24m',
    kind: 'dental',
    title: '牙齒塗氟（滿 2 歲）',
    description:
      '未滿 6 歲兒童每 6 個月 1 次，由健保給付。與前次須間隔 6 個月以上。',
    dueMonth: 24,
    fromMonth: 24,
    toMonth: 30,
    source: '中央健康保險署 — 兒童牙齒預防保健',
  },
  {
    id: 'fluoride-30m',
    kind: 'dental',
    title: '牙齒塗氟（滿 2 歲 6 個月）',
    description:
      '未滿 6 歲兒童每 6 個月 1 次，由健保給付。與前次須間隔 6 個月以上。',
    dueMonth: 30,
    fromMonth: 30,
    toMonth: 36,
    source: '中央健康保險署 — 兒童牙齒預防保健',
  },
  {
    id: 'fluoride-36m',
    kind: 'dental',
    title: '牙齒塗氟（滿 3 歲）',
    description:
      '未滿 6 歲兒童每 6 個月 1 次，由健保給付。與前次須間隔 6 個月以上。',
    dueMonth: 36,
    fromMonth: 36,
    toMonth: 42,
    source: '中央健康保險署 — 兒童牙齒預防保健',
  },

  // --- 行政登記 ---
  {
    id: 'pediatrician-registration',
    kind: 'admin',
    title: '登記幼兒專責醫師',
    description:
      '未滿 3 歲幼兒可加入幼兒專責醫師計畫，取得固定的兒科醫師照護。建議選擇平時看診方便且有參與計畫的院所。',
    dueMonth: 12,
    fromMonth: 12,
    toMonth: 36,
    source: '衛生福利部 — 幼兒專責醫師制度計畫',
  },
];
