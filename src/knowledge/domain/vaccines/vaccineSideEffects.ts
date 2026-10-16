import { VaccineSideEffect } from '../referenceModels';

// 疫苗副作用與處理
export const vaccineSideEffects: VaccineSideEffect[] = [
  {
    category: '常見輕微反應',
    icon: 'Thermometer',
    reactions: [
      {
        symptom: '發燒（<38.5°C）',
        severity: 'mild',
        response: '多喝水、穿著輕薄衣物、溫水擦拭身體',
      },
      {
        symptom: '注射部位紅腫疼痛',
        severity: 'mild',
        response: '冰敷15-20分鐘，避免搓揉',
      },
      {
        symptom: '食慾不振、煩躁不安',
        severity: 'mild',
        response: '少量多餐、多安撫、觀察1-2天',
      },
      {
        symptom: '嗜睡',
        severity: 'mild',
        response: '讓寶寶充分休息，但需定時確認反應',
      },
    ],
  },
  {
    category: '需密切觀察',
    icon: 'AlertCircle',
    reactions: [
      {
        symptom: '持續高燒（≥38.5°C超過24小時）',
        severity: 'moderate',
        response: '使用退燒藥（依醫囑），若超過48小時未退燒需就醫',
      },
      {
        symptom: '注射部位硬塊（>2公分）',
        severity: 'moderate',
        response: '溫熱敷、輕柔按摩，若持續擴大需回診',
      },
      {
        symptom: '輕微出疹（麻疹、水痘疫苗）',
        severity: 'moderate',
        response: '保持皮膚清潔乾燥，避免抓破，5-7天內會消退',
      },
    ],
  },
  {
    category: '立即就醫',
    icon: 'AlertTriangle',
    reactions: [
      {
        symptom: '高燒不退（>39°C）伴隨抽搐',
        severity: 'severe',
        response: '立即送急診，保持呼吸道暢通',
      },
      {
        symptom: '呼吸困難、臉色蒼白、嘴唇發紫',
        severity: 'severe',
        response: '疑似過敏性休克，立即叫救護車',
      },
      {
        symptom: '持續嘔吐、嚴重腹瀉（輪狀病毒疫苗）',
        severity: 'severe',
        response: '可能腸套疊，立即就醫',
      },
      {
        symptom: '活動力極差、不吃不喝超過8小時',
        severity: 'severe',
        response: '立即就醫檢查',
      },
    ],
  },
];
