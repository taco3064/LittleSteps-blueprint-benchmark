import { DailyLog } from '~app/family/domain/familyRecords';
import { generateDailySeries, getRecommendedSleepHours } from '../trendCalculator';
import { ReportScores } from './ReportScores';
import { buildScore } from './buildScore';
import { clampScore } from './clampScore';
import { coefficientOfVariation } from './coefficientOfVariation';
import { observedDays } from './observedDays';

/**
 * 三個 0-100 分數。分母一律是「有記錄的天數」，不是視窗長度。
 *
 * 補 0 的序列會讓 30 天裡只記了 2 天的家長，在正確忽略未記錄日的平均值
 * 旁邊看到滿滿的紅字：22 天的 0 把變異係數推爆，分數歸零，標籤寫「需注意」。
 * 那不是寶寶的狀況，是記錄的密度。
 */
export function calculateScores(
  logs: DailyLog[],
  days: number,
  ageMonths: number,
): ReportScores {
  const feedingAmounts = observedDays(
    generateDailySeries(logs, days, 'feeding_amount'),
  );

  const feedingCounts = observedDays(
    generateDailySeries(logs, days, 'feeding_count'),
  );

  const sleepHours = observedDays(generateDailySeries(logs, days, 'sleep_duration'));
  const poopCounts = observedDays(generateDailySeries(logs, days, 'poop_count'));

  // 餵奶規律度：奶量與次數的變異係數。CV 0 得 100 分，CV ≥ 1 得 0 分。
  const feedingCV
    = (coefficientOfVariation(feedingAmounts)
      + coefficientOfVariation(feedingCounts))
    / 2;

  // 睡眠品質：達到月齡建議時數佔 60 分，日與日之間的穩定度佔 40 分。
  const recommended = getRecommendedSleepHours(ageMonths);
  const totalSleepHours = sleepHours.reduce((sum, v) => sum + v, 0);
  const avgSleep = sleepHours.length > 0 ? totalSleepHours / sleepHours.length : 0;

  const meetingRatio
    = recommended.min > 0 ? Math.min(avgSleep / recommended.min, 1) : 1;

  const sleepConsistency = clampScore(
    100 - coefficientOfVariation(sleepHours) * 100,
  );

  // 排便正常度：有記錄的日子裡一次都沒大便才是 0 分，其餘看每日次數穩不穩。
  const poopTotal = poopCounts.reduce((sum, v) => sum + v, 0);
  const poopRegularity = clampScore(100 - coefficientOfVariation(poopCounts) * 100);

  return {
    feeding: buildScore(feedingAmounts.length, clampScore(100 - feedingCV * 100)),
    sleep: buildScore(
      sleepHours.length,
      clampScore(meetingRatio * 60 + (sleepConsistency / 100) * 40),
    ),
    poop: buildScore(
      poopCounts.length,
      poopTotal > 0 ? clampScore(poopRegularity * 0.7 + 30) : 0,
    ),
  };
}
