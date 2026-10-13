import { describe, it, expect } from 'vitest';
import type { DailyLog } from '../records';
import {
  calculateSleepRegularity,
  calculateSleepStats,
  generateSleepAdvice,
  isNightSleep,
} from './sleepAnalysis';

/**
 * 這一頁把規律性畫成五顆星，是使用者看到最顯眼的評價。
 *
 * 修之前它對每一個會小睡的孩子都是錯的：小睡混進「入睡時間」，早上 09:30 和
 * 晚上 20:00 被平均成 14:45，標準差大到評分永遠 0 分。而這個 app 的每一個孩子
 * 都在小睡。跨午夜的就寢時間是第二個獨立的錯：23:50 與 00:10 線性平均是 12:00。
 */

const sleep = (
  daysAgo: number,
  hour: number,
  minute: number,
  hours: number,
): DailyLog => {
  const base = new Date();

  base.setDate(base.getDate() - daysAgo);

  const start = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hour,
    minute,
  );

  const end = new Date(start.getTime() + hours * 3600_000);

  return {
    id: `${daysAgo}-${hour}${minute}`,
    childId: 'c1',
    type: 'sleep',
    timestamp: start.toISOString(),
    data: {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration: hours * 60,
    },
    createdAt: start.toISOString(),
  } as DailyLog;
};

describe('calculateSleepRegularity', () => {
  it('會小睡但每晚 20:00 就寢的孩子，就是 20:00 而且滿分', () => {
    const logs: DailyLog[] = [];

    for (let i = 1; i <= 4; i++) {
      logs.push(sleep(i, 9, 30, 1.5)); // 早上小睡
      logs.push(sleep(i, 20, 0, 10)); // 夜間就寢
    }

    const result = calculateSleepRegularity(logs);

    expect(result.averageBedtime).toBe('20:00');
    expect(result.bedtimeRegularity).toBe(100);
  });

  it('固定在午夜前後就寢，一樣算規律', () => {
    const logs = [
      sleep(1, 23, 50, 9),
      sleep(2, 0, 10, 9),
      sleep(3, 23, 55, 9),
      sleep(4, 0, 5, 9),
    ];

    const result = calculateSleepRegularity(logs);

    expect(result.averageBedtime).toBe('00:00');
    expect(result.bedtimeRegularity).toBeGreaterThan(80);
  });

  it('真的不規律就要低分', () => {
    // 這個測試防的是「把所有情況都算成滿分」的反向錯誤。
    const logs = [
      sleep(1, 19, 0, 9),
      sleep(2, 23, 30, 9),
      sleep(3, 21, 0, 9),
      sleep(4, 2, 0, 9),
    ];

    const result = calculateSleepRegularity(logs);

    expect(result.bedtimeRegularity).toBeLessThan(50);
  });

  it('清醒時間算的是早上起床，不是下午小睡醒來', () => {
    const logs = [
      sleep(1, 20, 0, 10), // 睡到 06:00
      sleep(1, 13, 0, 1.5), // 下午小睡到 14:30
      sleep(2, 20, 0, 10),
      sleep(2, 13, 0, 1.5),
    ];

    const result = calculateSleepRegularity(logs);

    expect(result.averageWakeTime).toBe('06:00');
  });

  it('只記過小睡時不給就寢數字——那是沒有資料，不是很不規律', () => {
    const logs = [sleep(1, 9, 30, 1.5), sleep(2, 13, 0, 2), sleep(3, 10, 0, 1)];

    const result = calculateSleepRegularity(logs);

    expect(result.averageBedtime).toBeUndefined();
  });
});

describe('isNightSleep', () => {
  it('18:00 以後與 06:00 以前算夜間', () => {
    expect(isNightSleep(new Date(2026, 3, 1, 18, 0).toISOString())).toBe(true);
    expect(isNightSleep(new Date(2026, 3, 1, 2, 0).toISOString())).toBe(true);
  });

  it('白天的小睡不算', () => {
    expect(isNightSleep(new Date(2026, 3, 1, 9, 30).toISOString())).toBe(false);
    expect(isNightSleep(new Date(2026, 3, 1, 13, 0).toISOString())).toBe(false);
  });
});

describe('calculateSleepStats', () => {
  it('divides the total by the days that have records, not by the window length', () => {
    // 30 天的視窗裡只記了一晚 10 小時。原本除以 30 得到每日平均 0.3 小時。
    const stats = calculateSleepStats([sleep(2, 20, 0, 10)], 'month');

    expect(stats.daysWithRecords).toBe(1);
    expect(stats.dailyAverage).toBe(600);
  });

  it('counts a calendar day once however many sleeps it holds', () => {
    const logs = [
      sleep(1, 9, 30, 1.5),
      sleep(1, 13, 0, 1),
      sleep(1, 20, 0, 9.5),
      sleep(2, 20, 0, 12),
    ];

    const stats = calculateSleepStats(logs, 'week');

    expect(stats.daysWithRecords).toBe(2);
    expect(stats.sleepCount).toBe(4);
    expect(stats.dailyAverage).toBe(720); // (12 + 12) 小時 / 2 天
  });

  it('keeps daysInPeriod as the window length so the two are not confused', () => {
    const stats = calculateSleepStats([sleep(1, 20, 0, 10)], 'week');

    expect(stats.daysInPeriod).toBe(7);
    expect(stats.daysWithRecords).toBe(1);
  });

  it('reports a zero average rather than dividing by nothing', () => {
    const stats = calculateSleepStats([], 'week');

    expect(stats.daysWithRecords).toBe(0);
    expect(stats.dailyAverage).toBe(0);
  });
});

describe('generateSleepAdvice', () => {
  const adviceTitles = (
    logs: DailyLog[],
    period: 'today' | 'week' | 'month',
    ageMonths: number,
  ) =>
    generateSleepAdvice(calculateSleepStats(logs, period), ageMonths).map(
      (a) => a.title,
    );

  it('says nothing at all when nothing has been logged', () => {
    // 今日分頁在早上打開時就是這個情況。原本會宣告「睡眠時間不足，不足約
    // 13 小時」——對一個今天還沒開始記的家長。
    expect(adviceTitles([], 'today', 4)).toEqual([]);
  });

  it('does not call one logged night a shortfall', () => {
    // 一晚 10 小時對照建議的 13-15 小時。一晚是那一晚的事。
    expect(adviceTitles([sleep(1, 20, 0, 10)], 'month', 4)).not.toContain(
      '睡眠時間不足',
    );
  });

  it('does call it a shortfall once several days agree', () => {
    const logs = [sleep(1, 20, 0, 10), sleep(2, 20, 0, 10), sleep(3, 20, 0, 10)];

    expect(adviceTitles(logs, 'week', 4)).toContain('睡眠時間不足');
  });

  it('measures the daily average against the days actually recorded', () => {
    // 三天各 13.5 小時，落在 13-15 小時之內。除以 30 會得到 1.35 小時。
    const logs = [
      sleep(1, 20, 0, 13.5),
      sleep(2, 20, 0, 13.5),
      sleep(3, 20, 0, 13.5),
    ];

    expect(adviceTitles(logs, 'month', 4)).toContain('睡眠時長充足');
  });

  it('still reports observations that hold for a single day', () => {
    // 一天之內 6 段睡眠、每段 40 分鐘：次數與單次時長都是那一天看得出來的事，
    // 不需要等到累積幾天才能講。
    const logs = Array.from({ length: 6 }, (_, i) => sleep(0, 8 + i * 2, 0, 40 / 60));

    const titles = adviceTitles(logs, 'today', 8);

    expect(titles).toContain('睡眠次數較多');
    expect(titles).toContain('單次睡眠時間較短');
    expect(titles).not.toContain('睡眠時間不足');
  });
});
