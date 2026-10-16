import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  DailyLog,
  DiaperData,
  GrowthRecord,
} from '../../../family/domain/familyRecords/index';
import { generateDailySeries } from '../trendCalculator/trendCalculator';
import type { WeeklyReport } from './reportGenerator';
import {
  calculateScores,
  generateMonthlyReport,
  generateSummaryText,
  generateWeeklyReport,
} from './reportGenerator';

/**
 * 產生器用 `new Date()` 推算報表視窗，所以把時鐘凍結。
 * 視窗與每日分桶都走 `toLocalDateKey()`（本地日曆日），而 vitest.config.ts
 * 已把 process.env.TZ 釘在 Asia/Taipei，因此 WEEK_DATES 就是台灣使用者的日曆日。
 *
 * 下面所有 fixture 時間戳都是台灣本地掛鐘時間（+08:00）：「當天 20:00 開始睡」
 * 對台灣家長就是本地 20:00。寫成 UTC 的 `...T20:00:00Z` 實際是隔天凌晨 04:00，
 * 會被歸到下一個本地日期，把整週的資料整體往後推一天。
 *
 * FROZEN_NOW 是真實瞬間（instant），保持 UTC 寫法；它等於台灣時間
 * 2026-06-15 20:00。
 */
const FROZEN_NOW = new Date('2026-06-15T12:00:00Z');

// Oldest -> newest, i.e. getDateNDaysAgo(6) .. getDateNDaysAgo(0)
const WEEK_DATES = [
  '2026-06-09',
  '2026-06-10',
  '2026-06-11',
  '2026-06-12',
  '2026-06-13',
  '2026-06-14',
  '2026-06-15',
];

describe('reportGenerator', () => {
  let logSeq = 0;

  beforeEach(() => {
    logSeq = 0;
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** `time` 為台灣本地掛鐘時間（HH:MM:SS）。 */
  const feedingLog = (date: string, time: string, amount: number): DailyLog => {
    const timestamp = `${date}T${time}+08:00`;

    return {
      id: `log_${++logSeq}`,
      childId: 'child-1',
      type: 'feeding',
      timestamp,
      data: { feedingType: 'formula', amount },
      createdAt: timestamp,
    };
  };

  /** 當天本地 20:00 入睡，跨夜的睡眠仍歸在入睡當天。 */
  const sleepLog = (
    date: string,
    durationMinutes: number,
    nightWakings?: number,
  ): DailyLog => {
    const start = new Date(`${date}T20:00:00+08:00`);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    return {
      id: `log_${++logSeq}`,
      childId: 'child-1',
      type: 'sleep',
      timestamp: start.toISOString(),
      data: {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration: durationMinutes,
        nightWakings,
      },
      createdAt: start.toISOString(),
    };
  };

  const diaperLog = (
    date: string,
    type: DiaperData['type'],
    consistency?: DiaperData['consistency'],
  ): DailyLog => {
    const timestamp = `${date}T09:00:00+08:00`;

    return {
      id: `log_${++logSeq}`,
      childId: 'child-1',
      type: 'diaper',
      timestamp,
      data: { type, consistency },
      createdAt: timestamp,
    };
  };

  const growthRecord = (
    date: string,
    weight: number,
    height: number,
    percentile: GrowthRecord['percentile'] = {},
  ): GrowthRecord => ({
    id: `growth_${date}`,
    childId: 'child-1',
    date,
    weight,
    height,
    percentile,
  });

  /**
   * Perfectly regular week: 2 x 120ml feeds, one 12h sleep with 1 night waking,
   * and one normal poop, on every one of the 7 in-window days.
   */
  const buildRegularWeek = (): DailyLog[] =>
    WEEK_DATES.flatMap((date) => [
      feedingLog(date, '06:00:00', 120),
      feedingLog(date, '18:00:00', 120),
      sleepLog(date, 720, 1),
      diaperLog(date, 'poop', 'normal'),
    ]);

  describe('generateWeeklyReport - no data', () => {
    it('reports a 7-day window with zeroed sections and the no-data summary', () => {
      const report = generateWeeklyReport([], [], 4);

      expect(report.period).toEqual({ start: '2026-06-09', end: '2026-06-15' });

      expect(report.feeding.dailyAmounts).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(report.feeding.avgDailyCount).toBe(0);
      expect(report.feeding.avgDailyAmount).toBe(0);
      // With no data every day ties at 0, so the first day scanned (the oldest)
      // wins both.

      // 整週一筆餵奶都沒記，就沒有「最高日／最低日」可以指
      expect(report.feeding.maxDay).toBeUndefined();
      expect(report.feeding.minDay).toBeUndefined();

      expect(report.sleep.dailyDurations).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(report.sleep.avgDailyHours).toBe(0);
      expect(report.sleep.longestContinuous).toBe(0);
      // 一筆睡眠都沒記，夜醒趨勢不是「穩定」，是沒有東西可談
      expect(report.sleep.nightWakingsTrend).toBe('insufficient-data');
      expect(report.sleep.recommendedHours).toBe(13); // 4 months -> "13-15 小時"

      expect(report.poop.dailyCounts).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(report.poop.avgDailyCount).toBe(0);
      expect(report.poop.longestGap).toBe(0);
      expect(report.poop.consistencyDistribution).toEqual({});

      expect(report.growth).toBeUndefined();

      expect(report.summaryText).toBe(
        '尚無足夠資料產生摘要，請持續記錄寶寶的日常。',
      );
    });

    it('refuses to score a week with no records at all', () => {
      const { scores } = generateWeeklyReport([], [], 4);

      // 原本這裡是「餵奶 100 分、很棒！」——完全沒記錄卻拿滿分，因為補 0 的
      // 序列毫無變異。沒有樣本就沒有分數。
      const noScore = { score: null, label: '再記幾天', loggedDays: 0 };

      expect(scores.feeding).toEqual(noScore);
      expect(scores.sleep).toEqual(noScore);
      expect(scores.poop).toEqual(noScore);
    });
  });

  describe('generateWeeklyReport - regular week', () => {
    it('aggregates per-day counts, amounts, durations and consistencies', () => {
      const report = generateWeeklyReport(buildRegularWeek(), [], 4);

      expect(report.feeding.dailyAmounts).toEqual([
        240, 240, 240, 240, 240, 240, 240,
      ]);

      expect(report.feeding.avgDailyCount).toBe(2);
      expect(report.feeding.avgDailyAmount).toBe(240);

      expect(report.sleep.dailyDurations).toEqual([12, 12, 12, 12, 12, 12, 12]);
      expect(report.sleep.avgDailyHours).toBe(12);
      expect(report.sleep.longestContinuous).toBe(720); // minutes, not hours
      // 每天都有記睡眠，夜醒次數是實際觀測到的 0——這才是真的「穩定」
      expect(report.sleep.nightWakingsTrend).toBe('stable');

      expect(report.poop.dailyCounts).toEqual([1, 1, 1, 1, 1, 1, 1]);
      expect(report.poop.avgDailyCount).toBe(1);
      expect(report.poop.longestGap).toBe(24); // one poop per day at the same hour
      expect(report.poop.consistencyDistribution).toEqual({ normal: 7 });
    });

    it('scores regular weeks against age-specific sleep needs', () => {
      const { scores } = generateWeeklyReport(buildRegularWeek(), [], 4);

      expect(scores.feeding).toEqual({ score: 100, label: '很棒！', loggedDays: 7 });
      // min(12/13, 1) * 60 + 40 = 95.38 -> 95
      expect(scores.sleep).toEqual({ score: 95, label: '很棒！', loggedDays: 7 });
      // 100 * 0.7 + 30 = 100
      expect(scores.poop).toEqual({ score: 100, label: '很棒！', loggedDays: 7 });
    });

    it('summarises a regular week, flagging sleep just under the recommendation', () => {
      const report = generateWeeklyReport(buildRegularWeek(), [], 4);

      expect(report.summaryText).toBe(
        '餵奶量平均每日 240ml。睡眠時數平均 12 小時，略低於建議值，建議觀察作息。排便規律正常。',
      );
    });

    it('ignores logs outside the 7-day window but includes them over 30 days', () => {
      const stale = feedingLog('2026-06-05', '06:00:00', 999); // 10 days ago
      const logs = [...buildRegularWeek(), stale];

      const weekly = generateWeeklyReport(logs, [], 4);

      expect(weekly.feeding.dailyAmounts).toEqual([
        240, 240, 240, 240, 240, 240, 240,
      ]);

      expect(weekly.feeding.avgDailyAmount).toBe(240);
      expect(weekly.feeding.maxDay).toEqual({ date: '2026-06-09', amount: 240 });

      const monthly = generateMonthlyReport(logs, [], 4);

      // 2026-06-05 is 10 days ago -> index 29 - 10 = 19 in the oldest-first array
      expect(monthly.feeding.dailyAmounts[19]).toBe(999);
      // 有記餵奶的是 8 天：(7 * 240 + 999) / 8 = 334.875 -> 335。
      // 原本除以 30 得到 89，那是把 22 個沒記錄的日子當成「那天喝 0 ml」。
      expect(monthly.feeding.avgDailyAmount).toBe(335);
      expect(monthly.feeding.loggedDays).toBe(8);
    });
  });

  describe('generateWeeklyReport - irregular week', () => {
    // Amounts ramp 200 -> 320 across the week, night wakings fall 4 -> 1,
    // and poops land only on days 1, 4 and 7.
    const buildIrregularWeek = (): DailyLog[] => {
      const amounts = [200, 220, 240, 260, 280, 300, 320];
      const wakings = [4, 4, 4, 1, 1, 1, 1];
      const logs: DailyLog[] = [];

      WEEK_DATES.forEach((date, i) => {
        logs.push(feedingLog(date, '06:00:00', amounts[i] / 2));
        logs.push(feedingLog(date, '18:00:00', amounts[i] / 2));
        logs.push(sleepLog(date, 780, wakings[i]));
      });

      logs.push(diaperLog('2026-06-09', 'poop', 'normal'));
      logs.push(diaperLog('2026-06-12', 'both', 'soft'));
      logs.push(diaperLog('2026-06-15', 'poop', 'hard'));

      return logs;
    };

    it('identifies the heaviest and lightest feeding days', () => {
      const report = generateWeeklyReport(buildIrregularWeek(), [], 4);

      expect(report.feeding.dailyAmounts).toEqual([
        200, 220, 240, 260, 280, 300, 320,
      ]);

      expect(report.feeding.avgDailyAmount).toBe(260);
      expect(report.feeding.avgDailyCount).toBe(2);
      expect(report.feeding.maxDay).toEqual({ date: '2026-06-15', amount: 320 });
      expect(report.feeding.minDay).toEqual({ date: '2026-06-09', amount: 200 });
    });

    it('detects a falling night-waking trend and the longest poop gap', () => {
      const report = generateWeeklyReport(buildIrregularWeek(), [], 4);

      expect(report.sleep.nightWakingsTrend).toBe('decreasing'); // 4 -> 1 is a 75% drop
      expect(report.poop.dailyCounts).toEqual([1, 0, 0, 1, 0, 0, 1]);
      // 有記尿布的是 3 天，共 3 次：3 / 3 = 1。除以 7 得到 0.4，
      // 那是把沒記尿布的 4 天當成「那天沒大便」。
      expect(report.poop.avgDailyCount).toBe(1);
      expect(report.poop.loggedDays).toBe(3); // 3 / 7 = 0.428... -> 0.4
      expect(report.poop.longestGap).toBe(72); // three days between poops

      // 'both' counts as a poop and contributes its consistency
      expect(report.poop.consistencyDistribution).toEqual({
        normal: 1,
        soft: 1,
        hard: 1,
      });
    });

    it('penalises feeding variance and withholds sparse poop scores', () => {
      const { scores } = generateWeeklyReport(buildIrregularWeek(), [], 4);

      // amount CV = 40/260 = 0.1538, count CV = 0 -> avg 0.0769 -> 100 - 7.69 = 92.31
      expect(scores.feeding).toEqual({ score: 92, label: '很棒！', loggedDays: 7 });
      // 13h/day exactly meets the 13h recommendation, with zero variance
      expect(scores.sleep).toEqual({ score: 100, label: '很棒！', loggedDays: 7 });
      // 尿布只記了 3 天，而且那 3 天都各一次。原本把沒記的 4 天當成 0，
      // 算出 CV > 1、分數 30 分的「需注意」——那 4 天發生什麼事沒人知道。
      expect(scores.poop).toEqual({ score: null, label: '再記幾天', loggedDays: 3 });
    });

    it('summarises the long poop gap and on-target sleep', () => {
      const report = generateWeeklyReport(buildIrregularWeek(), [], 4);

      expect(report.summaryText).toBe(
        '餵奶量平均每日 260ml。睡眠時數平均 13 小時，符合建議範圍。排便間隔最長達 72 小時，需留意。',
      );
    });
  });

  describe('generateMonthlyReport', () => {
    it('spans 30 days and dilutes a single active week across the window', () => {
      const report = generateMonthlyReport(buildRegularWeek(), [], 4);

      expect(report.period).toEqual({ start: '2026-05-17', end: '2026-06-15' });
      expect(report.feeding.dailyAmounts).toHaveLength(30);
      expect(report.feeding.dailyAmounts.slice(0, 23)).toEqual(Array(23).fill(0));
      expect(report.feeding.dailyAmounts.slice(23)).toEqual(Array(7).fill(240));
      // 只記了 7 天，就用那 7 天算：1680 / 7 = 240 ml。原本除以 30 得到 56 ml，
      // 而一個寶寶一天喝 700-900 ml——那個數字不會讓人以為記漏了，會讓人以為
      // 孩子喝太少。
      expect(report.feeding.avgDailyAmount).toBe(240);
      expect(report.feeding.avgDailyCount).toBe(2); // 14 次 / 7 天
      expect(report.feeding.loggedDays).toBe(7);
      // 最高／最低只看有記餵奶的那幾天。原本會把 5/17（完全沒記）當成
      // 「最低日 0 ml」寫在報告上，讀起來像那天寶寶沒喝奶。
      expect(report.feeding.maxDay).toEqual({ date: '2026-06-09', amount: 240 });
      expect(report.feeding.minDay).toEqual({ date: '2026-06-09', amount: 240 });

      expect(report.sleep.dailyDurations).toHaveLength(30);
      // 有記睡眠的是 7 天，共 84 小時：84 / 7 = 12。原本除以 30 得到 2.8 小時，
      // 家長對照「建議 12-15 小時」會以為孩子嚴重睡不足。
      expect(report.sleep.avgDailyHours).toBe(12);
      expect(report.sleep.loggedDays).toBe(7); // 84 / 30
      expect(report.sleep.longestContinuous).toBe(720);
      // 原本這裡斷言 'increasing'，註解還寫著「空的前半段對上有資料的後半段
      // 讀起來就是夜醒變多」——那不是趨勢，是 23 天沒記錄被當成 23 天沒夜醒。
      expect(report.sleep.nightWakingsTrend).toBe('insufficient-data');

      // 有記尿布的是 7 天，共 7 次：7 / 7 = 1。原本除以 30 得到 0.2 次，
      // 讀起來像五天才大一次。
      expect(report.poop.avgDailyCount).toBe(1);
      expect(report.poop.loggedDays).toBe(7); // 7 / 30 = 0.233... -> 0.2
      expect(report.poop.longestGap).toBe(24);
      expect(report.poop.consistencyDistribution).toEqual({ normal: 7 });
    });

    it('scores a 7-of-30-day month on those 7 days, not on 23 blanks', () => {
      const { scores } = generateMonthlyReport(buildRegularWeek(), [], 4);

      // 那 7 天是完全規律的。原本補 0 後餵奶 0 分、睡眠 13 分、排便 30 分，
      // 三張紅色的「需注意」就印在正確算出 240ml／12 小時的平均值旁邊。
      expect(scores.feeding).toEqual({ score: 100, label: '很棒！', loggedDays: 7 });
      expect(scores.sleep).toEqual({ score: 95, label: '很棒！', loggedDays: 7 });
      expect(scores.poop).toEqual({ score: 100, label: '很棒！', loggedDays: 7 });
    });

    /*
      A sleep whose end time was never filled in contributes no minutes. Counted
      as a logged sleep day it turns into "that day the baby slept 0 hours",
      which drags the weekly average down and shows up nowhere on the page as
      an explanation.
    */
    it('ignores a sleep left open for days when averaging the week', () => {
      const forgottenStart = new Date('2026-06-13T20:00:00+08:00');

      const forgotten: DailyLog = {
        id: 'forgotten',
        childId: 'child-1',
        type: 'sleep',
        timestamp: forgottenStart.toISOString(),
        data: { startTime: forgottenStart.toISOString() },
        createdAt: forgottenStart.toISOString(),
      };

      const logs = [
        sleepLog('2026-06-14', 720),
        sleepLog('2026-06-15', 720),
        forgotten,
      ];

      const report = generateWeeklyReport(logs, [], 4);

      expect(report.sleep.loggedDays).toBe(2);
      expect(report.sleep.avgDailyHours).toBe(12);
    });

    /*
      The sleep SCORE reads its series through trendCalculator, not through
      buildSleepData, so guarding one and not the other let a single forgotten
      timer cost 25 points of the weekly sleep score and add a phantom day to
      the denominator the page prints as evidence - while the sleep section on
      that same page still read 11 hours a day. A report arguing with itself.
    */
    it('keeps a forgotten timer out of the sleep score, not just the averages', () => {
      const openStart = '2026-06-15T00:00:00+08:00';

      const forgotten: DailyLog = {
        id: 'forgotten',
        childId: 'child-1',
        type: 'sleep',
        timestamp: openStart,
        data: { startTime: openStart },
        createdAt: openStart,
      };

      const nights = WEEK_DATES.slice(0, 6).map((date) => sleepLog(date, 660));

      const report = generateWeeklyReport([...nights, forgotten], [], 4);

      const series = generateDailySeries(
        [...nights, forgotten],
        7,
        'sleep_duration',
      );

      expect(series[series.length - 1]).toBeNull();
      expect(report.scores.sleep.loggedDays).toBe(6);
      expect(report.sleep.loggedDays).toBe(6);
      expect(report.sleep.avgDailyHours).toBe(11);
    });

    /*
      An exclusively pumping mother logs bottles and pumping sessions on the
      same days. Folding the pumped millilitres into the feeding average
      doubles the intake the report shows, and the report is the document that
      gets carried into a clinic.
    */
    it('keeps pumping out of the feeding averages and gives it its own section', () => {
      const pumping = (date: string, hour: string): DailyLog => {
        const timestamp = `${date}T${hour}:00:00+08:00`;

        return {
          id: `log_${++logSeq}`,
          childId: 'child-1',
          type: 'feeding',
          timestamp,
          data: { feedingType: 'pumping', amount: 150, duration: 20 },
          createdAt: timestamp,
        };
      };

      const logs = ['2026-06-14', '2026-06-15'].flatMap((date) => [
        feedingLog(date, '06:00:00', 120),
        feedingLog(date, '18:00:00', 120),
        pumping(date, '07'),
        pumping(date, '19'),
      ]);

      const report = generateWeeklyReport(logs, [], 4);

      expect(report.feeding.avgDailyCount).toBe(2);
      expect(report.feeding.avgDailyAmount).toBe(240);

      expect(report.pumping).toEqual({
        sessions: 4,
        totalAmount: 600,
        totalMinutes: 80,
        loggedDays: 2,
        avgDailySessions: 2,
        avgDailyAmount: 300,
      });
    });

    it('omits the pumping section entirely when nobody pumped', () => {
      expect(
        generateWeeklyReport(buildRegularWeek(), [], 4).pumping,
      ).toBeUndefined();
    });

    it('withholds every score when only two days of a 30-day window were logged', () => {
      const logs = ['2026-06-14', '2026-06-15'].flatMap((date) => [
        feedingLog(date, '06:00:00', 120),
        feedingLog(date, '18:00:00', 120),
        sleepLog(date, 720),
        diaperLog(date, 'poop', 'normal'),
      ]);

      const { scores } = generateMonthlyReport(logs, [], 4);

      const noScore = { score: null, label: '再記幾天', loggedDays: 2 };

      expect(scores.feeding).toEqual(noScore);
      expect(scores.sleep).toEqual(noScore);
      expect(scores.poop).toEqual(noScore);
    });

    it('starts scoring at the fourth logged day', () => {
      const logs = ['2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15'].flatMap(
        (date) => [
          feedingLog(date, '06:00:00', 120),
          feedingLog(date, '18:00:00', 120),
        ],
      );

      const { scores } = generateMonthlyReport(logs, [], 4);

      expect(scores.feeding).toEqual({ score: 100, label: '很棒！', loggedDays: 4 });
    });
  });

  describe('growth section', () => {
    it('omits growth when there are fewer than two records', () => {
      const report = generateWeeklyReport(
        [],
        [growthRecord('2026-06-12', 6.2, 62.5)],
        4,
      );

      expect(report.growth).toBeUndefined();
    });

    it('omits growth when fewer than two records fall inside the window', () => {
      const records = [
        growthRecord('2026-05-20', 5.4, 58.0),
        growthRecord('2026-06-14', 6.55, 63.2),
      ];

      expect(generateWeeklyReport([], records, 4).growth).toBeUndefined();
      // The same pair is enough once the window widens to 30 days.
      expect(generateMonthlyReport([], records, 4).growth).toBeDefined();
    });

    it('reports rounded weight/height deltas and the latest percentiles', () => {
      const records = [
        growthRecord('2026-06-10', 6.2, 62.5, { weight: 45, height: 50 }),
        growthRecord('2026-06-14', 6.55, 63.2, {
          weight: 48,
          height: 52,
          headCircumference: 60,
        }),
      ];

      const report = generateWeeklyReport([], records, 4);

      expect(report.growth).toEqual({
        weightChange: 0.35, // 6.55 - 6.2, 2dp
        heightChange: 0.7, // 63.2 - 62.5, 1dp
        latestPercentiles: { weight: 48, height: 52, headCircumference: 60 },
      });
    });

    it('includes records exactly on the cutoff date and drops earlier ones', () => {
      const records = [
        growthRecord('2026-06-07', 1, 1, { weight: 1 }), // one day before the cutoff
        growthRecord('2026-06-08', 6.0, 61.0, { weight: 40 }), // cutoff = today - 7 days
        growthRecord('2026-06-14', 6.5, 62.0, { weight: 44 }),
      ];

      const report = generateWeeklyReport([], records, 4);

      expect(report.growth).toEqual({
        weightChange: 0.5,
        heightChange: 1,
        latestPercentiles: { weight: 44 },
      });
    });

    it('reports a zero delta when a bound is missing the measurement', () => {
      const partial: GrowthRecord = {
        id: 'growth-partial',
        childId: 'child-1',
        date: '2026-06-10',
        weight: 6.2,
        percentile: {},
      };

      const records = [
        partial,
        growthRecord('2026-06-14', 6.55, 63.2, { weight: 48 }),
      ];

      const report = generateWeeklyReport([], records, 4);

      expect(report.growth).toEqual({
        weightChange: 0.35,
        heightChange: 0, // first record has no height
        latestPercentiles: { weight: 48 },
      });
    });
  });

  describe('calculateScores', () => {
    const sleepEveryDay = (durationMinutes: number): DailyLog[] =>
      WEEK_DATES.map((date) => sleepLog(date, durationMinutes));

    it('awards full sleep credit once the age recommendation is met', () => {
      // 24 months -> "12-13 小時" -> min 12; 12h/day meets it exactly.
      const scores = calculateScores(sleepEveryDay(720), 7, 24);

      expect(scores.sleep).toEqual({ score: 100, label: '很棒！', loggedDays: 7 });
    });

    it('scales sleep down proportionally when short of the recommendation', () => {
      // 8h vs. the 13h recommendation: 8/13 * 60 + 40 = 76.92 -> 77
      const scores = calculateScores(sleepEveryDay(480), 7, 4);

      expect(scores.sleep).toEqual({ score: 77, label: '不錯', loggedDays: 7 });
    });

    it('uses the newborn recommendation for infants under a month', () => {
      // 0 months -> "16-17 小時" -> min 16; 12h/day -> 12/16 * 60 + 40 = 85
      const scores = calculateScores(sleepEveryDay(720), 7, 0);

      expect(scores.sleep).toEqual({ score: 85, label: '很棒！', loggedDays: 7 });
    });

    it('withholds a poop score entirely when no diaper was ever logged', () => {
      const scores = calculateScores(sleepEveryDay(720), 7, 4);

      // 原本是 0 分「需注意」——只記睡眠不記尿布的家長，每週報告都被告知
      // 排便有問題。沒記尿布不是沒大便。
      expect(scores.poop).toEqual({ score: null, label: '再記幾天', loggedDays: 0 });
    });

    it('rewards a daily poop rhythm regardless of consistency labels', () => {
      const logs = WEEK_DATES.map((date) => diaperLog(date, 'poop'));
      const scores = calculateScores(logs, 7, 4);

      expect(scores.poop).toEqual({ score: 100, label: '很棒！', loggedDays: 7 });
    });

    it('scores pee-only diaper days as a real zero, not as missing data', () => {
      const logs = WEEK_DATES.map((date) => diaperLog(date, 'pee'));
      const scores = calculateScores(logs, 7, 4);

      // 有記尿布卻沒有大便，是真的七天沒大便，該說。
      expect(scores.poop).toEqual({ score: 0, label: '需注意', loggedDays: 7 });
    });

    it('derives sleep duration from start/end when duration is absent', () => {
      // No precomputed `duration`, so calculateSleepDuration has to run.
      const logs: DailyLog[] = WEEK_DATES.map((date) => {
        const start = new Date(`${date}T20:00:00+08:00`);
        const end = new Date(start.getTime() + 720 * 60 * 1000);

        return {
          id: `log_nodur_${date}`,
          childId: 'child-1',
          type: 'sleep',
          timestamp: start.toISOString(),
          data: { startTime: start.toISOString(), endTime: end.toISOString() },
          createdAt: start.toISOString(),
        };
      });

      const scores = calculateScores(logs, 7, 4);

      expect(scores.sleep).toEqual({ score: 95, label: '很棒！', loggedDays: 7 });
    });
  });

  describe('generateSummaryText', () => {
    const baseReport = (overrides: Partial<WeeklyReport> = {}): WeeklyReport => ({
      period: { start: '2026-06-09', end: '2026-06-15' },
      scores: {
        feeding: { score: 0, label: '需注意', loggedDays: 7 },
        sleep: { score: 0, label: '需注意', loggedDays: 7 },
        poop: { score: 0, label: '需注意', loggedDays: 7 },
      },
      feeding: {
        dailyAmounts: [],
        avgDailyCount: 0,
        avgDailyAmount: 0,
        loggedDays: 0,
        maxDay: { date: '', amount: 0 },
        minDay: { date: '', amount: 0 },
      },
      sleep: {
        dailyDurations: [],
        avgDailyHours: 0,
        loggedDays: 0,
        longestContinuous: 0,
        nightWakingsTrend: 'stable',
        recommendedHours: 13,
      },
      poop: {
        dailyCounts: [],
        avgDailyCount: 0,
        loggedDays: 0,
        longestGap: 0,
        consistencyDistribution: {},
      },
      summaryText: '',
      ...overrides,
    });

    it('falls back to a prompt when nothing was recorded', () => {
      expect(generateSummaryText(baseReport())).toBe(
        '尚無足夠資料產生摘要，請持續記錄寶寶的日常。',
      );
    });

    it('falls back to feed count when no amount was recorded (breastfeeding)', () => {
      const report = baseReport({
        feeding: {
          ...baseReport().feeding,
          avgDailyCount: 6.5,
          avgDailyAmount: 0,
        },
      });

      expect(generateSummaryText(report)).toBe('平均每日餵奶 6.5 次。');
    });

    it('prefers amount over count when both are present', () => {
      const report = baseReport({
        feeding: {
          ...baseReport().feeding,
          avgDailyCount: 6.5,
          avgDailyAmount: 780,
        },
      });

      const text = generateSummaryText(report);

      expect(text).toBe('餵奶量平均每日 780ml。');
      expect(text).not.toContain('次');
    });

    it('rounds and flags poop gaps beyond 48 hours', () => {
      const report = baseReport({
        poop: { ...baseReport().poop, avgDailyCount: 0.3, longestGap: 72.6 },
      });

      expect(generateSummaryText(report)).toBe('排便間隔最長達 73 小時，需留意。');
    });

    it('treats a 48-hour gap as still regular', () => {
      const report = baseReport({
        poop: { ...baseReport().poop, avgDailyCount: 0.5, longestGap: 48 },
      });

      expect(generateSummaryText(report)).toBe('排便規律正常。');
    });

    it('joins every available section in order', () => {
      const report = baseReport({
        feeding: { ...baseReport().feeding, avgDailyCount: 5, avgDailyAmount: 600 },
        sleep: { ...baseReport().sleep, avgDailyHours: 14, recommendedHours: 13 },
        poop: { ...baseReport().poop, avgDailyCount: 2, longestGap: 12 },
      });

      expect(generateSummaryText(report)).toBe(
        '餵奶量平均每日 600ml。睡眠時數平均 14 小時，符合建議範圍。排便規律正常。',
      );
    });
  });
});
