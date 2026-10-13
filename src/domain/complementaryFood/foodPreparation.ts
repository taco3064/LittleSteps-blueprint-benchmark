import {
  CookingTipCategory,
  FoodHandlingCategory,
  FoodRestrictionCategory,
  FoodQAItem,
} from '../records';

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
        description: '骨頭或排骨必須從冷水下鍋開始汆燙，才能慢慢將骨頭內部的血水逼出',
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

// 食材特殊處理
export const foodHandlingTips: FoodHandlingCategory[] = [
  {
    category: '發芽處理',
    items: [
      {
        food: '馬鈴薯',
        canEat: false,
        note: '發芽會產生「龍葵鹼」毒素，加熱也無法破壞，只要發芽必須整顆丟棄',
      },
      {
        food: '地瓜',
        canEat: true,
        note: '發芽挖掉芽眼即可，只是澱粉下降口感變差',
      },
      {
        food: '洋蔥、蒜頭',
        canEat: true,
        note: '發芽仍可食用，只是較不甜',
      },
    ],
  },
  {
    category: '變色問題',
    items: [
      {
        food: '紅蘿蔔、南瓜、地瓜',
        canEat: true,
        note: '吃太多會因「胡蘿蔔素」使皮膚染黃，停吃即可消退，對健康無礙',
      },
      {
        food: '蓮藕、地瓜',
        canEat: true,
        note: '削皮後易氧化變黑，處理後可泡水隔絕空氣',
      },
    ],
  },
  {
    category: '特殊處理技巧',
    items: [
      {
        food: '蓮藕',
        canEat: true,
        note: '必須冷水下鍋煮開才會鬆軟，千萬不能等水滾才下鍋，也絕對不能加醋（會變脆）',
      },
      {
        food: '芋頭、山藥',
        canEat: true,
        note: '含刺激性植物鹼，處理時可戴手套；若發癢可用火微烤雙手或用熱水、醋水、檸檬汁清洗',
      },
      {
        food: '苦瓜',
        canEat: true,
        note: '可先冰鎮後再汆燙去苦味',
      },
    ],
  },
];

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

// 副食品常見問答
export const foodQA: FoodQAItem[] = [
  {
    question: '什麼時候開始給副食品？',
    answer:
      '除非厭奶嚴重經醫師指示，否則皆應從4個月大開始給予副食品。打預防針後或正在換奶時，應避免測試新食材',
  },
  {
    question: '餵食方式與順序？',
    answer:
      '必須使用「湯匙」餵食以訓練吞嚥，絕對不能用奶瓶餵米湯或米糊。母奶寶寶可先喝奶再吃副食，或在兩餐奶中間給予，重點是選在寶寶精神好且「不會太餓」的時候餵',
  },
  {
    question: '吃不完的副食品可以留到下一餐嗎？',
    answer:
      '沾過口水的副食品不可留到下一餐；若加熱到一半寶寶睡著，放保溫電鍋超過1小時就應倒掉，以免變質',
  },
  {
    question: '需要額外喝水嗎？',
    answer: '吃副食後應觀察便便，若無硬便不喝水也無妨；開始吃副食就要記錄排便次數',
  },
  {
    question: '便便變得很奇怪是正常的嗎？',
    answer:
      '吃副食後便便次數增加1-2次且呈糊泥狀屬正常腸胃適應；若一天排出「水便」超過6次，且伴隨排氣水聲，則可能是腸胃型病毒感染，'
      + '需帶尿布就醫。紅蘿蔔、金針菇等富含纖維的食材，隔天隨便便原封不動排出是正常的',
  },
  {
    question: '豆腐如何保存？',
    answer:
      '傳統豆腐含鈣量高於盒裝豆腐。買回家後需泡在開水中並放入冰箱冷藏，每天必須換水，最好5天內吃完以免變酸腐壞',
  },
];
