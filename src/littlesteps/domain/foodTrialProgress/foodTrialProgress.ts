import type { FoodTrialRecord } from '~app/family/domain/familyRecords';
import { allergyTestingMethod } from '../complementaryFood';
import { trialDatesOf } from '../foodTrialDates';

const STAGE_DAYS = 3;
const STAGES = allergyTestingMethod.steps;
const TOTAL_DAYS = STAGES.length * STAGE_DAYS;

export interface FoodTrialProgressRow {
  food: FoodTrialRecord;
  trialDates: string[];
  canRecord: boolean;
  stage: (typeof STAGES)[number];
  progressPercent: number;
}

/** The reference method defines three consecutive three-day stages. */
export function foodTrialProgress(foodTrials: FoodTrialRecord[], today: string) {
  const datesOf = new Map(foodTrials.map((food) => [food.id, trialDatesOf(food)]));

  const rows = foodTrials.map((food): FoodTrialProgressRow => {
    const trialDates = datesOf.get(food.id) ?? [];
    const completed = trialDates.length >= TOTAL_DAYS;

    return {
      food,
      trialDates,
      canRecord: !completed && !trialDates.includes(today),
      stage:
        STAGES[
          Math.min(Math.floor(trialDates.length / STAGE_DAYS), STAGES.length - 1)
        ],
      progressPercent: (trialDates.length / TOTAL_DAYS) * 100,
    };
  });

  const active = rows.filter((row) => row.trialDates.length < TOTAL_DAYS);
  const completed = rows.filter((row) => row.trialDates.length >= TOTAL_DAYS);

  // Stable sorting keeps the original order within each eligibility group.
  active.sort((a, b) => Number(b.canRecord) - Number(a.canRecord));

  return {
    active,
    completed,
    totalDays: TOTAL_DAYS,
    methodName: allergyTestingMethod.name,
    stageTitles: STAGES.map((stage) => stage.title),
  };
}
