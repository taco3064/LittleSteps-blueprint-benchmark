import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { DailyLog, DiaperData, FeedingData, SleepData } from '../records';
import {
  sortLogsByTime,
  filterLogsByDate,
  getTodayLogs,
  getRecentLogs,
  calculateSleepDuration,
  calculateDailySummary,
  formatTime,
  formatDate,
  formatDuration,
  getFeedingTypeLabel,
  getFeedingSideLabel,
  getDiaperTypeLabel,
  getConsistencyLabel,
  FEEDING_TYPES,
  FEEDING_SIDES,
  DIAPER_TYPES,
  CONSISTENCIES,
  findLastLog,
  STALE_OPEN_SLEEP_MINUTES,
  findOpenSleep,
  isOpenSleep,
  isStaleOpenSleep,
  openSleepElapsedMinutes,
  composeLogLabel,
} from './logHelpers';

/** Frozen "now" used by every clock-dependent assertion. */
const NOW = '2026-06-15T08:00:00.000Z';
const MINUTE = 60 * 1000;
const DAY_MINUTES = 24 * 60;

/** ISO timestamp offset from NOW by `minutes` (negative = in the past). */
const at = (minutes: number): string =>
  new Date(Date.parse(NOW) + minutes * MINUTE).toISOString();

const makeLog = (
  id: string,
  type: DailyLog['type'],
  timestamp: string,
  data: DailyLog['data'],
): DailyLog => ({
  id,
  childId: 'child-1',
  type,
  timestamp,
  data,
  createdAt: timestamp,
});

const feedingLog = (
  id: string,
  timestamp: string,
  data: Partial<FeedingData> = {},
): DailyLog =>
  makeLog(id, 'feeding', timestamp, {
    feedingType: 'formula',
    ...data,
  } as FeedingData);

const sleepLog = (
  id: string,
  timestamp: string,
  data: Partial<SleepData> = {},
): DailyLog =>
  makeLog(id, 'sleep', timestamp, { startTime: timestamp, ...data } as SleepData);

const diaperLog = (
  id: string,
  timestamp: string,
  type: DiaperData['type'],
  consistency?: DiaperData['consistency'],
): DailyLog => makeLog(id, 'diaper', timestamp, { type, consistency } as DiaperData);

describe('logHelpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sortLogsByTime', () => {
    it('orders logs newest first', () => {
      const logs = [
        feedingLog('a', '2026-06-15T03:00:00.000Z'),
        feedingLog('b', '2026-06-15T09:00:00.000Z'),
        feedingLog('c', '2026-06-15T06:00:00.000Z'),
      ];

      expect(sortLogsByTime(logs).map((l) => l.id)).toEqual(['b', 'c', 'a']);
    });

    it('returns a new array and leaves the input untouched', () => {
      const logs = [
        feedingLog('old', '2026-06-14T00:00:00.000Z'),
        feedingLog('new', '2026-06-15T00:00:00.000Z'),
      ];

      const sorted = sortLogsByTime(logs);

      expect(sorted).not.toBe(logs);
      expect(logs.map((l) => l.id)).toEqual(['old', 'new']);
      expect(sorted.map((l) => l.id)).toEqual(['new', 'old']);
    });

    it('keeps the original relative order of identical timestamps', () => {
      const sameMoment = '2026-06-15T05:00:00.000Z';

      const logs = [
        feedingLog('first', sameMoment),
        feedingLog('second', sameMoment),
        feedingLog('third', sameMoment),
      ];

      expect(sortLogsByTime(logs).map((l) => l.id)).toEqual([
        'first',
        'second',
        'third',
      ]);
    });

    it('handles an empty list', () => {
      expect(sortLogsByTime([])).toEqual([]);
    });
  });

  describe('filterLogsByDate', () => {
    it('keeps only logs whose timestamp falls on the requested date', () => {
      // 時間戳一律以台灣本地時間書寫（+08:00），因為分桶依的是本地日曆日。
      const logs = [
        feedingLog('yesterday', '2026-06-14T23:00:00.000+08:00'),
        feedingLog('target-early', '2026-06-15T00:00:00.000+08:00'),
        feedingLog('target-late', '2026-06-15T22:15:00.000+08:00'),
        feedingLog('tomorrow', '2026-06-16T01:00:00.000+08:00'),
      ];

      expect(filterLogsByDate(logs, '2026-06-15').map((l) => l.id)).toEqual([
        'target-early',
        'target-late',
      ]);
    });

    it(
      'buckets by local calendar day, so the day boundary is exactly '
      + '00:00+08:00',
      () => {
        // 這兩個瞬間只差 1 毫秒，卻分屬不同的本地日期。兩者的 UTC 日期都是
        // 06-15（15:59:59.999Z 與 16:00:00.000Z），所以舊的 UTC 分桶會把它們
        // 併成同一天——這正是本測試要擋住的迴歸。
        const logs = [
          feedingLog('last-ms-of-day', '2026-06-15T23:59:59.999+08:00'),
          feedingLog('first-ms-of-next-day', '2026-06-16T00:00:00.000+08:00'),
        ];

        expect(filterLogsByDate(logs, '2026-06-15').map((l) => l.id)).toEqual([
          'last-ms-of-day',
        ]);

        expect(filterLogsByDate(logs, '2026-06-16').map((l) => l.id)).toEqual([
          'first-ms-of-next-day',
        ]);
      },
    );

    it('returns an empty list when no log matches', () => {
      const logs = [feedingLog('a', '2026-06-15T10:00:00.000Z')];

      expect(filterLogsByDate(logs, '2026-01-01')).toEqual([]);
    });
  });

  describe('getTodayLogs', () => {
    it('returns only logs from the current local calendar day', () => {
      // 凍結的 NOW 是 2026-06-15T08:00Z，在台灣是 06-15 16:00，
      // 所以「今天」是本地 06-15 00:00 起、06-16 00:00 止（不含）。
      const logs = [
        feedingLog('today', at(-60)),
        feedingLog('two-days-ago', at(-2 * DAY_MINUTES)),
        sleepLog('also-today', at(-30)),
        // 邊界：本地日的最後一毫秒與次日的第一毫秒。
        feedingLog('last-ms-of-today', '2026-06-15T23:59:59.999+08:00'),
        feedingLog('first-ms-of-tomorrow', '2026-06-16T00:00:00.000+08:00'),
        // 半夜餵奶：UTC 日期是 06-14，但對台灣使用者就是今天。
        feedingLog('small-hours-of-today', '2026-06-15T03:00:00.000+08:00'),
      ];

      expect(getTodayLogs(logs).map((l) => l.id)).toEqual([
        'today',
        'also-today',
        'last-ms-of-today',
        'small-hours-of-today',
      ]);
    });
  });

  describe('getRecentLogs', () => {
    it('keeps logs at or after the cutoff and drops older ones', () => {
      const logs = [
        feedingLog('now', at(0)),
        feedingLog('one-day-ago', at(-DAY_MINUTES)),
        feedingLog('exactly-on-cutoff', at(-7 * DAY_MINUTES)),
        feedingLog('one-minute-before-cutoff', at(-7 * DAY_MINUTES - 1)),
        feedingLog('a-month-ago', at(-30 * DAY_MINUTES)),
      ];

      expect(getRecentLogs(logs, 7).map((l) => l.id)).toEqual([
        'now',
        'one-day-ago',
        'exactly-on-cutoff',
      ]);
    });

    it('has no upper bound, so future logs are always kept', () => {
      const logs = [
        feedingLog('future', at(5 * DAY_MINUTES)),
        feedingLog('ancient', at(-90 * DAY_MINUTES)),
      ];

      expect(getRecentLogs(logs, 7).map((l) => l.id)).toEqual(['future']);
    });

    it('with days = 0 keeps only logs at or after the current instant', () => {
      const logs = [
        feedingLog('one-minute-ago', at(-1)),
        feedingLog('now', at(0)),
        feedingLog('in-one-minute', at(1)),
      ];

      expect(getRecentLogs(logs, 0).map((l) => l.id)).toEqual([
        'now',
        'in-one-minute',
      ]);
    });

    it('preserves the incoming order rather than sorting', () => {
      const logs = [
        feedingLog('older', at(-2 * DAY_MINUTES)),
        feedingLog('newer', at(-10)),
      ];

      expect(getRecentLogs(logs, 7).map((l) => l.id)).toEqual(['older', 'newer']);
    });
  });

  describe('calculateSleepDuration', () => {
    it('returns the elapsed minutes between startTime and endTime', () => {
      const duration = calculateSleepDuration({
        startTime: '2026-06-15T22:00:00.000Z',
        endTime: '2026-06-15T23:30:00.000Z',
      });

      expect(duration).toBe(90);
    });

    it('returns undefined while the baby is still sleeping (no endTime)', () => {
      expect(
        calculateSleepDuration({ startTime: '2026-06-15T22:00:00.000Z' }),
      ).toBeUndefined();
    });

    it('rounds partial minutes to the nearest whole minute', () => {
      // 100 seconds => 1.667 minutes => 2
      expect(
        calculateSleepDuration({
          startTime: '2026-06-15T22:00:00.000Z',
          endTime: '2026-06-15T22:01:40.000Z',
        }),
      ).toBe(2);
    });

    it('returns 0 (not undefined) for a zero-length session', () => {
      expect(
        calculateSleepDuration({
          startTime: '2026-06-15T22:00:00.000Z',
          endTime: '2026-06-15T22:00:00.000Z',
        }),
      ).toBe(0);
    });

    it('does not clamp an endTime that precedes startTime', () => {
      expect(
        calculateSleepDuration({
          startTime: '2026-06-15T22:00:00.000Z',
          endTime: '2026-06-15T21:30:00.000Z',
        }),
      ).toBe(-30);
    });
  });

  describe('calculateDailySummary', () => {
    it('aggregates feeding, sleep and diaper logs for the requested date', () => {
      const logs = [
        // Feeding: 3 logs on target date, 120 + (no amount) + 90 = 210ml
        feedingLog('f1', '2026-06-15T01:00:00.000Z', { amount: 120 }),
        feedingLog('f2', '2026-06-15T04:00:00.000Z', { feedingType: 'breast_left' }),
        feedingLog('f3', '2026-06-15T07:00:00.000Z', { amount: 90 }),
        // Sleep: explicit duration 45 + derived 90 + ongoing 0 = 135 minutes
        sleepLog('s1', '2026-06-15T02:00:00.000Z', { duration: 45 }),
        sleepLog('s2', '2026-06-15T05:00:00.000Z', {
          startTime: '2026-06-15T05:00:00.000Z',
          endTime: '2026-06-15T06:30:00.000Z',
        }),
        sleepLog('s3', '2026-06-15T09:00:00.000Z'),
        // Diaper: 3 logs => pee 2 (pee + both), poop 2 (poop + both)
        diaperLog('d1', '2026-06-15T03:00:00.000Z', 'pee'),
        diaperLog('d2', '2026-06-15T08:00:00.000Z', 'poop', 'soft'),
        diaperLog('d3', '2026-06-15T10:00:00.000Z', 'both'),
        // Different day => ignored entirely
        feedingLog('other-day', '2026-06-14T12:00:00.000Z', { amount: 500 }),
        diaperLog('other-day-diaper', '2026-06-16T00:30:00.000Z', 'both'),
      ];

      expect(calculateDailySummary(logs, '2026-06-15')).toEqual({
        date: '2026-06-15',
        feedingCount: 3,
        totalFeedingAmount: 210,
        sleepCount: 3,
        totalSleepDuration: 135,
        diaperCount: 3,
        poopCount: 2,
        peeCount: 2,
      });
    });

    it('derives the sleep duration when the stored duration is 0', () => {
      const logs = [
        sleepLog('s1', '2026-06-15T05:00:00.000Z', {
          duration: 0,
          startTime: '2026-06-15T05:00:00.000Z',
          endTime: '2026-06-15T05:30:00.000Z',
        }),
      ];

      const summary = calculateDailySummary(logs, '2026-06-15');

      expect(summary.sleepCount).toBe(1);
      expect(summary.totalSleepDuration).toBe(30);
    });

    it('counts an ongoing sleep session but adds no duration', () => {
      const logs = [sleepLog('s1', '2026-06-15T05:00:00.000Z')];

      const summary = calculateDailySummary(logs, '2026-06-15');

      expect(summary.sleepCount).toBe(1);
      expect(summary.totalSleepDuration).toBe(0);
    });

    it('returns an all-zero summary for a date with no logs', () => {
      expect(calculateDailySummary([], '2026-03-01')).toEqual({
        date: '2026-03-01',
        feedingCount: 0,
        totalFeedingAmount: 0,
        sleepCount: 0,
        totalSleepDuration: 0,
        diaperCount: 0,
        poopCount: 0,
        peeCount: 0,
      });
    });

    it('defaults to today\'s local calendar date when no date is given', () => {
      const logs = [
        feedingLog('today', at(-60), { amount: 150 }),
        feedingLog('last-week', at(-7 * DAY_MINUTES), { amount: 999 }),
        // 半夜 03:00 的餵奶：UTC 日期是 06-14，本地日期是 06-15。舊的 UTC
        // 預設值會把它漏掉，早上起來看到的當日總量就少一餐。
        feedingLog('small-hours', '2026-06-15T03:00:00.000+08:00', { amount: 90 }),
      ];

      const summary = calculateDailySummary(logs);

      expect(summary.date).toBe('2026-06-15');
      expect(summary.feedingCount).toBe(2);
      expect(summary.totalFeedingAmount).toBe(240);
    });

    /*
      An open sleep contributes no minutes, so a forgotten one used to sit in
      the count as a session that lasted zero. Every average built on top of it
      — the day view, the weekly report, the clinic summary — reads that as
      "the baby slept, badly" instead of "nobody pressed the button".
    */
    it('drops a sleep left open past the stale threshold from the day total', () => {
      const logs = [
        sleepLog('finished', '2026-06-15T02:00:00.000Z', {
          endTime: '2026-06-15T03:30:00.000Z',
          duration: 90,
        }),
        sleepLog('forgotten', at(-15 * 60)),
      ];

      const summary = calculateDailySummary(logs, '2026-06-15');

      expect(summary.sleepCount).toBe(1);
      expect(summary.totalSleepDuration).toBe(90);
    });

    it('still counts a sleep that is open but younger than the threshold', () => {
      const logs = [sleepLog('napping', at(-13 * 60))];

      expect(calculateDailySummary(logs, '2026-06-15').sleepCount).toBe(1);
    });
  });

  describe('findLastLog', () => {
    it('returns the newest log of that type, ignoring the others', () => {
      const logs = [
        feedingLog('older', at(-300), { amount: 90 }),
        feedingLog('newest', at(-60), { amount: 120 }),
        diaperLog('d1', at(-10), 'both', 'soft'),
      ];

      expect(findLastLog(logs, (log) => log.type === 'feeding')?.id).toBe('newest');
      expect(findLastLog(logs, (log) => log.type === 'diaper')?.id).toBe('d1');
    });

    /*
      A child with no history is the first-ever log. The form has to fall back
      to its plain defaults rather than showing an empty state or throwing.
    */
    it('returns null when the child has never logged that type', () => {
      expect(
        findLastLog(
          [diaperLog('d1', at(-10), 'pee')],
          (log) => log.type === 'feeding',
        ),
      ).toBeNull();

      expect(findLastLog([], (log) => log.type === 'sleep')).toBeNull();
    });
  });

  describe('pumping is output, not intake', () => {
    /*
      The acceptance boundary from the issue: an exclusively pumping mother
      logs six bottles and six pumping sessions. Counting the pumping as feeds
      doubles both the feed count and the intake, and that number is what gets
      shown to a paediatrician.
    */
    it('reports 6 feeds for a day of 6 bottles and 6 pumping sessions', () => {
      const logs = [
        ...Array.from({ length: 6 }, (_, i) =>
          feedingLog(`bottle-${i}`, `2026-06-15T0${i}:00:00.000Z`, {
            feedingType: 'breast_milk_bottle',
            amount: 100,
          }),
        ),
        ...Array.from({ length: 6 }, (_, i) =>
          feedingLog(`pump-${i}`, `2026-06-15T0${i}:30:00.000Z`, {
            feedingType: 'pumping',
            amount: 140,
            duration: 20,
          }),
        ),
      ];

      const summary = calculateDailySummary(logs, '2026-06-15');

      expect(summary.feedingCount).toBe(6);
      expect(summary.totalFeedingAmount).toBe(600);
    });

    it('labels bottled breast milk apart from formula and from pumping', () => {
      expect(getFeedingTypeLabel('breast_milk_bottle')).not.toBe(
        getFeedingTypeLabel('formula'),
      );

      expect(getFeedingTypeLabel('pumping')).toBe('擠奶');
    });
  });

  describe('open sleep sessions', () => {
    it('treats a missing endTime as still sleeping', () => {
      expect(isOpenSleep(sleepLog('s1', at(-30)))).toBe(true);

      expect(
        isOpenSleep(sleepLog('s2', at(-120), { endTime: at(-30), duration: 90 })),
      ).toBe(false);

      expect(isOpenSleep(feedingLog('f1', at(-30)))).toBe(false);
    });

    it('counts elapsed minutes from the start, never negative', () => {
      expect(openSleepElapsedMinutes({ startTime: at(-95) })).toBe(95);
      // 手動補記時把開始時間填在未來：算出負數會讓卡片印出「睡著了 -3 分鐘」。
      expect(openSleepElapsedMinutes({ startTime: at(3) })).toBe(0);
    });

    it('only calls a sleep stale once it passes the threshold', () => {
      expect(isStaleOpenSleep(sleepLog('s1', at(-STALE_OPEN_SLEEP_MINUTES)))).toBe(
        false,
      );

      expect(
        isStaleOpenSleep(sleepLog('s2', at(-STALE_OPEN_SLEEP_MINUTES - 1))),
      ).toBe(true);
    });

    it('finds the newest sleep still open, ignoring closed ones', () => {
      const logs = [
        sleepLog('closed', at(-300), { endTime: at(-240), duration: 60 }),
        sleepLog('older-open', at(-200)),
        sleepLog('newest-open', at(-40)),
        feedingLog('f1', at(-10)),
      ];

      expect(findOpenSleep(logs)?.id).toBe('newest-open');
      expect(findOpenSleep([])).toBeNull();
    });
  });

  describe('formatDuration', () => {
    it('renders sub-hour durations in minutes', () => {
      expect(formatDuration(0)).toBe('0分鐘');
      expect(formatDuration(30)).toBe('30分鐘');
      expect(formatDuration(59)).toBe('59分鐘');
    });

    it('renders whole hours without a decimal part', () => {
      expect(formatDuration(60)).toBe('1小時');
      expect(formatDuration(120)).toBe('2小時');
      expect(formatDuration(600)).toBe('10小時');
    });

    it('renders a partial hour as hours and minutes', () => {
      expect(formatDuration(90)).toBe('1小時30分鐘');
      expect(formatDuration(75)).toBe('1小時15分鐘');
      expect(formatDuration(65)).toBe('1小時5分鐘');
      expect(formatDuration(210)).toBe('3小時30分鐘');
    });
  });

  describe('formatTime', () => {
    it('formats an instant as zero-padded 24-hour HH:MM', () => {
      expect(formatTime('2026-06-15T12:34:00.000Z')).toMatch(/^\d{2}:\d{2}$/);
      expect(formatTime('2026-06-15T00:05:00.000Z')).toMatch(/^\d{2}:\d{2}$/);
    });

    it('is stable for the same instant and differs for different instants', () => {
      const instant = '2026-06-15T12:34:00.000Z';

      expect(formatTime(instant)).toBe(formatTime(instant));
      expect(formatTime(instant)).not.toBe(formatTime('2026-06-15T13:34:00.000Z'));
    });
  });

  describe('formatDate', () => {
    it('formats an instant as a Chinese long-form date', () => {
      // Taipei is UTC+8, so the 12:00Z instant is still the 15th locally.
      expect(formatDate('2026-06-15T12:00:00.000Z')).toBe('2026年6月15日');
    });

    it('produces different output for instants a day apart', () => {
      expect(formatDate('2026-06-15T12:00:00.000Z')).not.toBe(
        formatDate('2026-06-16T12:00:00.000Z'),
      );
    });
  });

  describe('getFeedingTypeLabel', () => {
    it('maps every feeding type to its Chinese label', () => {
      expect(getFeedingTypeLabel('breast_left')).toBe('母乳（左）');
      expect(getFeedingTypeLabel('breast_right')).toBe('母乳（右）');
      expect(getFeedingTypeLabel('breast_both')).toBe('母乳（兩邊）');
      expect(getFeedingTypeLabel('formula')).toBe('配方奶');
      expect(getFeedingTypeLabel('solid')).toBe('副食品');
    });

    it('has no fallback for an unknown type', () => {
      expect(
        getFeedingTypeLabel('bottle' as FeedingData['feedingType']),
      ).toBeUndefined();
    });
  });

  describe('getDiaperTypeLabel', () => {
    it('maps every diaper type to its Chinese label', () => {
      expect(getDiaperTypeLabel('pee')).toBe('小便');
      expect(getDiaperTypeLabel('poop')).toBe('大便');
      expect(getDiaperTypeLabel('both')).toBe('大小便');
    });

    it('has no fallback for an unknown type', () => {
      expect(getDiaperTypeLabel('dry' as DiaperData['type'])).toBeUndefined();
    });
  });

  describe('getFeedingSideLabel', () => {
    it('maps every side to its Chinese label', () => {
      expect(getFeedingSideLabel('left')).toBe('左側');
      expect(getFeedingSideLabel('right')).toBe('右側');
      expect(getFeedingSideLabel('both')).toBe('兩側');
    });
  });

  describe('getConsistencyLabel', () => {
    it('maps every consistency to its Chinese label', () => {
      expect(getConsistencyLabel('normal')).toBe('正常');
      expect(getConsistencyLabel('soft')).toBe('稀');
      expect(getConsistencyLabel('hard')).toBe('硬');
    });

    it('returns an empty string when consistency is absent', () => {
      expect(getConsistencyLabel(undefined)).toBe('');
      expect(getConsistencyLabel()).toBe('');
    });
  });

  /*
    每一份清單就是表單上的一個選單，而且是從標籤表的 key 推出來的，所以「漏一
    個值」編不過。編得過的是另一件事：兩個選項寫成一樣的字，家長選完看不出自己
    選了哪一個。
  */
  describe('表單選單的清單', () => {
    const distinctLabels = (labels: readonly string[]) => {
      expect(labels.filter((text) => !text)).toEqual([]);
      expect(new Set(labels).size).toBe(labels.length);
    };

    it('餵奶類型', () => {
      distinctLabels(FEEDING_TYPES.map(getFeedingTypeLabel));
    });

    it('擠奶側別', () => {
      distinctLabels(FEEDING_SIDES.map(getFeedingSideLabel));
    });

    it('尿布類型', () => {
      distinctLabels(DIAPER_TYPES.map(getDiaperTypeLabel));
    });

    it('大便性狀', () => {
      distinctLabels(CONSISTENCIES.map(getConsistencyLabel));
    });
  });

  /*
    七種餵奶類型裡有四種的正確寫法自己就帶括號（母乳（瓶餵）……），所以「用括號
    把內容包起來」這種拼法對其中四種一定會拼出兩層括號。這裡對每一種都跑一次，
    而不是只挑會出事的那一個：下一個帶括號的類型加進來時，這個測試要先壞掉。
  */
  describe('composeLogLabel', () => {
    it('接得出「餵奶 · 配方奶 120 ml」', () => {
      expect(composeLogLabel('餵奶', '配方奶 120 ml')).toBe('餵奶 · 配方奶 120 ml');
    });

    it('任何一種餵奶類型都不會拼出巢狀括號', () => {
      for (const type of FEEDING_TYPES) {
        const label = composeLogLabel('餵奶', `${getFeedingTypeLabel(type)} 120 ml`);

        // 類型自己那一對留著（那是正確的寫法），外面不再包一層。
        expect(label.startsWith('餵奶 · ')).toBe(true);
        expect(label.endsWith('）')).toBe(false);
        const opens = (label.match(/（/g) ?? []).length;

        expect(opens).toBe((getFeedingTypeLabel(type).match(/（/g) ?? []).length);
      }
    });

    it('沒有內容時只留標題，不留一對空括號', () => {
      expect(composeLogLabel('擠奶', '')).toBe('擠奶');
    });
  });
});
