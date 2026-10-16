import type { MilestoneProgress, VaccineProgress } from '../familyRecords';
import type { VaccineSchedule } from '~app/knowledge/domain/referenceModels';
import { milestones } from '~app/knowledge/domain/milestones';
import { vaccineSchedules } from '~app/knowledge/domain/vaccines';
import {
  isScheduledDose,
  nextScheduledDose,
  resolveVaccineDoses,
} from '../vaccineSchedule';

/**
 * 計算里程碑達成率
 */
export interface MilestoneSummary {
  totalMilestones: number;
  achievedCount: number;
  achievementRate: number; // 百分比 (0-100)
  recentAchievements: Array<{
    id: string;
    title: string;
    achievedDate: string;
  }>;
}

/**
 * 目錄中仍存在的里程碑 id。使用者進度可能殘留已從資料集移除的里程碑，
 * 若一併計入分子而分母已縮小，完成率會超過 100%。
 */
const KNOWN_MILESTONE_IDS: Record<string, true> = Object.fromEntries(
  milestones.map((m) => [m.id, true] as const),
);

export function calculateMilestoneSummary(
  milestoneProgress: MilestoneProgress,
): MilestoneSummary {
  const totalMilestones = milestones.length;

  // 只計入仍存在於目錄中的 id，孤兒鍵不得進入分子。
  const achieved = Object.entries(milestoneProgress).filter(
    ([id, progress]) => progress.achieved && KNOWN_MILESTONE_IDS[id] === true,
  );

  const achievedCount = achieved.length;

  const achievementRate
    = totalMilestones > 0 ? Math.round((achievedCount / totalMilestones) * 100) : 0;

  // 獲取最近達成的里程碑（最多 3 個）
  const recentAchievements = achieved
    .filter(([_, progress]) => progress.achievedDate)
    .sort((a, b) => {
      const dateA = a[1].achievedDate || '';
      const dateB = b[1].achievedDate || '';

      return dateB.localeCompare(dateA); // Descending
    })
    .slice(0, 3)
    .map(([id, progress]) => {
      const milestone = milestones.find((m) => m.id === id);

      return {
        id,
        title: milestone?.title || '',
        achievedDate: progress.achievedDate || '',
      };
    });

  return {
    totalMilestones,
    achievedCount,
    achievementRate,
    recentAchievements,
  };
}

/**
 * 計算疫苗接種進度
 */
export interface VaccineSummary {
  totalDoses: number;
  administeredCount: number;
  administrationRate: number; // 百分比 (0-100)
  nextVaccine?: {
    id: string;
    name: string;
    timing: string;
    doseNumber: number;
  };
  /**
   * 還沒記錄的公費常規劑次數。
   *
   * 下一劑只認公費，也只認還沒被孩子的年齡拋在後面的劑次，所以「沒有下一劑」
   * 不再等於「都打完了」：一個從來沒記錄過的五歲孩子兩者都不是。少了這個
   * 數字，卡片只能在兩種相反的情況說同一句「皆已接種完成」。
   *
   * 「只給名單上的孩子」的公費劑次不算在裡面，理由和下一劑同一條，寫在
   * vaccineSchedule.isScheduledDose：這個數字是家長欠的劑數，不是時程表上
   * 標著公費的劑數。
   */
  remainingNationalDoses: number;
}

/**
 * 時程表的每一筆記錄就是「一劑」：`VaccineSchedule.doses` 是整個疫苗系列的總劑數，
 * 同系列的每筆記錄都重複帶著同一個值（五合一的 4 筆全部寫 doses: 4），真正代表
 * 「這筆是第幾劑」的是 `currentDose`，也是接種頁寫入進度時使用的鍵。
 *
 * 所以分母是記錄數，絕不可把 `doses` 加總：那會讓五合一的 4 劑膨脹成 16 劑，
 * 每支多劑疫苗都同樣被放大，接種率被系統性低估。
 */
const scheduledDoseNumber = (vaccine: VaccineSchedule): number =>
  vaccine.currentDose ?? 1;

export function calculateVaccineSummary(
  vaccineProgress: VaccineProgress,
  birthday: string,
  today: Date = new Date(),
): VaccineSummary {
  // 分母＝時程表記錄數（每筆一劑）。
  const totalDoses = vaccineSchedules.length;

  // 分子只認每筆記錄自己那一劑：由目錄反查進度，孤兒 vaccineId 自然被忽略；
  // 同一筆底下殘留的其他劑次鍵也不得重複計入，否則分子會超過分母、突破 100%。
  let administeredCount = 0;
  let remainingNationalDoses = 0;

  vaccineSchedules.forEach((vaccine) => {
    const dose = vaccineProgress[vaccine.id]?.doses[scheduledDoseNumber(vaccine)];

    if (dose?.administered) {
      administeredCount++;
    } else if (isScheduledDose(vaccine)) {
      remainingNationalDoses++;
    }
  });

  const administrationRate
    = totalDoses > 0 ? Math.round((administeredCount / totalDoses) * 100) : 0;

  return {
    totalDoses,
    administeredCount,
    administrationRate,
    nextVaccine: findNextVaccine(vaccineProgress, birthday, today),
    remainingNationalDoses,
  };
}

/**
 * 下一劑。
 *
 * 這裡原本自己算一遍：把整份時程表按 ageInMonths 排序，回傳第一筆沒接種的，
 * 既不看 funding 也不看孩子多大。疫苗頁那邊（littlesteps/utils/vaccineSchedule）
 * 早就只認公費，於是同一個問題有兩個答案，而自費劑次落在出生、2、4、6、18
 * 個月，全部排在公費劑次前面——儀表板卡片與拿給小兒科醫師看的摘要，會用和
 * 免費劑次一模一樣的字推銷一支要自己付錢的產品。
 *
 * 現在問的是同一個實作：規則、理由與年齡界線都寫在 nextScheduledDose 上。
 */
function findNextVaccine(
  vaccineProgress: VaccineProgress,
  birthday: string,
  today: Date,
): VaccineSummary['nextVaccine'] {
  const dose = nextScheduledDose(
    resolveVaccineDoses({
      birthday: birthday,
      schedules: vaccineSchedules,
      progress: vaccineProgress,
      today: today,
    }),
    today,
  );

  if (!dose) {
    return undefined;
  }

  return {
    id: dose.vaccineId,
    name: dose.name,
    timing: dose.timing,
    doseNumber: dose.doseNumber,
  };
}

/**
 * Calculate baby's age display text
 */
export function calculateAgeDisplay(birthday: string): string {
  const birthDate = new Date(birthday);
  const today = new Date();

  const years = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();
  const days = today.getDate() - birthDate.getDate();

  let ageInMonths = years * 12 + months;
  let ageInDays = days;

  if (ageInDays < 0) {
    ageInMonths--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    ageInDays += lastMonth.getDate();
  }

  return formatAge(ageInMonths, ageInDays);
}

function formatAge(ageInMonths: number, ageInDays: number): string {
  if (ageInMonths < 0) {
    return '尚未出生';
  }

  if (ageInMonths === 0) {
    return `${ageInDays}天`;
  }

  if (ageInMonths < 12) {
    if (ageInDays === 0) {
      return `${ageInMonths}個月`;
    }

    return `${ageInMonths}個月又${ageInDays}天`;
  }

  const displayYears = Math.floor(ageInMonths / 12);
  const displayMonths = ageInMonths % 12;

  if (displayMonths === 0) {
    return `${displayYears}歲`;
  }

  return `${displayYears}歲${displayMonths}個月`;
}
