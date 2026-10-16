import { FoodProgressionByAge } from '~app/knowledge/domain/referenceModels';

// 循序漸進：質地與頻率轉變
export const foodProgression: FoodProgressionByAge[] = [
  {
    ageRange: '4-6個月',
    texture: '極稀流質/泥狀（十倍粥、十倍粥泥）',
    frequency: '1天1次（少量1-2匙開始）',
    purpose: '練習舌頭後推與吞嚥',
  },
  {
    ageRange: '7-9個月',
    texture: '濃稠泥/小顆粒粥（七倍粥、剁碎蔬菜）',
    frequency: '1天2次（逐漸取代一餐奶）',
    purpose: '練習用舌頭與牙齦壓碎食物',
  },
  {
    ageRange: '10-12個月',
    texture: '軟塊/手指食物（五倍粥、軟飯、丁狀肉）',
    frequency: '1天3次（與成人用餐同步）',
    purpose: '練習咀嚼能力與手眼協調',
  },
];
