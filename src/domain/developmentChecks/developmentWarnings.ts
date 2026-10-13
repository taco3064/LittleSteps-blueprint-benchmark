import type { DevelopmentWarning } from '../records';

const REFERRAL_ACTION
  = '請向平時看診的兒科醫師反映，或聯繫各縣市早期療育通報轉介中心，安排兒童發展聯合評估中心進一步評估。發展遲緩越早介入，改善空間越大。';

export const developmentWarnings: DevelopmentWarning[] = [
  {
    ageBand: '12-15',
    signals: ['不會扶著家具行走', '不會用手指出想要的東西', '叫他的名字沒有反應'],
    action: REFERRAL_ACTION,
  },
  {
    ageBand: '15-18',
    signals: [
      '不會說任何有意義的單字',
      '不會模仿大人的日常動作',
      '無法理解簡單的指令',
    ],
    action: REFERRAL_ACTION,
  },
  {
    ageBand: '18-24',
    signals: ['仍無法獨立行走', '會使用的詞彙少於 10 個', '不會用手勢或聲音表達需求'],
    action: REFERRAL_ACTION,
  },
  {
    ageBand: '24-30',
    signals: [
      '不會說兩個詞組成的短句',
      '很少與人有眼神接觸',
      '對其他孩子完全沒有興趣',
    ],
    action: REFERRAL_ACTION,
  },
  {
    ageBand: '30-36',
    signals: [
      // 官方紅旗是「連最親近的大人也聽不懂」。3 歲時外人聽不懂但家人聽得懂
      // 相當常見且不屬警訊，寫成「外人聽不懂」會在正常發展的孩子身上誤觸。
      '說話含糊到連家人也聽不懂',
      // 官方 3 歲項目只涵蓋「走上樓梯」；「下樓梯」在 4 歲前沒有對應項目。
      '不會扶著欄杆走上樓梯',
      '完全沒有出現假想遊戲',
    ],
    action: REFERRAL_ACTION,
  },
];
