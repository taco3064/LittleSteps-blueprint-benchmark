import type {
  ChildProfile,
  DailyLog,
  GrowthRecord,
} from '~app/family/domain/familyRecords';
import { buildHealthTimeline } from '~app/family/domain/healthTimeline';
import { prenatalCheckupSchedule } from '~app/knowledge/domain/prenatalCheckups';
import { careTaskTemplates } from '~app/knowledge/domain/careTasks';
import { vaccineSchedules } from '~app/knowledge/domain/vaccines';
import { ClinicSummaryData } from './ClinicSummaryData';

import { basicSummary } from './basic';
import { vaccineSummaryFor } from './vaccines';
import { weekSummaryFor } from './week';

export function clinicSummary(
  currentChild: ChildProfile,
  growthRecords: GrowthRecord[],
  dailyLogs: DailyLog[],
): ClinicSummaryData {
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
    ...basicSummary(currentChild, growthRecords),
    ...vaccineSummaryFor(currentChild),
    weekSummary: weekSummaryFor(dailyLogs),
    generatedAt: new Date().toISOString(),
  };
}
