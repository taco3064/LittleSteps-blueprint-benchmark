import { FoodRestrictionCategory } from '~app/knowledge/domain/referenceModels';

// 嬰幼兒飲食禁忌
export const infantFoodRestrictions: FoodRestrictionCategory[] = [
  {
    category: '絕對禁止',
    items: [
      {
        food: '蜂蜜',
        ageLimit: '1歲前',
        reason: '含有肉毒桿菌孢子，可能對嬰兒造成致命威脅',
      },
      {
        food: '半熟蛋、糖心蛋',
        ageLimit: '1歲前',
        reason: '寶寶一歲前只能吃全熟蛋，也不建議吃茶葉蛋或滷蛋',
      },
      {
        food: '未成熟的綠色蕃茄',
        ageLimit: '任何年齡',
        reason: '含有龍葵鹼，不可生食',
      },
    ],
  },
  {
    category: '需注意事項',
    items: [
      {
        food: '葡萄',
        ageLimit: '任何年齡',
        reason: '吃完葡萄後不要立刻喝水或牛奶，以免與葡萄發酵引發腹瀉',
      },
      {
        food: '鹽巴調味',
        ageLimit: '1歲前不建議',
        reason: '10個月前若厭食，可先調整粥的濃稠度或添加蔥、薑、蒜等天然辛香料提味',
      },
    ],
  },
];
