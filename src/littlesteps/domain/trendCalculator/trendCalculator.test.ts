import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  DailyLog,
  DiaperData,
  FeedingData,
  SleepData,
} from '../../../family/domain/familyRecords/index';
import {
  calculateChangeRate,
  calculateDailyAverage,
  calculateTrend,
  generateDailySeries,
  generateSparklineData,
  getFeedingTrend,
  getPoopTrend,
  getRecommendedSleepHours,
  getSleepTrend,
} from './trendCalculator';

/**
 * 這個模組用 `new Date()` 取出當日視窗，並以 `toLocalDateKey()` 轉成「本地」
 * 日曆日。vitest.config.ts 已把 process.env.TZ 釘在 Asia/Taipei，所以下面的
 * 日期字串就是台灣使用者看到的日曆日。
 *
 * 因此所有 fixture 時間戳都寫成台灣本地掛鐘時間（+08:00）：「這天晚上 20:00
 * 的一次睡眠」對台灣家長就是本地 20:00。若寫成 UTC 的 `...T20:00:00Z`，實際
 * 是隔天凌晨 04:00，會被歸到下一個本地日期。
 *
 * FIXED_NOW 本身是一個真實瞬間（instant），保持 UTC 寫法；它等於台灣時間
 * 2026-06-15 16:00。
 */
const FIXED_NOW = new Date('2026-06-15T08:00:00Z');
const TODAY = '2026-06-15';
const DAY_1_AGO = '2026-06-14';
const DAY_2_AGO = '2026-06-13';
const DAY_3_AGO = '2026-06-12';
const DAY_4_AGO = '2026-06-11';

let logSeq = 0;

const makeLog = (
  type: DailyLog['type'],
  timestamp: string,
  data: FeedingData | SleepData | DiaperData,
): DailyLog => ({
  id: `log-${logSeq++}`,
  childId: 'child-1',
  type,
  timestamp,
  data,
  createdAt: timestamp,
});

/** Bottle feed on `date` (YYYY-MM-DD) at a fixed local (台灣) hour. */
const feeding = (date: string, amount?: number, hour = '09'): DailyLog =>
  makeLog('feeding', `${date}T${hour}:00:00+08:00`, {
    feedingType: amount === undefined ? 'breast_left' : 'formula',
    ...(amount === undefined ? { duration: 15 } : { amount }),
  } as FeedingData);

/** Sleep log on `date` carrying an explicit duration in minutes. 時間為台灣本地時。 */
const sleep = (date: string, durationMinutes: number, hour = '20'): DailyLog => {
  const startTime = `${date}T${hour}:00:00+08:00`;

  const endTime = new Date(
    new Date(startTime).getTime() + durationMinutes * 60_000,
  ).toISOString();

  return makeLog('sleep', startTime, {
    startTime,
    endTime,
    duration: durationMinutes,
  } as SleepData);
};

const diaper = (date: string, type: DiaperData['type'], hour = '09'): DailyLog =>
  makeLog('diaper', `${date}T${hour}:00:00+08:00`, { type } as DiaperData);

describe('trendCalculator', () => {
  beforeEach(() => {
    logSeq = 0;
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateTrend', () => {
    it('沒有兩段可比時說「資料不足」，不說「穩定」', () => {
      // 空的序列不是「沒變」，是「不知道」。原本兩者都回 'stable'，
      // 於是報告會拿沒有的資料講出一個結論。
      expect(calculateTrend([])).toBe('insufficient-data');
      expect(calculateTrend([42])).toBe('insufficient-data');
      expect(calculateTrend([0])).toBe('insufficient-data');
      // 每一半至少要有兩天有記錄，否則就是拿雜訊當趨勢
      expect(calculateTrend([10, 11])).toBe('insufficient-data');
      expect(calculateTrend([1, null, null, 5])).toBe('insufficient-data');
    });

    it('沒記錄的那幾天不會被當成 0 拉低平均', () => {
      // 這就是原本的 bug：停記三天和「夜醒真的變少」算出同一個答案，
      // 而後者正是家長最想聽到的消息。
      const steady = [3, 3, 3, 3, 3, 3, 3];
      const stoppedLogging = [3, 3, 3, 3, null, null, null];

      expect(calculateTrend(steady)).toBe('stable');
      expect(calculateTrend(stoppedLogging)).toBe('insufficient-data');

      // 真的變少還是要看得出來
      expect(calculateTrend([5, 5, 5, 5, 3, 3, 3])).toBe('decreasing');
    });

    it('detects an increasing series (second half > first half by more than 10%)', () => {
      // first half [60,60] avg 60, second half [100,140] avg 120 -> +100%
      expect(calculateTrend([60, 60, 100, 140])).toBe('increasing');
    });

    it('detects a decreasing series (second half < first half by more than 10%)', () => {
      // first half [10,10] avg 10, second half [6,6] avg 6 -> -40%
      expect(calculateTrend([10, 10, 6, 6])).toBe('decreasing');
    });

    it('treats a flat series as stable', () => {
      expect(calculateTrend([5, 5, 5, 5])).toBe('stable');
      expect(calculateTrend([0, 0, 0, 0])).toBe('stable');
    });

    it('uses a strict >10% / <-10% threshold, so exactly +/-10% stays stable', () => {
      expect(calculateTrend([10, 10, 11, 11])).toBe('stable'); // exactly +10%
      expect(calculateTrend([10, 10, 9, 9])).toBe('stable'); // exactly -10%
      expect(calculateTrend([10, 10, 11.5, 11.5])).toBe('increasing'); // +15%
      expect(calculateTrend([10, 10, 8.5, 8.5])).toBe('decreasing'); // -15%
    });

    it('puts the middle sample of an odd-length series in the second half', () => {
      // midpoint = floor(5/2) = 2 -> first [10,10] avg 10, second [30,10,10] avg
      // ~16.7 -> +67%.

      // Had the middle sample landed in the first half the result would be 'stable'.
      expect(calculateTrend([10, 10, 30, 10, 10])).toBe('increasing');
    });

    it('requires positive second-half values for increase from zero', () => {
      expect(calculateTrend([0, 0, 10, 20])).toBe('increasing');
      expect(calculateTrend([0, 0, 0, 0])).toBe('stable');
      // 記了但真的是 0，跟沒記不一樣：前者是「沒變」，後者是「不知道」
      expect(calculateTrend([0, 0, null, null])).toBe('insufficient-data');
    });

    it('reports a drop to zero as decreasing', () => {
      expect(calculateTrend([10, 10, 0, 0])).toBe('decreasing');
    });
  });

  describe('calculateChangeRate', () => {
    it('returns the signed percentage difference from the average', () => {
      expect(calculateChangeRate(120, 100)).toBe(20);
      expect(calculateChangeRate(80, 100)).toBe(-20);
      expect(calculateChangeRate(100, 100)).toBe(0);
      expect(calculateChangeRate(0, 50)).toBe(-100);
      expect(calculateChangeRate(140, 90)).toBeCloseTo(55.5556, 4);
    });

    it('avoids dividing by zero: 100% when there is a current value, else 0', () => {
      expect(calculateChangeRate(5, 0)).toBe(100);
      expect(calculateChangeRate(0, 0)).toBe(0);
    });
  });

  describe('calculateDailyAverage', () => {
    const logs: DailyLog[] = [
      feeding(TODAY, 100, '09'),
      feeding(TODAY, 50, '13'),
      feeding(DAY_1_AGO, 60),
      // DAY_2_AGO intentionally has no logs
      feeding(DAY_3_AGO, 999), // outside a 3-day window
    ];

    it('averages over the requested window and ignores older days', () => {
      // (150 + 60 + 0) / 3
      expect(calculateDailyAverage(logs, 3, 'feeding_amount')).toBe(70);
    });

    it('widens the window to include older days', () => {
      // (150 + 60 + 0 + 999) / 4
      expect(calculateDailyAverage(logs, 4, 'feeding_amount')).toBe(302.25);
    });

    it('counts feedings independently of the amount recorded', () => {
      // (2 + 1 + 0) / 3
      expect(calculateDailyAverage(logs, 3, 'feeding_count')).toBe(1);
    });

    it('counts amount-less (breast) feeds toward the count but not the amount', () => {
      const mixed = [feeding(TODAY, 100), feeding(TODAY, undefined)];

      expect(calculateDailyAverage(mixed, 1, 'feeding_count')).toBe(2);
      expect(calculateDailyAverage(mixed, 1, 'feeding_amount')).toBe(100);
    });

    it('returns 0 for a non-positive window', () => {
      expect(calculateDailyAverage(logs, 0, 'feeding_amount')).toBe(0);
      expect(calculateDailyAverage(logs, -3, 'feeding_amount')).toBe(0);
    });

    it('returns 0 when there are no logs at all', () => {
      expect(calculateDailyAverage([], 7, 'feeding_amount')).toBe(0);
      expect(calculateDailyAverage([], 7, 'sleep_duration')).toBe(0);
      expect(calculateDailyAverage([], 7, 'poop_count')).toBe(0);
    });

    it('reports sleep in hours, deriving duration from start/end when absent', () => {
      const derived = makeLog('sleep', `${DAY_1_AGO}T20:00:00+08:00`, {
        startTime: `${DAY_1_AGO}T20:00:00+08:00`,
        endTime: `${DAY_1_AGO}T23:00:00+08:00`, // 180 minutes -> 3h
      } as SleepData);

      const ongoing = makeLog('sleep', `${TODAY}T07:00:00+08:00`, {
        startTime: `${TODAY}T07:00:00+08:00`, // still sleeping -> contributes 0
      } as SleepData);

      const sleepLogs = [sleep(TODAY, 90, '01'), ongoing, derived];

      // day0: 1.5h + 0h, day1: 3h, day2: 0h -> 4.5 / 3
      expect(calculateDailyAverage(sleepLogs, 3, 'sleep_duration')).toBe(1.5);
    });

    it('counts only poop/both diapers, never pee', () => {
      const diapers = [
        diaper(TODAY, 'poop', '08'),
        diaper(TODAY, 'both', '12'),
        diaper(TODAY, 'pee', '16'),
        diaper(DAY_1_AGO, 'pee'),
        diaper(DAY_2_AGO, 'poop'),
      ];

      // (2 + 0 + 1) / 3
      expect(calculateDailyAverage(diapers, 3, 'poop_count')).toBe(1);
    });

    it('does not let one log type leak into another metric', () => {
      const mixed = [
        feeding(TODAY, 120),
        sleep(TODAY, 60, '02'),
        diaper(TODAY, 'poop'),
      ];

      expect(calculateDailyAverage(mixed, 1, 'feeding_count')).toBe(1);
      expect(calculateDailyAverage(mixed, 1, 'feeding_amount')).toBe(120);
      expect(calculateDailyAverage(mixed, 1, 'sleep_duration')).toBe(1);
      expect(calculateDailyAverage(mixed, 1, 'poop_count')).toBe(1);
    });
  });

  describe('generateSparklineData', () => {
    const logs: DailyLog[] = [
      feeding(TODAY, 150),
      feeding(DAY_1_AGO, 60),
      // DAY_2_AGO empty
      feeding(DAY_3_AGO, 999),
      feeding(DAY_4_AGO, 777), // outside a 4-day window
    ];

    it('emits one point per day ordered oldest to newest', () => {
      expect(generateSparklineData(logs, 4, 'feeding_amount')).toEqual([
        999, 0, 60, 150,
      ]);
    });

    it('always emits exactly `days` points, padding empty days with 0', () => {
      const points = generateSparklineData([], 7, 'feeding_amount');

      expect(points).toHaveLength(7);
      expect(points).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it('returns only today for a one-day window', () => {
      expect(generateSparklineData(logs, 1, 'feeding_amount')).toEqual([150]);
    });

    it('returns an empty series for a non-positive window', () => {
      expect(generateSparklineData(logs, 0, 'feeding_amount')).toEqual([]);
      expect(generateSparklineData(logs, -2, 'feeding_amount')).toEqual([]);
    });
  });

  describe('getRecommendedSleepHours', () => {
    it('maps an age in months to the matching requirement band', () => {
      expect(getRecommendedSleepHours(0)).toEqual({ min: 16, max: 17 });
      expect(getRecommendedSleepHours(0.5)).toEqual({ min: 16, max: 17 });
      expect(getRecommendedSleepHours(2)).toEqual({ min: 15, max: 16 });
      expect(getRecommendedSleepHours(4)).toEqual({ min: 13, max: 15 });
      expect(getRecommendedSleepHours(9)).toEqual({ min: 13, max: 14 });
      expect(getRecommendedSleepHours(15)).toEqual({ min: 13, max: 14 });
      expect(getRecommendedSleepHours(20)).toEqual({ min: 12, max: 13 });
      // 30 months must resolve to the 2-3 歲 band, not the 1.5-2 歲 one.
      expect(getRecommendedSleepHours(30)).toEqual({ min: 11, max: 14 });
    });

    it('switches bands at the lower bound of each range', () => {
      expect(getRecommendedSleepHours(1)).toEqual({ min: 15, max: 16 });
      expect(getRecommendedSleepHours(3)).toEqual({ min: 13, max: 15 });
      expect(getRecommendedSleepHours(6)).toEqual({ min: 13, max: 14 });
      expect(getRecommendedSleepHours(12)).toEqual({ min: 13, max: 14 });
      expect(getRecommendedSleepHours(18)).toEqual({ min: 12, max: 13 });
      expect(getRecommendedSleepHours(24)).toEqual({ min: 11, max: 14 });
      expect(getRecommendedSleepHours(35.9)).toEqual({ min: 11, max: 14 });
    });

    it('clamps ages past the last band to the oldest requirement', () => {
      expect(getRecommendedSleepHours(36)).toEqual({ min: 11, max: 14 });
      expect(getRecommendedSleepHours(120)).toEqual({ min: 11, max: 14 });
    });

    it('never returns an inverted range', () => {
      for (const months of [0, 1, 3, 6, 12, 18, 30]) {
        const { min, max } = getRecommendedSleepHours(months);

        expect(min).toBeLessThanOrEqual(max);
        expect(min).toBeGreaterThan(0);
      }
    });
  });

  describe('getFeedingTrend', () => {
    // Daily amounts oldest -> newest: 60, 60, 100, 140
    const logs: DailyLog[] = [
      feeding(DAY_3_AGO, 60),
      feeding(DAY_2_AGO, 60),
      feeding(DAY_1_AGO, 40, '07'),
      feeding(DAY_1_AGO, 60, '18'),
      feeding(TODAY, 90, '02'),
      feeding(TODAY, 50, '07'),
    ];

    it('summarises amount fed over the window', () => {
      const trend = getFeedingTrend(logs, 4);

      expect(trend.sparklinePoints).toEqual([60, 60, 100, 140]);
      expect(trend.currentValue).toBe(140);
      expect(trend.averageValue).toBe(90); // 360 / 4
      expect(trend.direction).toBe('increasing'); // 60 -> 120 across halves
      expect(trend.changeRate).toBeCloseTo(55.5556, 4); // (140 - 90) / 90
    });

    it('keeps currentValue in sync with the last sparkline point', () => {
      const trend = getFeedingTrend(logs, 4);

      expect(trend.currentValue).toBe(
        trend.sparklinePoints[trend.sparklinePoints.length - 1],
      );
    });

    it('degrades gracefully with no logs', () => {
      const trend = getFeedingTrend([], 7);

      expect(trend.sparklinePoints).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(trend.currentValue).toBe(0);
      expect(trend.averageValue).toBe(0);
      // 一筆紀錄都沒有不是「穩定」，是沒有東西可談
      expect(trend.direction).toBe('insufficient-data');
      expect(trend.changeRate).toBe(0);
    });

    it('degrades gracefully with a zero-day window', () => {
      const trend = getFeedingTrend(logs, 0);

      expect(trend.sparklinePoints).toEqual([]);
      expect(trend.currentValue).toBe(0);
      expect(trend.averageValue).toBe(0);
      // 零天的視窗裡沒有任何一天，同樣是沒有東西可談
      expect(trend.direction).toBe('insufficient-data');
      expect(trend.changeRate).toBe(0);
    });
  });

  describe('getSleepTrend', () => {
    // Daily minutes oldest -> newest: 600, 600, 360, 360 (i.e. 10h, 10h, 6h, 6h)
    const logs: DailyLog[] = [
      sleep(DAY_3_AGO, 600),
      sleep(DAY_2_AGO, 600),
      sleep(DAY_1_AGO, 360),
      sleep(TODAY, 360, '01'),
    ];

    it('reports hours (not minutes) and a decreasing direction', () => {
      const trend = getSleepTrend(logs, 4);

      expect(trend.sparklinePoints).toEqual([10, 10, 6, 6]);
      expect(trend.currentValue).toBe(6);
      expect(trend.averageValue).toBe(8); // 32h / 4
      expect(trend.direction).toBe('decreasing'); // 10h -> 6h across halves
      expect(trend.changeRate).toBe(-25); // (6 - 8) / 8
    });
  });

  describe('getPoopTrend', () => {
    // Two poops per day for four days, plus pee logs that must be ignored.
    const logs: DailyLog[] = [DAY_3_AGO, DAY_2_AGO, DAY_1_AGO, TODAY].flatMap(
      (date) => [
        diaper(date, 'poop', '06'),
        diaper(date, 'both', '12'),
        diaper(date, 'pee', '18'),
      ],
    );

    it('counts poop/both diapers and reports a stable trend', () => {
      const trend = getPoopTrend(logs, 4);

      expect(trend.sparklinePoints).toEqual([2, 2, 2, 2]);
      expect(trend.currentValue).toBe(2);
      expect(trend.averageValue).toBe(2);
      expect(trend.direction).toBe('stable');
      expect(trend.changeRate).toBe(0);
    });

    it('reports zeros when only pee diapers were logged', () => {
      // 有記尿布但那幾天沒大便，是真的 0——跟「沒記尿布」不一樣，
      // 所以這裡要看得出「穩定」，而不是「記錄不足」。
      const peeOnly = [
        diaper(TODAY, 'pee'),
        diaper(DAY_1_AGO, 'pee'),
        diaper(DAY_2_AGO, 'pee'),
        diaper(DAY_3_AGO, 'pee'),
      ];

      const trend = getPoopTrend(peeOnly, 4);

      expect(trend.sparklinePoints).toEqual([0, 0, 0, 0]);
      expect(trend.averageValue).toBe(0);
      expect(trend.direction).toBe('stable');
      expect(trend.changeRate).toBe(0);
    });

    it('完全沒記尿布時說記錄不足，不說沒有大便', () => {
      // 只記餵奶的家長，他的排便趨勢不是「都是 0」，是根本沒有資料。
      const feedsOnly = getPoopTrend([], 7);

      expect(feedsOnly.direction).toBe('insufficient-data');
    });
  });

  /*
    This series feeds the report scores, the dashboard sparkline and the trend
    charts. Pumped millilitres reaching it would inflate every one of them, and
    a pumping-only day must stay null rather than becoming a real zero - a zero
    drags the weekly average down and can fire a false low-intake alert at a
    mother who only pumped that day.
  */
  describe('pumping never reaches a feeding series', () => {
    it('counts bottles and ignores pumping on the same day', () => {
      const pumped = makeLog('feeding', `${TODAY}T07:00:00+08:00`, {
        feedingType: 'pumping',
        amount: 150,
        duration: 20,
      });

      const logs = [feeding(TODAY, 120, '06'), feeding(TODAY, 120, '18'), pumped];

      expect(generateDailySeries(logs, 1, 'feeding_count')).toEqual([2]);
      expect(generateDailySeries(logs, 1, 'feeding_amount')).toEqual([240]);
    });

    it('leaves a pumping-only day unknown rather than calling it zero intake', () => {
      const pumped = makeLog('feeding', `${TODAY}T07:00:00+08:00`, {
        feedingType: 'pumping',
        amount: 150,
      });

      expect(generateDailySeries([pumped], 1, 'feeding_amount')).toEqual([null]);
      expect(generateDailySeries([pumped], 1, 'feeding_count')).toEqual([null]);
    });
  });

  /*
    A sleep whose end time was never filled in has no duration. Counted as an
    observation it becomes a real zero for that day, which is not the same fact
    as "we do not know" - and every score built on this series reads it as a
    day the baby barely slept.
  */
  describe('a forgotten sleep timer is not an observation', () => {
    it('leaves the day null instead of reporting zero hours', () => {
      const openStart = `${TODAY}T00:00:00+08:00`;
      const forgotten = makeLog('sleep', openStart, { startTime: openStart });

      const series = generateDailySeries([forgotten], 1, 'sleep_duration');

      expect(series).toEqual([null]);
    });

    it('still counts a sleep that is open but younger than the threshold', () => {
      const recentStart = `${TODAY}T14:00:00+08:00`;
      const napping = makeLog('sleep', recentStart, { startTime: recentStart });

      expect(generateDailySeries([napping], 1, 'sleep_duration')).toEqual([0]);
    });
  });
});
