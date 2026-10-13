import type {
  CareTaskProgress,
  CareTaskTemplate,
  ChildProfile,
  GrowthRecord,
  VaccineProgress,
  VaccineSchedule,
} from '../records';
import type { PrenatalCheckupTemplate } from '../prenatalCheckups';

/**
 * 一條連續的健康紀錄。
 *
 * 「某天發生的一件健康事件」在這個 app 裡有四種形狀，鍵策略與日期欄位名稱
 * 全都不同：
 *   vaccineProgress/{vaccineId}/doses/{n}.administeredDate
 *   growthRecords/{recordId}.date
 *   prenatalProgress/{templateId}.completedDate
 *   careTaskProgress/{taskId}.completedDate
 *
 * 四者住在同一個 children/{childId} 節點、同一條讀取規則下，所以這從來不是
 * 權限問題，是沒有人寫轉接層。最寬的聚合器 useClinicSummary 只涵蓋其中兩種
 * （成長與疫苗），而且是 LittleSteps 專屬——這也是「產檢 → 兒童健檢」講不出
 * 一句連續故事的原因：資料都在，形狀不通。
 *
 * 這個模組只做轉接，不新增儲存、不改任何寫入路徑。四種形狀各自仍然是自己
 * 服務的真相來源。
 */

export type HealthEventKind = 'prenatal' | 'vaccine' | 'growth' | 'checkup';

export interface HealthEvent {
  /** 同一筆事件的穩定識別，跨形狀不重複 */
  id: string;
  kind: HealthEventKind;
  /** 事件發生日 YYYY-MM-DD。空字串代表「有記錄但沒填日期」，見下方說明 */
  date: string;
  title: string;
  /** 院所名稱，來源有記才有 */
  location?: string;
  notes?: string;
}

/**
 * 疫苗只勾了接種、沒填日期的情形是真實存在的（VaccineTrackingPage 允許）。
 * 那種紀錄要留在時間軸上——它是打過的證據——但排序時放最後，因為放不進任何
 * 一天。丟掉它會讓時間軸看起來比實際少打了幾劑。
 */
const UNDATED = '';

function prenatalEvents(
  child: ChildProfile,
  templates: PrenatalCheckupTemplate[],
): HealthEvent[] {
  const progress = child.prenatalProgress ?? {};

  return Object.entries(progress).map(([templateId, record]) => {
    const template = templates.find((item) => item.id === templateId);

    return {
      id: `prenatal:${templateId}`,
      kind: 'prenatal' as const,
      date: record.completedDate ?? UNDATED,
      title: template ? `產檢：${template.title}` : `產檢：${templateId}`,
      location: record.clinicName,
      notes: record.notes,
    };
  });
}

function vaccineEvents(
  progress: VaccineProgress,
  schedules: VaccineSchedule[],
): HealthEvent[] {
  const events: HealthEvent[] = [];

  for (const [vaccineId, record] of Object.entries(progress)) {
    for (const [doseNumber, dose] of Object.entries(record?.doses ?? {})) {
      if (!dose?.administered) {
        continue;
      }

      const schedule = schedules.find(
        (item) =>
          item.id === vaccineId && (item.currentDose ?? 1) === Number(doseNumber),
      );

      events.push({
        id: `vaccine:${vaccineId}:${doseNumber}`,
        kind: 'vaccine',
        date: dose.administeredDate ?? UNDATED,
        title: schedule ? schedule.name : `疫苗：${vaccineId} 第 ${doseNumber} 劑`,
      });
    }
  }

  return events;
}

function growthEvents(records: GrowthRecord[]): HealthEvent[] {
  return records.map((record) => {
    // 只寫量到的那幾項：沒量頭圍就不該在時間軸上留下一個空欄位。
    const measured = [
      record.weight !== undefined ? `體重 ${record.weight} kg` : null,
      record.height !== undefined ? `身高 ${record.height} cm` : null,
      record.headCircumference !== undefined
        ? `頭圍 ${record.headCircumference} cm`
        : null,
    ].filter(Boolean);

    return {
      id: `growth:${record.id}`,
      kind: 'growth' as const,
      date: record.date,
      title: measured.length > 0 ? `成長紀錄：${measured.join('、')}` : '成長紀錄',
      notes: record.notes,
    };
  });
}

function checkupEvents(
  progress: CareTaskProgress,
  templates: CareTaskTemplate[],
): HealthEvent[] {
  return Object.entries(progress).map(([taskId, record]) => {
    const template = templates.find((item) => item.id === taskId);

    return {
      id: `checkup:${taskId}`,
      kind: 'checkup' as const,
      date: record.completedDate ?? UNDATED,
      title: template ? template.title : taskId,
      location: record.location,
      notes: record.notes,
    };
  });
}

export interface HealthTimelineSources {
  child: ChildProfile;
  growthRecords: GrowthRecord[];
  vaccineSchedules: VaccineSchedule[];
  careTaskTemplates: CareTaskTemplate[];
  prenatalTemplates: PrenatalCheckupTemplate[];
}

/**
 * 把四種形狀併成一條依日期遞減排序的時間軸（最新在前）。
 *
 * 沒有日期的紀錄排在最後，不是被丟掉——那是打過的證據，只是放不進任何一天。
 *
 * 完全無 I/O，也不碰 Firebase：呼叫端已經有這些資料了。
 */
export function buildHealthTimeline(sources: HealthTimelineSources): HealthEvent[] {
  const events = [
    ...prenatalEvents(sources.child, sources.prenatalTemplates),
    ...vaccineEvents(sources.child.vaccineProgress ?? {}, sources.vaccineSchedules),
    ...growthEvents(sources.growthRecords),
    ...checkupEvents(sources.child.careTaskProgress ?? {}, sources.careTaskTemplates),
  ];

  return events.sort((a, b) => {
    if (a.date === UNDATED) {
      return b.date === UNDATED ? 0 : 1;
    }

    if (b.date === UNDATED) {
      return -1;
    }

    return b.date.localeCompare(a.date);
  });
}
