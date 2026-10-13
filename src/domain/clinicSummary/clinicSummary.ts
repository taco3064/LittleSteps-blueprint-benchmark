import { careTaskTemplates } from '../careTasks';
import { buildHealthTimeline } from '../healthTimeline';
import { prenatalCheckupSchedule } from '../prenatalCheckups';
import type { ChildProfile, DailyLog, GrowthRecord } from '../records';
import { vaccineSchedules } from '../vaccines';
import type { ClinicSummaryData } from './types';

import { summarizebasic } from './basic';
import { summarizegrowth } from './growth';
import { summarizevaccines } from './vaccines';
import { summarizeWeek } from './week';

export function buildClinicSummary(
  currentChild: ChildProfile | undefined,
  growthRecords: GrowthRecord[],
  dailyLogs: DailyLog[],
): ClinicSummaryData | null {
  if (!currentChild) {
    return null;
  }

  return {
    healthTimeline: buildHealthTimeline({
      child: currentChild,
      growthRecords,
      vaccineSchedules,
      careTaskTemplates,
      prenatalTemplates: prenatalCheckupSchedule,
    }),
    childName: currentChild.name,
    birthday: currentChild.birthday,
    gender: currentChild.gender,
    ...summarizebasic(currentChild),
    ...summarizegrowth(growthRecords),
    ...summarizevaccines(currentChild),
    weekSummary: summarizeWeek(dailyLogs),
    generatedAt: new Date().toISOString(),
  };
}
