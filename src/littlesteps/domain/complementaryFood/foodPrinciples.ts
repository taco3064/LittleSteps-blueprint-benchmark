import { FoodPrinciple } from '~app/knowledge/domain/referenceModels';

// 副食品添加三大原則
export const foodPrinciples: FoodPrinciple[] = [
  {
    id: 'early-start',
    title: '四個月就可以開始吃副食品',
    description: '把握4-9個月免疫耐受性黃金時期，及早接觸反而能降低過敏機率',
    icon: 'Calendar',
  },
  {
    id: 'no-delay',
    title: '父母有過敏體質也不需延後',
    description: '現代醫學已證實，太晚給副食品非但不能減少過敏，反而可能提高',
    icon: 'ShieldCheck',
  },
  {
    id: 'natural-foods',
    title: '一歲前除蜂蜜外都可嘗試',
    description: '什麼天然食物都可以添加，除非吃了產生過敏症狀。少量多樣化最重要',
    icon: 'Leaf',
  },
];
