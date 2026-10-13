import { VaccineSideEffect, VaccineEmergency } from '../records';

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

// 緊急狀況指南
export const vaccineEmergencies: VaccineEmergency[] = [
  {
    id: 'seizure',
    symptom: '抽搐或痙攣',
    icon: 'Zap',
    action: '保持側臥、移除周圍危險物品、記錄時間長度、立即送急診',
  },
  {
    id: 'anaphylaxis',
    symptom: '全身起疹、呼吸困難、嘴唇腫脹',
    icon: 'AlertOctagon',
    action: '疑似過敏性休克，立即撥打119並平躺抬高雙腳',
  },
  {
    id: 'intussusception',
    symptom: '嚴重腹痛、血便、果醬狀大便',
    icon: 'Activity',
    action: '可能腸套疊（輪狀病毒疫苗罕見併發症），立即急診',
  },
  {
    id: 'high-fever',
    symptom: '持續高燒>40°C',
    icon: 'Flame',
    action: '冰枕降溫、給予退燒藥後立即就醫',
  },
  {
    id: 'lethargy',
    symptom: '極度嗜睡、無法喚醒',
    icon: 'Moon',
    action: '立即送急診，可能有神經系統反應',
  },
];

// 接種禁忌與注意事項
export const vaccineContraindications = [
  {
    title: '暫緩接種',
    items: [
      '正在發燒（體溫≥38°C）',
      '中重度急性疾病',
      '正在使用免疫抑制劑',
      '近期接受過輸血或免疫球蛋白',
      '孕婦（針對活性減毒疫苗）',
    ],
  },
  {
    title: '絕對禁忌',
    items: [
      '曾對該疫苗成分產生嚴重過敏',
      '接種後曾發生過敏性休克',
      '免疫不全者不可接種活性減毒疫苗（麻疹、水痘、卡介苗、日本腦炎嵌合疫苗、口服輪狀病毒）',
      '嚴重營養不良者不應接種活性減毒疫苗',
    ],
  },
  {
    title: '接種後注意',
    items: [
      '留院觀察至少30分鐘，確認無立即過敏反應',
      '24小時內避免劇烈運動',
      '注射部位保持清潔乾燥，可正常洗澡',
      '記錄接種日期與疫苗批號',
      '接種後應坐著接種，不可平躺',
    ],
  },
  {
    title: '可以接種的情況',
    items: [
      '有咳嗽、流鼻水等呼吸道症狀已有一段時間',
      '正接受抗生素治療',
      '感染症的恢復期',
      '一般感冒症狀（但發高燒除外）',
    ],
  },
];

// 疫苗種類
export const vaccineTypes = [
  {
    type: '非活性疫苗',
    description: '只含病原的部分抗原或已經被去除活性的病原',
    examples: [
      'A型肝炎疫苗',
      'B型肝炎疫苗',
      '白喉類毒素',
      '破傷風類毒素',
      '百日咳疫苗',
      'b型嗜血桿菌疫苗',
      '注射小兒麻痺疫苗',
      '流感疫苗',
      '肺炎鏈球菌疫苗',
      '人類乳突病毒疫苗',
      '腦膜炎球菌疫苗',
    ],
  },
  {
    type: '活性減毒疫苗',
    description: '含有毒性減弱的病原',
    examples: [
      '卡介苗',
      '麻疹疫苗',
      '腮腺炎疫苗',
      '德國麻疹疫苗',
      '水痘疫苗',
      '日本腦炎嵌合疫苗',
      '口服輪狀病毒疫苗',
    ],
    notes: '活性減毒疫苗如不能同時接種，至少需間隔28天',
  },
];

// 疫苗接種重要須知
export const vaccineGuidelines = [
  {
    title: '接種前準備',
    items: [
      '接種應坐著進行，不可平躺',
      '可同時接種多種疫苗於不同部位，數目無上限',
      '活性減毒疫苗若不同時接種，需間隔至少28天',
    ],
  },
  {
    title: '接種後處理',
    items: [
      '注射後在接種單位觀察至少30分鐘',
      '不必特意揉注射部位',
      '可以正常作息，包括洗澡',
      '局部紅腫不可熱敷，冰敷可稍微止痛',
      '注射部位紅腫直徑偶爾可超過10公分，是正常強烈免疫反應',
    ],
  },
  {
    title: '副作用處理',
    items: [
      '發燒反應通常在接種後24小時內發生，不會持續超過24小時',
      '有必要時可給予退燒藥（但預防性退燒藥可能稍微降低免疫效果）',
      '注意補充水分以免脫水',
      '3-5歲以下兒童發燒可能引起熱痙攣，通常不超過15-20分鐘',
      '局部紅腫超過2-3天還擴大，應就醫檢查是否感染',
      '如出現咳嗽、流鼻水、腹瀉等症狀，宜由兒科醫師診治',
    ],
  },
];
