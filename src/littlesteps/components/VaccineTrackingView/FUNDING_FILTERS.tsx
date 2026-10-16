import { VaccineFunding } from '~app/knowledge/domain/referenceModels';
import { FundingFilter } from './FundingFilter';
export /**
 * 篩選器是四顆而不是五顆：健保有條件給付與各縣市不同併成「有條件」。
 *
 * 家長在這一頁問的是「這一劑要不要付錢」，答案只有三種——不用、要、看你符不符
 * 合條件。健保給付和縣市加碼都落在第三種，而且都得讀那一行條件才知道自己算不
 * 算，拆成兩顆 chip 是把同一個動作分成兩次。390px 上也放不下五顆。
 */
const FUNDING_FILTERS: {
  value: FundingFilter;
  label: string;
  /** 只有「全部」需要：那兩個字在這一頁的兩排篩選器裡各出現一次。 */
  ariaLabel?: string;
  funding: VaccineFunding[];
}[] = [
  { value: 'all', label: '全部', ariaLabel: '全部給付方式', funding: [] },
  { value: 'national', label: '公費', funding: ['national'] },
  {
    value: 'conditional',
    label: '有條件',
    funding: ['nhi-conditional', 'local-varies'],
  },
  { value: 'self-paid', label: '自費', funding: ['self-paid'] },
];
