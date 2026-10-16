import type { ChildProfile } from '~app/family/domain/familyRecords';
import { calculateVaccineSummary } from '~app/family/domain/summaryCalculator';
import { vaccineSchedules } from '~app/knowledge/domain/vaccines';
import { ClinicSummaryData } from './ClinicSummaryData';

export function vaccineSummaryFor(currentChild: ChildProfile) {
  // --- Vaccine records ---
  const administeredVaccines: ClinicSummaryData['administeredVaccines'] = [];

  // Firebase 不存空物件，所以剛建立、還沒勾過任何一劑的孩子讀回來
  // 根本沒有 vaccineProgress 這個欄位——型別說必填，線上資料說沒有。
  const vaccineProgress = currentChild.vaccineProgress ?? {};

  vaccineSchedules.forEach((vaccine) => {
    const progress = vaccineProgress[vaccine.id];

    if (!progress) {
      return;
    }

    Object.entries(progress.doses).forEach(([doseNum, doseInfo]) => {
      if (doseInfo.administered) {
        administeredVaccines.push({
          name: vaccine.name,
          dose: Number(doseNum),
          date: doseInfo.administeredDate,
        });
      }
    });
  });

  // Sort administered vaccines by date (newest first), undated last
  administeredVaccines.sort((a, b) => {
    if (!a.date && !b.date) {
      return 0;
    }

    if (!a.date) {
      return 1;
    }

    if (!b.date) {
      return -1;
    }

    return b.date.localeCompare(a.date);
  });

  // 下一劑只認公費：這份摘要是拿去給醫師看的，把自費產品寫成「下一劑」
  // 等於在診間替它背書。理由與年齡界線見 vaccineSchedule.nextScheduledDose。
  const vaccineSummary = calculateVaccineSummary(
    vaccineProgress,
    currentChild.birthday,
  );

  const nextVaccine = vaccineSummary.nextVaccine
    ? {
        name: vaccineSummary.nextVaccine.name,
        timing: vaccineSummary.nextVaccine.timing,
        doseNumber: vaccineSummary.nextVaccine.doseNumber,
      }
    : undefined;

  // 沒有下一劑時這一段不能就這樣少一行——那會讓醫師以為沒事要談。
  const unrecordedNationalDoses
    = nextVaccine === undefined && vaccineSummary.remainingNationalDoses > 0
      ? vaccineSummary.remainingNationalDoses
      : undefined;

  return { administeredVaccines, nextVaccine, unrecordedNationalDoses };
}
