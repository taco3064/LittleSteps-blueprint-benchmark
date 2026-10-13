export type DiaryMood = 'happy' | 'proud' | 'tired' | 'worried' | 'funny';

export interface DiaryEntry {
  id: string;
  childId: string;
  /** YYYY-MM-DD，家長可改，預設今天 */
  date: string;
  content: string;
  mood?: DiaryMood;
  /** 由成長分頁勾選時建立的條目會帶此欄，指向該檢核項目 */
  linkedCheckItemId?: string;
  createdAt: string; // ISO 8601
  updatedAt?: string;
}
