import { FoodAllergyLevel } from '~app/knowledge/domain/referenceModels';

// 蔬菜類過敏等級表
export const vegetableAllergyLevels: FoodAllergyLevel[] = [
  {
    level: 'low',
    ageRange: '6個月起',
    foods: [
      '白蘿蔔 (6m+)',
      '油菜 (6m+)',
      '大白菜 (6m+)',
      '胡蘿蔔 (6m+)',
      '菜花/花椰菜 (6m+)',
      '南瓜 (6m+)',
    ],
  },
  {
    level: 'medium',
    ageRange: '7-8個月起',
    foods: [
      '秋葵 (7m+)',
      '蓮藕 (7m+)',
      '絲瓜 (8m+)',
      '芹菜 (8m+)',
      '蘑菇 (8m+)',
      '韭菜 (18m+)',
    ],
  },
  {
    level: 'high',
    ageRange: '6-8個月起（需觀察）',
    foods: [
      '山藥 (6m+)',
      '番茄 (7m+)',
      '芋頭 (7m+)',
      '豌豆 (7m+)',
      '菠菜 (7m+)',
      '茄子 (8m+)',
    ],
  },
];
