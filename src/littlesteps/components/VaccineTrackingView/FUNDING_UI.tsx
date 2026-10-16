import { VaccineFunding } from '~app/knowledge/domain/referenceModels';

export /**
 * 四種付費狀態各自長什麼樣。
 *
 * disc 是月齡圓圈的底色，badge 是名稱旁的標籤，note 是條件那一行的底色。
 * 三者同色系，家長掃一眼圓圈就知道這一劑要不要錢，不必逐張讀標籤。
 * 全部取自 tailwind.config.js 的 token；文字一律用 -dark（>=4.5:1）。
 *
 * 文字本身在 utils/vaccineCalendar 的 FUNDING_LABEL：匯出到行事曆的那一劑
 * 得用同一個說法，不然同一件事在 app 裡和行事曆裡看起來像兩件事。
 */
const FUNDING_UI: Record<
  VaccineFunding,
  { disc: string; badge: string; note: string }
> = {
  national: {
    disc: 'bg-mint-dark',
    badge: 'bg-mint-light text-mint-dark',
    note: 'bg-mint-soft text-mint-dark',
  },
  'nhi-conditional': {
    disc: 'bg-secondary-dark',
    badge: 'bg-secondary-light text-secondary-dark',
    note: 'bg-secondary-soft text-secondary-dark',
  },
  'self-paid': {
    disc: 'bg-butter-dark',
    badge: 'bg-butter-light text-butter-dark',
    note: 'bg-butter-soft text-butter-dark',
  },
  'local-varies': {
    disc: 'bg-primary-dark',
    badge: 'bg-primary-light text-primary-dark',
    note: 'bg-primary-soft text-primary-dark',
  },
};
