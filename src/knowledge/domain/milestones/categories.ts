export const categories: {
  value: 'all' | 'physical' | 'motor' | 'cognitive' | 'feeding';
  label: string;
  icon: string;
}[] = [
  { value: 'all', label: '全部', icon: 'Grid3x3' },
  { value: 'physical', label: '大動作', icon: 'User' },
  { value: 'motor', label: '精細動作', icon: 'Hand' },
  { value: 'cognitive', label: '語言認知', icon: 'Brain' },
  { value: 'feeding', label: '飲食營養', icon: 'UtensilsCrossed' },
];
