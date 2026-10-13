export interface PregnancyData {
  childId: string;
  dueDate: string; // YYYY-MM-DD
  lastPeriodDate: string; // YYYY-MM-DD
  status: 'active' | 'archived';
}

/** 產檢與篩檢項目的完成記錄，鍵為 prenatalCheckupSchedule 的 template id。 */
export interface PrenatalCheckupProgress {
  [templateId: string]: {
    completedDate: string; // YYYY-MM-DD
    clinicName?: string;
    notes?: string;
  };
}
