import { VaccineEmergency } from '../referenceModels';

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
