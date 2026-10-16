import { FoodHandlingCategory } from '~app/knowledge/domain/referenceModels';

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
