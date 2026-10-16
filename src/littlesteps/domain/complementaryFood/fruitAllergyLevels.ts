import { FoodAllergyLevel } from '~app/knowledge/domain/referenceModels';

// 水果類過敏等級表
export const fruitAllergyLevels: FoodAllergyLevel[] = [
  {
    level: 'low',
    ageRange: '6個月起',
    foods: [
      '蘋果 (6m+)',
      '梨 (6m+)',
      '藍莓 (6m+)',
      '葡萄 (6m+)',
      '棗 (6m+)',
      '李子 (10m+)',
    ],
  },
  {
    level: 'medium',
    ageRange: '7-9個月起',
    foods: [
      '香蕉 (7m+)',
      '甜瓜 (7m+)',
      '石榴 (7m+)',
      '櫻桃 (7m+)',
      '草莓 (9m+)',
      '西瓜 (9m+)',
    ],
  },
  {
    level: 'high',
    ageRange: '6-12個月起（需觀察）',
    foods: [
      '牛油果/酪梨 (6m+)',
      '桃子 (8m+)',
      '奇異果/獼猴桃 (8m+)',
      '柑橘類 (8m+)',
      '芒果 (12m+)',
      '鳳梨/菠蘿 (12m+)',
    ],
  },
];
