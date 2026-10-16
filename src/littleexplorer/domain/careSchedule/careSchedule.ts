import { addMonths, parseLocalDate, toLocalDateKey } from '~app/platform/domain/calendar';
import type {
  CareTaskProgress,
  VaccineProgress,
} from '~app/family/domain/familyRecords';
import type {
  CareTaskTemplate,
  ResolvedCareTask,
} from '~app/knowledge/domain/referenceModels';
import { resolveScheduleStatus } from '~app/knowledge/domain/scheduleStatus';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** 查該 template 綁定的疫苗劑次是否已接種，回傳接種日期或 undefined。 */
function vaccineCompletionDate(
  template: CareTaskTemplate,
  vaccineProgress: VaccineProgress,
): string | undefined {
  if (!template.vaccineId || template.vaccineDose === undefined) {
    return undefined;
  }

  const dose = vaccineProgress[template.vaccineId]?.doses?.[template.vaccineDose];

  if (!dose?.administered) {
    return undefined;
  }

  // 已接種但未記日期時回空字串，讓呼叫端仍能判定為 done。
  return dose.administeredDate ?? '';
}

/**
 * 依出生日將靜態時程展開為帶狀態的任務清單，依到期日遞增排序。
 * 完全無 I/O；today 可注入以利測試。
 */
export function resolveCareTasks({
  birthday,
  templates,
  careProgress,
  vaccineProgress,
  today = new Date(),
}: {
  birthday: string;
  templates: CareTaskTemplate[];
  careProgress: CareTaskProgress;
  vaccineProgress: VaccineProgress;
  today?: Date;
}): ResolvedCareTask[] {
  if (!birthday) {
    return [];
  }

  const todayLocal = parseLocalDate(toLocalDateKey(today));

  return templates
    .map((template) => {
      const dueDate = addMonths(birthday, template.dueMonth);
      const windowEnd = addMonths(birthday, template.toMonth);

      const completedDate
        = careProgress[template.id]?.completedDate
          ?? vaccineCompletionDate(template, vaccineProgress);

      return {
        template,
        dueDate,
        windowEnd,
        status: resolveScheduleStatus({
          completedDate: completedDate,
          today: todayLocal,
          dueDate: parseLocalDate(dueDate),
          windowEnd: parseLocalDate(windowEnd),
        }),
        daysUntilDue: daysBetween(todayLocal, parseLocalDate(dueDate)),
        completedDate,
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
