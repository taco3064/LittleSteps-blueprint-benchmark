import { CookingTipCategory } from '~app/knowledge/domain/referenceModels';

// 烹調與保存技巧
export const cookingTips: CookingTipCategory[] = [
  {
    category: '冰磚製作',
    tips: [
      {
        title: '新舊食材分開煮',
        description:
          '試新食材時必須自己單獨蒸煮，確認不過敏後，下一餐才能跟「安全的舊食材」混在一起做冰磚',
      },
    ],
  },
  {
    category: '葉菜處理',
    tips: [
      {
        title: '汆燙優於蒸煮',
        description:
          '葉菜類含有較多農藥與硝酸鹽，建議用滾水汆燙60-90秒後撈起打泥，且燙青菜的水千萬不可重複利用或打泥',
      },
    ],
  },
  {
    category: '高湯熬煮',
    tips: [
      {
        title: '蔬菜高湯',
        description:
          '選擇會釋放甜味的食材（洋蔥、玉米、蘋果），避開會讓湯頭混濁的南瓜、馬鈴薯，且絕對不要用青菜熬湯',
      },
      {
        title: '大骨/肉類高湯',
        description:
          '骨頭或排骨必須從冷水下鍋開始汆燙，才能慢慢將骨頭內部的血水逼出',
      },
    ],
  },
  {
    category: '肉泥製作',
    tips: [
      {
        title: '熟肉泥 vs 生肉泥',
        description:
          '熟肉泥是蒸熟後打泥，口感較乾柴；生肉泥是將生肉剁碎分裝，要吃時加水調勻，淋入熱粥裡悶熟，口感較滑嫩',
      },
    ],
  },
];
