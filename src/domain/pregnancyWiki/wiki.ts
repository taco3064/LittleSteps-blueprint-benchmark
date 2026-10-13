import { pregnancyWikiArticlesNutrition } from './nutritionPregnancyWikiArticles';
import { pregnancyWikiArticlesSymptoms } from './symptomsPregnancyWikiArticles';
import { pregnancyWikiArticlesHealth } from './healthPregnancyWikiArticles';
import { pregnancyWikiArticlesCheckup } from './checkupPregnancyWikiArticles';
import { pregnancyWikiArticlesLifestyle } from './lifestylePregnancyWikiArticles';
/**
 * 孕期知識庫 — LittleBloom
 *
 * 內容查證日期：2026-09-04（本次新增「孕期該打哪些疫苗」並重新查證該篇每一項引用；
 * 其餘各篇維持 2026-08-27 的查證結果）
 *
 * 本檔案每一篇的 causes / solutions / warningSignals 皆逐篇對照下列來源撰寫，
 * 醫療數值與法規天數一律查證原始出處，未依記憶填寫。各篇引用的來源標於該篇物件上方。
 *
 * 共同查閱來源：
 * - 衛生福利部國民健康署「國人膳食營養素參考攝取量（DRIs）」第八版
 *   https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=4248&pid=12285
 * - 衛生福利部「孕期營養超重要 關鍵三寶葉酸、碘、鐵助好孕」（葉酸 400/600 µg、鐵第三期 45 mg）
 *   https://www.mohw.gov.tw/cp-3558-37603-1.html
 * - 國民健康署 孕產婦關懷網站（孕期體重調控、胃食道逆流、便秘、旅行、超音波等衛教）
 *   https://mammy.hpa.gov.tw/
 * - 國民健康署「孕婦健康手冊／孕媽咪健康手冊」與「孕婦產前檢查項目及補助金額」
 *   https://www.hpa.gov.tw/Pages/EBook.aspx?nodeid=1142
 *   https://www.hpa.gov.tw/Pages/List.aspx?nodeid=194
 * - 衛生福利部「擴大補助產檢服務 110 年 7 月 1 日正式上路」（10 → 14 次、超音波 3 次、
 *   第 24-28 週新增妊娠糖尿病篩檢與貧血檢驗）
 *   https://www.mohw.gov.tw/cp-5017-61688-1.html
 *   https://www.mohw.gov.tw/cp-16-80145-1.html
 * - 全國法規資料庫：勞動基準法第 50 條、性別平等工作法第 15 條、勞工請假規則第 4 條（條文逐字引用）
 *   https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0030001&flno=50
 *   https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0030014&flno=15
 *   https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0030006&flno=4
 * - 衛生福利部食品藥物管理署 非類固醇抗發炎藥品（NSAIDs）中文仿單修訂內容
 *   https://www.tma.tw/files/meeting/N202427152636_001.pdf
 *   藥害救濟基金會 非類固醇消炎藥品安全資訊風險溝通表
 *   https://www.tdrf.org.tw/2020/11/24/safety02-49/
 * - 衛生福利部疾病管制署 弓形蟲（Toxoplasmosis）疾病介紹
 *   https://www.cdc.gov.tw/
 *   （孕期疫苗的出處逐項標在 health-vaccination 那篇上方，不放在這裡的共同來源）
 * - 臺北榮總、臺中榮總、中國醫藥大學附設醫院、三軍總醫院、新竹臺大分院 婦產部／營養室衛教單張
 */

import type {
  PregnancyWikiArticle,
  PregnancyWikiCategory,
  WikiCategoryColors,
} from '../records';

export const pregnancyWikiCategoryLabels: Record<PregnancyWikiCategory, string> = {
  nutrition: '孕期營養',
  health: '健康照護',
  symptoms: '身體變化',
  checkup: '產檢須知',
  lifestyle: '生活作息',
};

export const pregnancyWikiCategoryColors: Record<
  PregnancyWikiCategory,
  WikiCategoryColors
> = {
  nutrition: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    pill: 'bg-rose-100 text-rose-700',
  },
  health: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    pill: 'bg-emerald-100 text-emerald-700',
  },
  symptoms: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    pill: 'bg-amber-100 text-amber-700',
  },
  checkup: { bg: 'bg-sky-50', text: 'text-sky-700', pill: 'bg-sky-100 text-sky-700' },
  lifestyle: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    pill: 'bg-violet-100 text-violet-700',
  },
};

export const pregnancyWikiArticles: PregnancyWikiArticle[] = [
  ...pregnancyWikiArticlesNutrition,
  ...pregnancyWikiArticlesSymptoms,
  ...pregnancyWikiArticlesHealth,
  ...pregnancyWikiArticlesCheckup,
  ...pregnancyWikiArticlesLifestyle,
];
