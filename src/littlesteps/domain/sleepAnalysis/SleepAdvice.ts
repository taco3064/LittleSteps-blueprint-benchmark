// 睡眠建議介面
export interface SleepAdvice {
  category: 'good' | 'attention' | 'improve';
  title: string;
  description: string;
  suggestions: string[];
}
