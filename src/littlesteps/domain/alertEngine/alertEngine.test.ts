import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  DailyLog,
  DiaperData,
  FeedingData,
  SleepData,
} from '../../../family/domain/familyRecords/index';
import {
  detectFeedingAlerts,
  detectPoopAlerts,
  detectSleepAlerts,
  getActiveAlerts,
} from './alertEngine';

/**
 * 這個模組用 `new Date()` 決定「今天」「昨天」，並以 `toLocalDateKey()` 轉成
 * 本地日曆日。vitest.config.ts 已把 process.env.TZ 釘在 Asia/Taipei，所以
 * 下面的日期字串就是台灣使用者看到的日曆日，時間戳一律寫 +08:00。
 *
 * FIXED_NOW 是真實瞬間，等於台灣時間 2026-06-15 上午 09:00——刻意選在早上，
 * 因為這一批修正要證明的就是「早上不會因為今天還沒睡滿一天而跳警示」。
 */
const FIXED_NOW = new Date('2026-06-15T01:00:00Z');
const TODAY = '2026-06-15';
const YESTERDAY = '2026-06-14';

const AGE_MONTHS = 4; // 4 個月 -> 建議 13-15 小時，70% 門檻是 9.1 小時

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

const feeding = (date: string, amount: number, hour = '09'): DailyLog =>
  makeLog('feeding', `${date}T${hour}:00:00+08:00`, {
    feedingType: 'formula',
    amount,
  });

/** 已結束的睡眠，帶明確時長（分鐘）。 */
const sleep = (date: string, durationMinutes: number, hour = '20'): DailyLog => {
  const startTime = `${date}T${hour}:00:00+08:00`;

  const endTime = new Date(
    new Date(startTime).getTime() + durationMinutes * 60_000,
  ).toISOString();

  return makeLog('sleep', startTime, {
    startTime,
    endTime,
    duration: durationMinutes,
  });
};

/** 還在睡：沒有 endTime，也沒有 duration。 */
const sleepInProgress = (date: string, hour = '20'): DailyLog => {
  const startTime = `${date}T${hour}:00:00+08:00`;

  return makeLog('sleep', startTime, { startTime });
};

const poop = (date: string, hour = '09'): DailyLog =>
  makeLog('diaper', `${date}T${hour}:00:00+08:00`, { type: 'poop' });

const idsOf = (alerts: { id: string }[]) => alerts.map((alert) => alert.id);

describe('alertEngine', () => {
  beforeEach(() => {
    logSeq = 0;
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('detectSleepAlerts', () => {
    it('stays silent for incomplete morning sleep data', () => {
      // 今天到 09:00 只睡了 2 小時，遠低於 13 小時的 70%。原本這裡會亮
      // 「今日睡眠時數偏低」，而且會一路亮到深夜——每天早上都一樣。
      const logs = [sleep(YESTERDAY, 780), sleep(TODAY, 120, '05')];

      expect(detectSleepAlerts(logs, AGE_MONTHS)).toEqual([]);
    });

    it('flags yesterday once the day is over and the total really was short', () => {
      const alerts = detectSleepAlerts([sleep(YESTERDAY, 360)], AGE_MONTHS);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('sleep-below-recommended');
      expect(alerts[0].title).toBe('昨日睡眠時數偏低');

      expect(alerts[0].message).toBe(
        '昨日睡眠 6.0 小時，低於建議最低 13 小時的 70%，請注意寶寶作息。',
      );
    });

    it('says nothing when yesterday met the recommendation', () => {
      expect(detectSleepAlerts([sleep(YESTERDAY, 780)], AGE_MONTHS)).toEqual([]);
    });

    it('says nothing when yesterday has no sleep record at all', () => {
      // 沒記錄不是沒睡。
      expect(detectSleepAlerts([sleep(TODAY, 120, '05')], AGE_MONTHS)).toEqual([]);
    });

    it('says nothing when one of yesterday\u2019s sleeps was never ended', () => {
      // 忘了按結束的那一段沒有時數，昨天的總和就是不完整的。
      const logs = [sleep(YESTERDAY, 240, '13'), sleepInProgress(YESTERDAY)];

      expect(detectSleepAlerts(logs, AGE_MONTHS)).toEqual([]);
    });

    it('adds up every completed sleep of yesterday before judging', () => {
      // 4 + 2 + 3.5 = 9.5 小時，剛好高於 9.1 小時的門檻。
      const logs = [
        sleep(YESTERDAY, 240, '01'),
        sleep(YESTERDAY, 120, '13'),
        sleep(YESTERDAY, 210, '20'),
      ];

      expect(detectSleepAlerts(logs, AGE_MONTHS)).toEqual([]);
    });
  });

  describe('detectFeedingAlerts', () => {
    /** 06-08 到 06-13：昨天之前那六天，每天固定奶量。 */
    const baselineWeek = (amount: number): DailyLog[] =>
      [
        '2026-06-08',
        '2026-06-09',
        '2026-06-10',
        '2026-06-11',
        '2026-06-12',
        '2026-06-13',
      ].map((date) => feeding(date, amount));

    it('does not judge today halfway through it', () => {
      // 今天早上才喝 100ml，昨天整天 800ml 與前六天持平。
      const logs = [
        ...baselineWeek(800),
        feeding(YESTERDAY, 800),
        feeding(TODAY, 100),
      ];

      expect(idsOf(detectFeedingAlerts(logs, AGE_MONTHS))).not.toContain(
        'feeding-low-amount',
      );
    });

    it('flags yesterday when its total fell below 70% of the week', () => {
      const logs = [
        ...baselineWeek(800),
        feeding(YESTERDAY, 300),
        feeding(TODAY, 200),
      ];

      const alert = detectFeedingAlerts(logs, AGE_MONTHS).find(
        (a) => a.id === 'feeding-low-amount',
      );

      expect(alert?.title).toBe('昨日餵奶量偏低');

      expect(alert?.message).toBe(
        '昨日餵奶量 300ml，低於近一週平均 800ml 的 70%，請留意寶寶食慾。',
      );
    });

    it('leaves yesterday out of the average it is measured against', () => {
      // 550ml 低於前六天 800ml 的 70%（560ml），所以該說。把昨天自己算進
      // 平均會得到 764ml，門檻降到 535ml，這一天就被自己的低值救了回去。
      const logs = [...baselineWeek(800), feeding(YESTERDAY, 550)];

      const alert = detectFeedingAlerts(logs, AGE_MONTHS).find(
        (a) => a.id === 'feeding-low-amount',
      );

      expect(alert?.message).toBe(
        '昨日餵奶量 550ml，低於近一週平均 800ml 的 70%，請留意寶寶食慾。',
      );
    });

    it('ignores unlogged days instead of averaging them in as zero', () => {
      // 只有三天有記，平均是那三天的 900ml。補 0 會把平均壓到 450ml，
      // 昨天的 500ml 就變成「高於平均」，該說的話反而沒說。
      const logs = [
        feeding('2026-06-11', 900),
        feeding('2026-06-12', 900),
        feeding('2026-06-13', 900),
        feeding(YESTERDAY, 500),
      ];

      const alert = detectFeedingAlerts(logs, AGE_MONTHS).find(
        (a) => a.id === 'feeding-low-amount',
      );

      expect(alert?.message).toContain('平均 900ml');
    });

    it('needs at least three logged days before it calls anything an average', () => {
      const logs = [
        feeding('2026-06-12', 900),
        feeding('2026-06-13', 900),
        feeding(YESTERDAY, 100),
      ];

      expect(idsOf(detectFeedingAlerts(logs, AGE_MONTHS))).not.toContain(
        'feeding-low-amount',
      );
    });

    it('says nothing about yesterday when yesterday was never logged', () => {
      const logs = [...baselineWeek(800), feeding(TODAY, 100)];

      expect(idsOf(detectFeedingAlerts(logs, AGE_MONTHS))).not.toContain(
        'feeding-low-amount',
      );
    });

    it('still reports a gap since the last feed, which is a real-time fact', () => {
      const alerts = detectFeedingAlerts([feeding(TODAY, 120, '01')], AGE_MONTHS);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('feeding-long-gap');

      expect(alerts[0].message).toBe(
        '距離上次餵奶已經 8 小時，請確認寶寶是否需要餵食。',
      );
    });

    it('reports no gap when the baby was fed within the last six hours', () => {
      expect(detectFeedingAlerts([feeding(TODAY, 120, '08')], AGE_MONTHS)).toEqual(
        [],
      );
    });

    /*
      A pumping session is the mother's output. Stored as a feeding log it
      silently reset the "six hours since the last feed" warning, so a mother
      who pumps at 02:00 stops being told that her BABY has not been fed.
    */
    it('does not let a pumping session stand in for a feed', () => {
      const pumped = makeLog('feeding', `${TODAY}T08:00:00+08:00`, {
        feedingType: 'pumping',
        amount: 140,
        duration: 20,
      });

      const alerts = detectFeedingAlerts(
        [feeding(TODAY, 120, '01'), pumped],
        AGE_MONTHS,
      );

      expect(idsOf(alerts)).toContain('feeding-long-gap');
    });

    it('keeps pumped millilitres out of the daily intake baseline', () => {
      const pumpedYesterday = ['02', '06', '10', '14'].map((hour) =>
        makeLog('feeding', `${YESTERDAY}T${hour}:00:00+08:00`, {
          feedingType: 'pumping' as const,
          amount: 200,
        }),
      );

      const logs = [
        ...baselineWeek(800),
        feeding(YESTERDAY, 300),
        ...pumpedYesterday,
      ];

      // 昨天真正餵進去的是 300ml，只有基準的 37.5%。加上擠出來的 800ml
      // 會變成 1100ml，警示就消失了——而那正是這則警示要說的事。
      expect(idsOf(detectFeedingAlerts(logs, AGE_MONTHS))).toContain(
        'feeding-low-amount',
      );
    });
  });

  describe('detectPoopAlerts', () => {
    it('warns after 48 hours without a poop', () => {
      const alerts = detectPoopAlerts([poop('2026-06-13', '08')]);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('poop-no-poop-48h');
      expect(alerts[0].severity).toBe('warning');
    });

    it('escalates past 72 hours', () => {
      const alerts = detectPoopAlerts([poop('2026-06-12', '08')]);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('poop-no-poop-72h');
      expect(alerts[0].severity).toBe('danger');
    });

    it('says nothing when there has never been a poop to measure from', () => {
      expect(detectPoopAlerts([feeding(TODAY, 120)])).toEqual([]);
    });
  });

  describe('getActiveAlerts', () => {
    it('puts danger before warning', () => {
      const logs = [
        poop('2026-06-12', '08'),
        sleep(YESTERDAY, 360),
        feeding(TODAY, 120, '08'),
      ];

      expect(idsOf(getActiveAlerts(logs, AGE_MONTHS))).toEqual([
        'poop-no-poop-72h',
        'sleep-below-recommended',
      ]);
    });

    it('returns nothing on a well-recorded, unremarkable day', () => {
      const logs = [
        sleep(YESTERDAY, 780),
        poop(YESTERDAY),
        poop(TODAY, '07'),
        feeding(TODAY, 120, '08'),
      ];

      expect(getActiveAlerts(logs, AGE_MONTHS)).toEqual([]);
    });
  });
});
