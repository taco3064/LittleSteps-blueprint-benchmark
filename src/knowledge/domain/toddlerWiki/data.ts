import { toddlerWikiArticlesPart1 } from './toddlerWikiArticlesPart1';
import { toddlerWikiArticlesPart2 } from './toddlerWikiArticlesPart2';
import { toddlerWikiArticlesPart3 } from './toddlerWikiArticlesPart3';
import { toddlerWikiArticlesPart4 } from './toddlerWikiArticlesPart4';
import { toddlerWikiArticlesPart5 } from './toddlerWikiArticlesPart5';
import { toddlerWikiArticlesPart6 } from './toddlerWikiArticlesPart6';
import { toddlerWikiArticlesPart7 } from './toddlerWikiArticlesPart7';
import { toddlerWikiArticlesPart8 } from './toddlerWikiArticlesPart8';
/**
 * 幼兒知識庫（1-3 歲）— LittleExplorer
 *
 * 內容查證日期：2026-08-27
 *
 * 本檔案的 causes / solutions / warningSignals 皆逐篇對照下列來源撰寫，
 * 未依記憶填寫。各篇引用的來源標於該篇物件上方。
 *
 * 共同查閱來源：
 * - 衛生福利部國民健康署「兒童健康手冊」（兒童發展連續圖、家長紀錄事項、發展警訊題項）
 *   https://www.mohw.gov.tw/cp-16-58340-1.html
 * - 衛生福利部「未滿 7 歲兒童新增 6 次兒童發展篩檢服務」（113/07/01 起）
 *   https://www.mohw.gov.tw/cp-16-79140-1.html
 * - 衛生福利部「發展遲緩兒童早期療育」與兒童發展聯合評估中心
 *   https://www.mohw.gov.tw/cp-190-238-1.html
 * - 國民健康署「每日飲食指南」1-3 歲幼兒六大類建議份量、《幼兒期營養參考手冊》
 *   https://www.mohw.gov.tw/cp-16-40152-1.html
 * - 國民健康署 兒童事故傷害統計與居家安全建議（0-6 歲跌落 62.6%、燒燙傷 13.2%；客廳為最常跌倒地點）
 *   https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=1126&pid=1852
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1830&type=01（孕產兒關懷網站－事故傷害預防）
 * - 國民健康署 3C 使用建議（2 歲以下不使用、2-4 歲每日不超過 60 分鐘、每 30 分鐘休息 10 分鐘）
 *   https://www.mohw.gov.tw/fp-16-58958-1.html（「手機還我 孩子不哭」）
 * - 國家衛生研究院《兒童健康政策與照護品質》第十三章第一節「3C 產品的使用」
 *   https://chrc.nhri.edu.tw/professionals/files/chapters/13_1_3C%E7%94%A2%E5%93%81%E7%9A%84%E4%BD%BF%E7%94%A8.pdf
 * - 臺大醫院健康電子報／中國醫藥大學附設醫院／嘉義基督教醫院 兒科衛教單張（頭部外傷、便秘、異物哽塞）
 * - 馬偕紀念醫院、臺大醫院新竹分院 小兒發燒衛教
 */

import type {
  ToddlerWikiArticle,
  ToddlerWikiCategory,
  WikiCategoryColors,
} from '../referenceModels/index';

export const toddlerWikiCategoryLabels: Record<ToddlerWikiCategory, string> = {
  toilet: '如廁訓練',
  language: '語言發展',
  emotion: '情緒與行為',
  eating: '飲食與挑食',
  sleep: '睡眠轉換',
  safety: '學步期安全',
  health: '生病與就醫',
  preschool: '入園與社交',
};

export const toddlerWikiCategoryColors: Record<
  ToddlerWikiCategory,
  WikiCategoryColors
> = {
  toilet: { bg: 'bg-sky-50', text: 'text-sky-700', pill: 'bg-sky-100 text-sky-700' },
  language: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    pill: 'bg-violet-100 text-violet-700',
  },
  emotion: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    pill: 'bg-rose-100 text-rose-700',
  },
  eating: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    pill: 'bg-amber-100 text-amber-700',
  },
  sleep: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    pill: 'bg-indigo-100 text-indigo-700',
  },
  safety: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    pill: 'bg-orange-100 text-orange-700',
  },
  health: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    pill: 'bg-teal-100 text-teal-700',
  },
  preschool: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    pill: 'bg-emerald-100 text-emerald-700',
  },
};

export const toddlerWikiArticles: ToddlerWikiArticle[] = [
  ...toddlerWikiArticlesPart1,
  ...toddlerWikiArticlesPart2,
  ...toddlerWikiArticlesPart3,
  ...toddlerWikiArticlesPart4,
  ...toddlerWikiArticlesPart5,
  ...toddlerWikiArticlesPart6,
  ...toddlerWikiArticlesPart7,
  ...toddlerWikiArticlesPart8,
];
