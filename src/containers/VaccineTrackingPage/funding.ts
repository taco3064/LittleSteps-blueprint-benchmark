import type { VaccineFunding } from '~app/domain/records';
type FundingFilter = 'all' | 'national' | 'conditional' | 'self-paid';

export const FUNDING_FILTERS: {
  value: FundingFilter;
  label: string;

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
