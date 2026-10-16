import { developmentCheckItemsPart1 } from './developmentCheckItemsPart1';
import { developmentCheckItemsPart2 } from './developmentCheckItemsPart2';
/**
 * 幼兒期（1-3 歲）發展檢核題庫與紅旗警訊。
 *
 * ── 年齡歸屬查核來源（查核日期：2026-08-27）─────────────────────────
 * 1. 高雄市政府衛生局／高雄市早期療育綜合服務網
 *    《學前兒童發展檢核表（乙表）1 歲 3 月至 2 歲半》103.03 修訂
 *    《學前兒童發展檢核表（丙表）3 歲至 4 歲》103.03 修訂
 *    此二表即臺北市兒童發展篩檢工具第二版（Taipei-II）題項，為本檔
 *    年齡歸屬的主要依據。
 * 2. 臺北市政府衛生局〈臺北市學齡前兒童發展檢核表〉13 個年齡層版本
 *    （資料更新 115-04-29），年齡層界定與本檔 5 個 ageBand 對應如下：
 *      12-15 → 1 歲 3 個月（1 歲 2 個月 16 天～1 歲 5 個月 15 天）
 *      15-18 → 1 歲半    （1 歲 5 個月 16 天～1 歲 11 個月 15 天）
 *      18-24 → 2 歲      （1 歲 11 個月 16 天～2 歲 5 個月 15 天）
 *      24-30 → 2 歲半    （2 歲 5 個月 16 天～2 歲 11 個月 15 天）
 *      30-36 → 3 歲      （2 歲 11 個月 16 天～3 歲 5 個月 15 天）
 *    故每題的通過判準以「該年齡段結束時」為準，與官方檢核點一致。
 * 3. 衛生福利部國民健康署《兒童健康手冊》「兒童發展連續圖」；
 *    國民健康署孕產兒關懷網站〈嬰幼兒的成長發展里程碑：月齡別指南〉。
 * 4. 兒童福利聯盟〈兒童發展總整理：0～6 歲指標〉（引國健署發展連續圖）。
 *
 * ── 撰寫原則 ────────────────────────────────────────────────
 * 官方檢核表是「篩檢」工具，門檻刻意壓低以免過度轉介；本檔的檢核題是
 * 「典型發展」目標，門檻較高。兩者本非同一把尺，例如 2 歲的詞彙量：
 * 典型值約 50 個，而官方轉介門檻是 10 個。凡本檔題目早於或嚴於官方
 * 檢核表者，`detail` 一律明講官方的實際門檻與較晚出現仍屬正常的區間，
 * 避免家長把「未達典型值」誤讀成「發展遲緩」。
 *
 * `developmentWarnings` 才是紅旗，以「缺席」描述，門檻對齊官方檢核表。
 */

import type {
  DevelopmentCheckItem,
  DevelopmentDomain,
  DevelopmentWarning,
  ToddlerAgeBand,
} from '~app/knowledge/domain/referenceModels';

export const ageBandLabels: Record<ToddlerAgeBand, string> = {
  '12-15': '1 歲-1 歲 3 個月',
  '15-18': '1 歲 3 個月-1 歲 6 個月',
  '18-24': '1 歲 6 個月-2 歲',
  '24-30': '2 歲-2 歲 6 個月',
  '30-36': '2 歲 6 個月-3 歲',
};

export const domainLabels: Record<DevelopmentDomain, string> = {
  'gross-motor': '粗動作',
  'fine-motor': '細動作',
  language: '語言溝通',
  cognitive: '認知',
  social: '身邊處理與社會性',
};

export const developmentCheckItems: DevelopmentCheckItem[] = [
  ...developmentCheckItemsPart1,
  ...developmentCheckItemsPart2,
];

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
    signals: [
      '仍無法獨立行走',
      '會使用的詞彙少於 10 個',
      '不會用手勢或聲音表達需求',
    ],
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
