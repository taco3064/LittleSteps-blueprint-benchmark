import { FingerFoodGuideline } from '~app/knowledge/domain/referenceModels';

// 手指食物挑選指南
export const fingerFoodGuidelines: FingerFoodGuideline[] = [
  {
    category: '蔬菜類',
    examples: [
      '蒸熟的紅蘿蔔條',
      '綠花椰菜（帶梗方便抓）',
      '南瓜塊',
      '玉米筍（煮極軟）',
    ],
  },
  {
    category: '水果類',
    examples: ['香蕉段（切半）', '酪梨條', '去皮切片的軟柿或水蜜桃'],
  },
  {
    category: '澱粉類',
    examples: ['烤過的吐司條（去邊）', '軟質飯糰', '煮軟的螺旋麵'],
  },
  {
    category: '蛋白類',
    examples: ['漢堡排（碎肉壓製）', '厚片蛋餅'],
  },
];
