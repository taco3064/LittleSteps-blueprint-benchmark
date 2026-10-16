import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  toLocalDateKey,
  isSameDay,
  calculateDuration,
  formatDate,
  formatTime,
  formatDuration,
  getCurrentDateTimeLocal,
  dateTimeLocalToISO,
  isoToDateTimeLocal,
  parseLocalDate,
} from './index';

/**
 * Builds an instant from *local* calendar fields (month is 1-based).
 *
 * `getCurrentDateTimeLocal`, `dateTimeLocalToISO` and `formatTime` all operate on
 * the local wall clock, so fixtures are pinned by local fields instead of a UTC
 * literal. That keeps every expectation exact no matter which timezone the test
 * runner sits in.
 */
const localDate = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  ms = 0,
): Date => new Date(year, month - 1, day, hours, minutes, seconds, ms);

// Captured before any test installs fake timers, so these are real Date values.
const JUN_15_0805 = localDate(2026, 6, 15, 8, 5);
const JUN_16_0805 = localDate(2026, 6, 16, 8, 5);

describe('calendar', () => {
  describe('toLocalDateKey', () => {
    it('凌晨 03:00 與下午 14:00 的紀錄要落在同一個本地日期', () => {
      // 這就是線上的實際症狀：舊寫法 toISOString() 取的是 UTC 日期，台灣是
      // UTC+8，凌晨 0 到 8 點的餵奶／換尿布／睡眠紀錄會被歸到「前一天」。
      const smallHours = '2026-06-15T03:00:00+08:00'; // === 2026-06-14T19:00Z
      const afternoon = '2026-06-15T14:00:00+08:00'; // === 2026-06-15T06:00Z

      expect(toLocalDateKey(smallHours)).toBe('2026-06-15');
      expect(toLocalDateKey(afternoon)).toBe('2026-06-15');
      expect(toLocalDateKey(smallHours)).toBe(toLocalDateKey(afternoon));

      // 這行把舊行為釘住：同一個瞬間的 UTC 日期真的是前一天，證明這組 fixture
      // 確實踩在會出錯的區間，而不是剛好兩種寫法都給出同一天。
      expect(new Date(smallHours).toISOString().split('T')[0]).toBe('2026-06-14');
    });
  });

  describe('isSameDay', () => {
    it('should return true for two times within the same local calendar day', () => {
      expect(isSameDay('2026-06-15T00:00:00+08:00', '2026-06-15T23:59:59+08:00')).toBe(
        true,
      );
    });

    it('should return false for times on adjacent local calendar days', () => {
      expect(isSameDay('2026-06-15T23:59:59+08:00', '2026-06-16T00:00:00+08:00')).toBe(
        false,
      );
    });

    it(
      'compares local calendar days, so crossing UTC'
      + ' midnight is still the same day here',
      () => {
        // 台灣 UTC+8：這兩個瞬間是同一天的 07:30 與 08:30。若照 UTC 比較會誤判成
        // 不同天，半夜的餵奶與睡眠紀錄就會被歸到前一天。
        const beforeUtcMidnight = new Date(Date.UTC(2026, 5, 15, 23, 30));
        const afterUtcMidnight = new Date(Date.UTC(2026, 5, 16, 0, 30));

        expect(isSameDay(beforeUtcMidnight, afterUtcMidnight)).toBe(true);
      },
    );

    it('should accept Date and string inputs interchangeably', () => {
      // 以台灣本地時間書寫：同一天的 10:00 與 20:00。若寫成 20:00Z，那其實是
      // 隔天凌晨 04:00，會（正確地）被判成不同天，測不到互通性。
      const date = new Date('2026-06-15T10:00:00+08:00');

      expect(isSameDay(date, '2026-06-15T20:00:00+08:00')).toBe(true);
      expect(isSameDay('2026-06-15T20:00:00+08:00', date)).toBe(true);
      expect(isSameDay(date, new Date('2026-06-15T02:00:00+08:00'))).toBe(true);
      expect(isSameDay(date, new Date('2026-06-14T10:00:00+08:00'))).toBe(false);
    });

    it('should treat offset notation of the same instant as the same day', () => {
      // 2026-06-15T08:00+08:00 === 2026-06-15T00:00Z
      expect(isSameDay('2026-06-15T08:00:00+08:00', '2026-06-15T00:00:00.000Z')).toBe(
        true,
      );
    });

    it('should return true for the identical instant and false exactly 24h apart', () => {
      const instant = '2026-06-15T12:00:00.000Z';

      expect(isSameDay(instant, instant)).toBe(true);
      expect(isSameDay(instant, '2026-06-16T12:00:00.000Z')).toBe(false);
    });

    it('should throw for an unparseable date', () => {
      expect(() => isSameDay('not-a-date', '2026-06-15T00:00:00.000Z')).toThrow(
        RangeError,
      );
    });
  });

  describe('calculateDuration', () => {
    it('should return the number of whole minutes between two instants', () => {
      expect(
        calculateDuration('2026-06-15T08:00:00.000Z', '2026-06-15T09:30:00.000Z'),
      ).toBe(90);
    });

    it('should floor partial minutes', () => {
      // 119 seconds => 1.98 minutes => 1
      expect(
        calculateDuration('2026-06-15T08:00:00.000Z', '2026-06-15T08:01:59.000Z'),
      ).toBe(1);

      // 59 seconds => 0.98 minutes => 0
      expect(
        calculateDuration('2026-06-15T08:00:00.000Z', '2026-06-15T08:00:59.999Z'),
      ).toBe(0);
    });

    it('should return 0 for identical timestamps', () => {
      expect(
        calculateDuration('2026-06-15T08:00:00.000Z', '2026-06-15T08:00:00.000Z'),
      ).toBe(0);
    });

    it('should floor towards negative infinity when end precedes start', () => {
      expect(
        calculateDuration('2026-06-15T08:30:00.000Z', '2026-06-15T08:00:00.000Z'),
      ).toBe(-30);

      // -90 seconds => -1.5 minutes => floored to -2 (not truncated to -1)
      expect(
        calculateDuration('2026-06-15T08:01:30.000Z', '2026-06-15T08:00:00.000Z'),
      ).toBe(-2);
    });

    it('should span day boundaries', () => {
      // 22:00 -> 06:30 next day = 8h30m
      expect(
        calculateDuration('2026-06-15T22:00:00.000Z', '2026-06-16T06:30:00.000Z'),
      ).toBe(510);
    });

    it('should compare instants rather than wall-clock text', () => {
      // 17:00+08:00 === 09:00Z, one hour after 08:00Z
      expect(
        calculateDuration('2026-06-15T08:00:00.000Z', '2026-06-15T17:00:00+08:00'),
      ).toBe(60);
    });

    it('should return NaN when an input is unparseable', () => {
      expect(calculateDuration('not-a-date', '2026-06-15T08:00:00.000Z')).toBeNaN();
      expect(calculateDuration('2026-06-15T08:00:00.000Z', 'not-a-date')).toBeNaN();
    });
  });

  describe('formatDate', () => {
    it('以家長讀得懂的中文長格式顯示日期', () => {
      expect(formatDate('2026-06-15')).toBe('2026年6月15日');
    });

    it('YYYY-MM-DD 以本地時區解析，在 UTC 以西的時區也不會少一天', () => {
      // new Date('2026-06-15') 是「UTC 午夜」，在 UTC 以西的時區會退回 6/14。
      // 測試套件把 TZ 釘在 Asia/Taipei（UTC+8），剛好蓋不到這個方向的錯誤，
      // 所以這裡臨時搬到紐約才測得出來。生日與完成日期差一天是真的 bug。
      vi.stubEnv('TZ', 'America/New_York');

      try {
        expect(formatDate('2026-06-15')).toBe('2026年6月15日');
        expect(formatDate('2026-01-01')).toBe('2026年1月1日');
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it('帶時間的 ISO 字串換算成本地日期再顯示', () => {
      // 台灣是 UTC+8：這個瞬間的本地時間已經是隔天早上 07:00。
      expect(formatDate('2026-06-15T23:00:00.000Z')).toBe('2026年6月16日');
    });

    it('Date 物件與同一天的日期字串顯示一致', () => {
      expect(formatDate(localDate(2026, 6, 15))).toBe(formatDate('2026-06-15'));
    });

    it('沒有日期時留白，不把 Invalid Date 印到畫面上', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate('not-a-date')).toBe('');
    });
  });

  describe('formatTime', () => {
    it('should render a zero-padded 24-hour HH:mm shape', () => {
      // Locale output is environment dependent, so only the shape is asserted.
      expect(formatTime(JUN_15_0805.toISOString())).toMatch(/^\d{2}:\d{2}$/);

      expect(formatTime(localDate(2026, 6, 15, 21, 45).toISOString())).toMatch(
        /^\d{2}:\d{2}$/,
      );
    });

    it('should render the local wall-clock hour and minute', () => {
      expect(formatTime(JUN_15_0805.toISOString()).match(/\d+/g)).toEqual(['08', '05']);

      expect(
        formatTime(localDate(2026, 6, 15, 21, 45).toISOString()).match(/\d+/g),
      ).toEqual(['21', '45']);
    });

    it('should ignore seconds and milliseconds', () => {
      const onTheMinute = localDate(2026, 6, 15, 8, 5, 0, 0).toISOString();
      const nearlyNextMinute = localDate(2026, 6, 15, 8, 5, 59, 999).toISOString();

      expect(formatTime(nearlyNextMinute)).toBe(formatTime(onTheMinute));
    });

    it('should render the same wall-clock time for instants exactly 24h apart', () => {
      expect(formatTime(JUN_16_0805.toISOString())).toBe(
        formatTime(JUN_15_0805.toISOString()),
      );
    });

    it('should change when the instant advances by one minute', () => {
      const oneMinuteLater = localDate(2026, 6, 15, 8, 6).toISOString();

      expect(formatTime(oneMinuteLater)).not.toBe(
        formatTime(JUN_15_0805.toISOString()),
      );
    });
  });

  describe('formatDuration', () => {
    it('should render minutes only when under an hour', () => {
      expect(formatDuration(0)).toBe('0分鐘');
      expect(formatDuration(1)).toBe('1分鐘');
      expect(formatDuration(45)).toBe('45分鐘');
      expect(formatDuration(59)).toBe('59分鐘');
    });

    it('should render hours only when minutes divide evenly', () => {
      expect(formatDuration(60)).toBe('1小時');
      expect(formatDuration(120)).toBe('2小時');
      expect(formatDuration(1440)).toBe('24小時');
    });

    it('should render hours and minutes when both are non-zero', () => {
      expect(formatDuration(61)).toBe('1小時1分鐘');
      expect(formatDuration(90)).toBe('1小時30分鐘');
      expect(formatDuration(185)).toBe('3小時5分鐘');
    });
  });

  describe('getCurrentDateTimeLocal', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should render the mocked local now as YYYY-MM-DDTHH:mm', () => {
      vi.setSystemTime(JUN_15_0805);

      expect(getCurrentDateTimeLocal()).toBe('2026-06-15T08:05');
    });

    it('should zero-pad single-digit month, day, hour and minute', () => {
      vi.setSystemTime(localDate(2026, 1, 3, 7, 9));

      expect(getCurrentDateTimeLocal()).toBe('2026-01-03T07:09');
    });

    it(
      'should render two-digit month, day and 24-hou'
      + 'r time without padding artefacts',
      () => {
        vi.setSystemTime(localDate(2026, 11, 25, 23, 59));

        expect(getCurrentDateTimeLocal()).toBe('2026-11-25T23:59');
      },
    );

    it('should drop seconds and milliseconds from now', () => {
      vi.setSystemTime(localDate(2026, 6, 15, 8, 5, 59, 999));

      expect(getCurrentDateTimeLocal()).toBe('2026-06-15T08:05');
    });

    it('should always match the datetime-local input format', () => {
      vi.setSystemTime(localDate(2026, 12, 31, 0, 0));

      expect(getCurrentDateTimeLocal()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
      expect(getCurrentDateTimeLocal()).toBe('2026-12-31T00:00');
    });
  });

  describe('isoToDateTimeLocal', () => {
    it('should round-trip with dateTimeLocalToISO, which is the whole point', () => {
      // The edit form reads with one and writes with the other. If they are not
      // inverses, a parent who changes nothing still moves the record.
      const local = '2026-06-15T08:05';

      expect(isoToDateTimeLocal(dateTimeLocalToISO(local))).toBe(local);
    });

    it('should show the local wall time, not the UTC clock reading', () => {
      // The regression this exists for: the form used iso.slice(0, 16), which
      // is UTC. In Asia/Taipei a 21:00 feed opened as 13:00, and saving it
      // unchanged wrote the record back eight hours early.
      expect(isoToDateTimeLocal(JUN_15_0805.toISOString())).toBe('2026-06-15T08:05');
    });

    it('should drop the seconds a datetime-local input cannot hold', () => {
      expect(isoToDateTimeLocal(localDate(2026, 6, 15, 8, 5, 30).toISOString())).toBe(
        '2026-06-15T08:05',
      );
    });

    it('should pad every field to the width the input format requires', () => {
      expect(isoToDateTimeLocal(localDate(2026, 1, 3, 7, 9, 0).toISOString())).toBe(
        '2026-01-03T07:09',
      );
    });

    it('should throw rather than emit NaN-NaN-NaN into a form', () => {
      expect(() => isoToDateTimeLocal('not a date')).toThrow(RangeError);
    });
  });

  describe('dateTimeLocalToISO', () => {
    it('should interpret the input as local wall time and return the UTC instant', () => {
      expect(dateTimeLocalToISO('2026-06-15T08:05')).toBe(JUN_15_0805.toISOString());
    });

    it('should return a full ISO-8601 UTC string', () => {
      expect(dateTimeLocalToISO('2026-06-15T08:05')).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should zero the seconds and milliseconds not present in the input', () => {
      expect(dateTimeLocalToISO('2026-06-15T08:05')).toMatch(/:00\.000Z$/);
      expect(dateTimeLocalToISO('2026-01-03T07:09')).toMatch(/:00\.000Z$/);
    });

    it('should preserve seconds when the input includes them', () => {
      expect(dateTimeLocalToISO('2026-06-15T08:05:30')).toBe(
        localDate(2026, 6, 15, 8, 5, 30).toISOString(),
      );
    });

    it('should throw for an unparseable datetime-local value', () => {
      expect(() => dateTimeLocalToISO('not-a-date')).toThrow(RangeError);
      expect(() => dateTimeLocalToISO('')).toThrow(RangeError);
    });

    describe('round trip with getCurrentDateTimeLocal', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should round-trip the current minute back to the same instant', () => {
        vi.setSystemTime(JUN_15_0805);

        const iso = dateTimeLocalToISO(getCurrentDateTimeLocal());

        expect(iso).toBe(JUN_15_0805.toISOString());
        expect(new Date(iso).getTime()).toBe(JUN_15_0805.getTime());
      });

      it('should round-trip back to the same datetime-local string', () => {
        const now = localDate(2026, 11, 25, 23, 59);

        vi.setSystemTime(now);

        const dateTimeLocal = getCurrentDateTimeLocal();
        const iso = dateTimeLocalToISO(dateTimeLocal);

        // ISO -> local fields must reproduce the original input verbatim.
        vi.setSystemTime(new Date(iso));
        expect(getCurrentDateTimeLocal()).toBe(dateTimeLocal);
      });
    });
  });

  describe('parseLocalDate', () => {
    /**
     * 這個函式原本被抄成三份私有版本（prenatalSchedule、careSchedule、
     * icsExport），三份都是 iso.split('-').map(Number)。那個寫法對純日期
     * 字串是對的，但遇到完整 ISO 時間戳會算出 Invalid Date，也認不得
     * 單位數月份。這幾條就是釘住「為什麼只留一份實作」。
     */
    it('純日期字串以本地正午為基準，不會因為時區偏移跳一天', () => {
      const date = parseLocalDate('2026-06-15');

      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(12);
    });

    it('完整 ISO 時間戳也解得開——抄過去的 split 版本在這裡是 Invalid Date', () => {
      const date = parseLocalDate('2026-06-15T02:00:00.000Z');

      expect(Number.isNaN(date.getTime())).toBe(false);
    });

    it('認得單位數的月和日', () => {
      const date = parseLocalDate('2026-6-5');

      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(5);
    });

    it('和 toLocalDateKey 來回轉換不會漂移', () => {
      expect(toLocalDateKey(parseLocalDate('2026-06-15'))).toBe('2026-06-15');
      expect(toLocalDateKey(parseLocalDate('2026-1-1'))).toBe('2026-01-01');
    });
  });
});
