import { describe, expect, it } from 'vitest';
import type {
  DailyLog,
  SleepData,
} from '../../../family/domain/familyRecords/index';
import {
  analyzeSleepPatterns,
  calculateAverageBedtime,
  calculateAverageSleepDuration,
  calculateAverageWakeTime,
  calculateRoutineScore,
  calculateSleepQualityScore,
  calculateTotalNightWakings,
  calculateTotalSleepDuration,
  detectSleepingThroughNight,
  filterSleepLogs,
  findLongestSleepSession,
  getSleepLogsInRange,
  getSleepPatternsByDate,
} from './sleepAnalytics';

describe('sleepAnalytics', () => {
  // Helper function to create sleep logs
  const createSleepLog = (
    timestamp: string,
    duration: number,
    nightWakings?: number,
  ): DailyLog => {
    const startTime = new Date(timestamp);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    return {
      id: `log_${Math.random()}`,
      childId: 'child123',
      type: 'sleep',
      timestamp,
      data: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        nightWakings,
      } as SleepData,
      createdAt: timestamp,
    };
  };

  const createFeedingLog = (timestamp: string): DailyLog => ({
    id: `log_${Math.random()}`,
    childId: 'child123',
    type: 'feeding',
    timestamp,
    data: {
      feedingType: 'breast_left',
      duration: 15,
    },
    createdAt: timestamp,
  });

  describe('filterSleepLogs', () => {
    it('should filter only sleep logs', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 120),
        createFeedingLog('2026-04-06T12:00:00Z'),
        createSleepLog('2026-04-06T14:00:00Z', 90),
      ];

      const sleepLogs = filterSleepLogs(logs);

      expect(sleepLogs).toHaveLength(2);
      expect(sleepLogs.every((log) => log.type === 'sleep')).toBe(true);
    });
  });

  describe('getSleepLogsInRange', () => {
    it('should return logs from today (since midnight)', () => {
      const now = new Date('2026-07-05T12:00:00Z');
      const twoDaysAgo = new Date(now);

      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const today = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago

      const logs: DailyLog[] = [
        createSleepLog(twoDaysAgo.toISOString(), 120),
        createSleepLog(today.toISOString(), 90),
      ];

      const recentLogs = getSleepLogsInRange(logs, 1, now);

      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0].timestamp).toBe(today.toISOString());
    });

    it('should return logs from last 7 days', () => {
      const now = new Date('2026-07-05T12:00:00Z');
      const logs: DailyLog[] = [];

      // Create logs for last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

        logs.push(createSleepLog(date.toISOString(), 120));
      }

      // Add a log from 8 days ago
      const oldLog = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

      logs.push(createSleepLog(oldLog.toISOString(), 120));

      const recentLogs = getSleepLogsInRange(logs, 7, now);

      expect(recentLogs).toHaveLength(7);
    });
  });

  describe('calculateTotalSleepDuration', () => {
    it('should sum up all sleep durations', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 120),
        createSleepLog('2026-04-06T14:00:00Z', 90),
        createSleepLog('2026-04-06T18:00:00Z', 150),
      ];

      const total = calculateTotalSleepDuration(logs);

      expect(total).toBe(360); // 120 + 90 + 150
    });

    it('should return 0 for empty logs', () => {
      expect(calculateTotalSleepDuration([])).toBe(0);
    });
  });

  describe('findLongestSleepSession', () => {
    it('should find the longest sleep duration', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 120),
        createSleepLog('2026-04-06T14:00:00Z', 180),
        createSleepLog('2026-04-06T18:00:00Z', 90),
      ];

      const longest = findLongestSleepSession(logs);

      expect(longest).toBe(180);
    });

    it('should return 0 for empty logs', () => {
      expect(findLongestSleepSession([])).toBe(0);
    });
  });

  describe('calculateAverageSleepDuration', () => {
    it('should calculate average sleep duration', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 120),
        createSleepLog('2026-04-06T14:00:00Z', 180),
        createSleepLog('2026-04-06T18:00:00Z', 90),
      ];

      const avg = calculateAverageSleepDuration(logs);

      expect(avg).toBe(130); // (120 + 180 + 90) / 3 = 130
    });

    it('should return 0 for empty logs', () => {
      expect(calculateAverageSleepDuration([])).toBe(0);
    });
  });

  describe('calculateTotalNightWakings', () => {
    it('should sum up all night wakings', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 120, 0),
        createSleepLog('2026-04-06T14:00:00Z', 180, 2),
        createSleepLog('2026-04-06T18:00:00Z', 90, 3),
      ];

      const total = calculateTotalNightWakings(logs);

      expect(total).toBe(5); // 0 + 2 + 3
    });

    it('should return 0 when no night wakings recorded', () => {
      const logs: DailyLog[] = [createSleepLog('2026-04-06T10:00:00Z', 120)];

      expect(calculateTotalNightWakings(logs)).toBe(0);
    });
  });

  describe('detectSleepingThroughNight', () => {
    it('should return true for sleep >= 6 hours', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 360), // 6 hours
      ];

      expect(detectSleepingThroughNight(logs)).toBe(true);
    });

    it('should return true for sleep > 6 hours', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 420), // 7 hours
      ];

      expect(detectSleepingThroughNight(logs)).toBe(true);
    });

    it('should return false for sleep < 6 hours', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 300), // 5 hours
      ];

      expect(detectSleepingThroughNight(logs)).toBe(false);
    });

    it('should return false for empty logs', () => {
      expect(detectSleepingThroughNight([])).toBe(false);
    });
  });

  describe('calculateSleepQualityScore', () => {
    it('awards full marks to an optimal session the parent said had no wakings', () => {
      const logs: DailyLog[] = [createSleepLog('2026-04-06T10:00:00Z', 150, 0)];

      expect(calculateSleepQualityScore(logs)).toBe(100);
    });

    /*
      A log written before night wakings could be recorded says nothing about
      wakings. Scoring it as a perfect night is how the old implementation told
      every parent their baby slept through: `nightWakings || 0` cannot tell
      "the parent said zero" from "we never asked".
    */
    it('does not award the no-wakings marks when nothing was recorded', () => {
      const unrecorded = calculateSleepQualityScore([
        createSleepLog('2026-04-06T10:00:00Z', 150),
      ]);

      const recordedZero = calculateSleepQualityScore([
        createSleepLog('2026-04-06T10:00:00Z', 150, 0),
      ]);

      expect(unrecorded).toBeLessThan(recordedZero);
      expect(unrecorded).toBe(80);
    });

    it('scores a broken night below a session whose wakings were never recorded', () => {
      const brokenNight = calculateSleepQualityScore([
        createSleepLog('2026-04-06T10:00:00Z', 150, 3),
      ]);

      const unrecorded = calculateSleepQualityScore([
        createSleepLog('2026-04-06T10:00:00Z', 150),
      ]);

      expect(brokenNight).toBeLessThan(unrecorded);
      expect(brokenNight).toBe(60);
    });

    it('should give lower score for a short session with wakings', () => {
      const logs: DailyLog[] = [createSleepLog('2026-04-06T10:00:00Z', 60, 3)];

      expect(calculateSleepQualityScore(logs)).toBeLessThan(60);
    });

    /*
      A nap in progress has no duration to judge. Scoring it as a zero-minute
      session made the number drop the moment a parent started a sleep and
      climb back when they ended it, which is the clock talking, not the baby.
    */
    it('leaves a sleep still in progress out of the score', () => {
      const finished = createSleepLog('2026-04-06T10:00:00Z', 150);

      const inProgress: DailyLog = {
        id: 'open',
        childId: 'child123',
        type: 'sleep',
        timestamp: '2026-04-06T14:00:00Z',
        data: { startTime: '2026-04-06T14:00:00Z' } as SleepData,
        createdAt: '2026-04-06T14:00:00Z',
      };

      expect(calculateSleepQualityScore([finished, inProgress])).toBe(
        calculateSleepQualityScore([finished]),
      );
    });

    it('returns 0 when nothing has finished yet', () => {
      const inProgress: DailyLog = {
        id: 'open',
        childId: 'child123',
        type: 'sleep',
        timestamp: '2026-04-06T14:00:00Z',
        data: { startTime: '2026-04-06T14:00:00Z' } as SleepData,
        createdAt: '2026-04-06T14:00:00Z',
      };

      expect(calculateSleepQualityScore([inProgress])).toBe(0);
    });

    it('should return 0 for empty logs', () => {
      expect(calculateSleepQualityScore([])).toBe(0);
    });
  });

  describe('calculateRoutineScore', () => {
    it('should give high score for consistent sleep times', () => {
      const logs: DailyLog[] = [];
      const baseDate = new Date('2026-04-07T10:00:00Z');

      // Create 7 days of logs at same time
      for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);

        date.setDate(date.getDate() - 7 + i);
        logs.push(createSleepLog(date.toISOString(), 120));
      }

      const score = calculateRoutineScore(logs, 7, baseDate);

      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('should give low score for inconsistent sleep times', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-01T08:00:00Z', 120),
        createSleepLog('2026-04-02T12:00:00Z', 120),
        createSleepLog('2026-04-03T16:00:00Z', 120),
        createSleepLog('2026-04-04T20:00:00Z', 120),
      ];

      const baseDate = new Date('2026-04-07T00:00:00Z');

      const score = calculateRoutineScore(logs, 7, baseDate);

      expect(score).toBeLessThan(50);
    });

    it('should return 0 for insufficient data', () => {
      const logs: DailyLog[] = [createSleepLog('2026-04-01T10:00:00Z', 120)];

      const baseDate = new Date('2026-04-07T00:00:00Z');

      expect(calculateRoutineScore(logs, 7, baseDate)).toBe(0);
    });
  });

  describe('calculateAverageBedtime', () => {
    // 原本的 fixture 寫 '...T22:00:00Z'，在 Asia/Taipei 是早上 06:00，也就是
    // 一次小睡而不是就寢。而且只斷言 /^\d{2}:\d{2}$/ 的格式，不斷言數值，
    // 所以會小睡的孩子被算成 14:45 也照樣通過。
    const bedtimeAt = (day: number, hour: number, minute: number) =>
      createSleepLog(new Date(2026, 3, day, hour, minute).toISOString(), 480);

    it('算的是夜間就寢的平均時刻', () => {
      const logs: DailyLog[] = [
        bedtimeAt(1, 21, 0),
        bedtimeAt(2, 21, 30),
        bedtimeAt(3, 21, 15),
      ];

      expect(calculateAverageBedtime(logs, 7, new Date(2026, 3, 5))).toBe('21:15');
    });

    it('小睡不算就寢——每個這個年紀的孩子都在小睡', () => {
      const logs: DailyLog[] = [
        bedtimeAt(1, 9, 30), // 早上小睡
        bedtimeAt(1, 20, 0),
        bedtimeAt(2, 9, 30),
        bedtimeAt(2, 20, 0),
      ];

      expect(calculateAverageBedtime(logs, 7, new Date(2026, 3, 5))).toBe('20:00');
    });

    it('跨午夜的就寢時間平均在午夜附近，不是中午', () => {
      const logs: DailyLog[] = [bedtimeAt(1, 23, 50), bedtimeAt(3, 0, 10)];

      expect(calculateAverageBedtime(logs, 7, new Date(2026, 3, 5))).toBe('00:00');
    });

    it('只有小睡時沒有就寢時間可報', () => {
      expect(
        calculateAverageBedtime([bedtimeAt(1, 13, 0)], 7, new Date(2026, 3, 5)),
      ).toBeUndefined();
    });

    it('should return undefined for empty logs', () => {
      expect(calculateAverageBedtime([], 7)).toBeUndefined();
    });
  });

  describe('calculateAverageWakeTime', () => {
    const sleepFrom = (day: number, hour: number, minutes: number) =>
      createSleepLog(new Date(2026, 3, day, hour, 0).toISOString(), minutes);

    it('算的是早上起床，不是下午小睡醒來', () => {
      const logs: DailyLog[] = [
        sleepFrom(1, 20, 600), // 20:00 睡到 06:00
        sleepFrom(2, 20, 600),
        sleepFrom(2, 13, 90), // 下午小睡到 14:30——原本會被當成起床時間
      ];

      expect(calculateAverageWakeTime(logs, 7, new Date(2026, 3, 5))).toBe('06:00');
    });

    it('should return undefined for empty logs', () => {
      expect(calculateAverageWakeTime([], 7)).toBeUndefined();
    });
  });

  describe('analyzeSleepPatterns', () => {
    it('should generate comprehensive sleep analytics', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 360, 0), // 6 hours
        createSleepLog('2026-04-06T18:00:00Z', 120, 1), // 2 hours
      ];

      const baseDate = new Date('2026-04-07T00:00:00Z');

      const analytics = analyzeSleepPatterns(logs, baseDate);

      expect(analytics.totalSleepDuration).toBe(480); // 8 hours
      expect(analytics.sleepCount).toBe(2);
      expect(analytics.longestSleepDuration).toBe(360);
      expect(analytics.isSleepingThroughNight).toBe(true);
      expect(analytics.sleepQualityScore).toBeGreaterThan(0);
      expect(analytics.nightWakingsTotal).toBe(1);
      expect(analytics.recommendations).toBeDefined();
      expect(analytics.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate recommendations', () => {
      const logs: DailyLog[] = [createSleepLog('2026-04-06T10:00:00Z', 360, 0)];

      const baseDate = new Date('2026-04-07T00:00:00Z');

      const analytics = analyzeSleepPatterns(logs, baseDate);

      expect(analytics.recommendations).toBeDefined();
      expect(analytics.recommendations.length).toBeGreaterThan(0);
      expect(analytics.recommendations[0]).toHaveProperty('id');
      expect(analytics.recommendations[0]).toHaveProperty('type');
      expect(analytics.recommendations[0]).toHaveProperty('title');
      expect(analytics.recommendations[0]).toHaveProperty('message');
      expect(analytics.recommendations[0]).toHaveProperty('icon');
    });
  });

  describe('getSleepPatternsByDate', () => {
    it('should group sleep logs by date', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-06T10:00:00Z', 120),
        createSleepLog('2026-04-06T14:00:00Z', 90),
        createSleepLog('2026-04-05T10:00:00Z', 180),
      ];

      const baseDate = new Date('2026-04-07T00:00:00Z');

      const patterns = getSleepPatternsByDate(logs, 7, baseDate);

      expect(patterns).toHaveLength(2); // 2 different dates
      expect(patterns[0].date).toBe('2026-04-06');
      expect(patterns[0].sleepSessions).toHaveLength(2);
      expect(patterns[0].totalDuration).toBe(210); // 120 + 90
      expect(patterns[1].date).toBe('2026-04-05');
      expect(patterns[1].sleepSessions).toHaveLength(1);
    });

    it('should calculate quality score for each date', () => {
      const logs: DailyLog[] = [createSleepLog('2026-04-06T10:00:00Z', 180, 0)];

      const baseDate = new Date('2026-04-07T00:00:00Z');

      const patterns = getSleepPatternsByDate(logs, 7, baseDate);

      expect(patterns[0].qualityScore).toBeGreaterThan(0);
    });

    it('should sort patterns newest first', () => {
      const logs: DailyLog[] = [
        createSleepLog('2026-04-05T10:00:00Z', 120),
        createSleepLog('2026-04-06T10:00:00Z', 120),
        createSleepLog('2026-04-04T10:00:00Z', 120),
      ];

      const baseDate = new Date('2026-04-07T00:00:00Z');

      const patterns = getSleepPatternsByDate(logs, 7, baseDate);

      expect(patterns[0].date).toBe('2026-04-06');
      expect(patterns[1].date).toBe('2026-04-05');
      expect(patterns[2].date).toBe('2026-04-04');
    });
  });
});
