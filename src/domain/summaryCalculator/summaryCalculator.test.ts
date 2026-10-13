import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import type { MilestoneProgress, VaccineProgress, VaccineSchedule } from '../records';
import { milestones } from '../milestones';
import { vaccineSchedules } from '../vaccines';
import { addMonths } from '../dateHelpers';
import {
  calculateMilestoneSummary,
  calculateVaccineSummary,
  calculateAgeDisplay,
} from './summaryCalculator';

type DoseProgress = VaccineProgress[string]['doses'];

describe('summaryCalculator', () => {
  describe('calculateMilestoneSummary', () => {
    // Expectations are derived from the real milestone catalogue so the suite
    // survives the data set growing.
    const TOTAL = milestones.length;

    /** Marks the first `count` catalogue milestones as achieved, without dates. */
    const achieveFirst = (count: number): MilestoneProgress => {
      const progress: MilestoneProgress = {};

      for (const milestone of milestones.slice(0, count)) {
        progress[milestone.id] = { achieved: true };
      }

      return progress;
    };

    /**
     * First achieved-count in 1..TOTAL-1 whose exact percentage has a
     * fractional part matching `predicate`, together with that percentage.
     */
    const fractionalCase = (predicate: (fraction: number) => boolean) => {
      for (let count = 1; count < TOTAL; count++) {
        const exact = (count / TOTAL) * 100;

        if (predicate(exact - Math.floor(exact))) {
          return { count, exact };
        }
      }

      throw new Error('milestone catalogue cannot produce such a fractional rate');
    };

    it('exposes the size of the milestone catalogue', () => {
      expect(TOTAL).toBeGreaterThan(0);
      expect(calculateMilestoneSummary({}).totalMilestones).toBe(TOTAL);
    });

    it('returns a zeroed summary for empty progress', () => {
      expect(calculateMilestoneSummary({})).toEqual({
        totalMilestones: TOTAL,
        achievedCount: 0,
        achievementRate: 0,
        recentAchievements: [],
      });
    });

    it('counts only entries flagged as achieved', () => {
      const progress: MilestoneProgress = {
        [milestones[0].id]: { achieved: true },
        [milestones[1].id]: { achieved: false, achievedDate: '2026-01-01' },
        [milestones[2].id]: { achieved: true },
        [milestones[3].id]: { achieved: false },
      };

      const summary = calculateMilestoneSummary(progress);

      expect(summary.achievedCount).toBe(2);
      // A date on an un-achieved milestone must never leak into the highlights.
      expect(summary.recentAchievements).toEqual([]);
    });

    it('reports 100% once every catalogue milestone is achieved', () => {
      const summary = calculateMilestoneSummary(achieveFirst(TOTAL));

      expect(summary.achievedCount).toBe(TOTAL);
      expect(summary.achievementRate).toBe(100);
    });

    it('rounds the rate up when the exact percentage sits above the half point', () => {
      const { count, exact } = fractionalCase((fraction) => fraction > 0.5);

      expect(calculateMilestoneSummary(achieveFirst(count)).achievementRate).toBe(
        Math.floor(exact) + 1,
      );
    });

    it('rounds the rate down when the exact percentage sits below the half point', () => {
      const { count, exact } = fractionalCase(
        (fraction) => fraction > 0 && fraction < 0.5,
      );

      expect(calculateMilestoneSummary(achieveFirst(count)).achievementRate).toBe(
        Math.floor(exact),
      );
    });

    it('always yields an integer rate between 0 and 100', () => {
      for (const count of [0, 1, Math.floor(TOTAL / 2), TOTAL]) {
        const { achievementRate } = calculateMilestoneSummary(achieveFirst(count));

        expect(Number.isInteger(achievementRate)).toBe(true);
        expect(achievementRate).toBeGreaterThanOrEqual(0);
        expect(achievementRate).toBeLessThanOrEqual(100);
      }
    });

    it('lists the three most recent achievements, newest first', () => {
      const [a, b, c, d, e] = milestones;

      const progress: MilestoneProgress = {
        [a.id]: { achieved: true, achievedDate: '2026-01-05' },
        [b.id]: { achieved: true, achievedDate: '2026-03-20' },
        [c.id]: { achieved: true, achievedDate: '2026-02-11' },
        [d.id]: { achieved: true, achievedDate: '2026-05-01' },
        [e.id]: { achieved: true, achievedDate: '2026-04-17' },
      };

      const summary = calculateMilestoneSummary(progress);

      expect(summary.achievedCount).toBe(5);

      expect(summary.recentAchievements).toEqual([
        { id: d.id, title: d.title, achievedDate: '2026-05-01' },
        { id: e.id, title: e.title, achievedDate: '2026-04-17' },
        { id: b.id, title: b.title, achievedDate: '2026-03-20' },
      ]);
    });

    it('skips achieved milestones that have no date while still counting them', () => {
      const [a, b, c, d] = milestones;

      const progress: MilestoneProgress = {
        [a.id]: { achieved: true },
        [b.id]: { achieved: true, achievedDate: '2026-02-02' },
        [c.id]: { achieved: true },
        [d.id]: { achieved: true, achievedDate: '2026-02-09' },
      };

      const summary = calculateMilestoneSummary(progress);

      expect(summary.achievedCount).toBe(4);

      expect(summary.recentAchievements.map((entry) => entry.id)).toEqual([
        d.id,
        b.id,
      ]);
    });

    it('resolves titles from the catalogue', () => {
      const [first, second] = milestones;

      const progress: MilestoneProgress = {
        [first.id]: { achieved: true, achievedDate: '2026-02-01' },
        [second.id]: { achieved: true, achievedDate: '2026-03-01' },
      };

      const summary = calculateMilestoneSummary(progress);

      expect(first.title.length).toBeGreaterThan(0);

      expect(summary.recentAchievements).toEqual([
        { id: second.id, title: second.title, achievedDate: '2026-03-01' },
        { id: first.id, title: first.title, achievedDate: '2026-02-01' },
      ]);
    });

    it('ignores progress entries whose milestone no longer exists', () => {
      const progress: MilestoneProgress = {
        ...achieveFirst(TOTAL),
        'removed-milestone-1': { achieved: true, achievedDate: '2026-01-01' },
        'removed-milestone-2': { achieved: true },
      };

      const summary = calculateMilestoneSummary(progress);

      expect(summary.achievedCount).toBe(TOTAL);
      expect(summary.achievementRate).toBe(100);
    });

    it('never reports an achievement rate above 100 percent', () => {
      const progress: MilestoneProgress = { ...achieveFirst(TOTAL) };

      for (let i = 0; i < 10; i++) {
        progress[`ghost-${i}`] = { achieved: true };
      }

      expect(calculateMilestoneSummary(progress).achievementRate).toBe(100);
    });

    it('omits orphaned entries from recentAchievements', () => {
      const progress: MilestoneProgress = {
        // 日期刻意設為最新，確保未被過濾時一定會排進前三名。
        'removed-milestone-1': { achieved: true, achievedDate: '2099-01-01' },
        [milestones[0].id]: { achieved: true, achievedDate: '2026-01-01' },
      };

      const summary = calculateMilestoneSummary(progress);

      expect(summary.recentAchievements.map((a) => a.id)).toEqual([milestones[0].id]);
    });
  });

  describe('calculateVaccineSummary', () => {
    // 時程表的每一筆記錄就是「一劑」：`doses` 是整個系列的總劑數，同系列的每筆
    // 記錄都重複帶著同一個值（五合一四筆全寫 doses: 4），所以分母是記錄數，
    // 把 `doses` 加總會把 4 劑膨脹成 16 劑。
    const TOTAL_DOSES = vaccineSchedules.length;

    /**
     * 公費常規劑次。下一劑與「還沒記錄的公費劑次」都只認這些。
     *
     * 規則在這裡重寫一次而不是借用 isScheduledDose：借用的話，述詞改壞了測試
     * 會跟著改壞。公費也分「每個孩子都該打」與「只給名單上的孩子」——帶
     * eligibility 的那種是資訊，不是這個孩子欠的劑次。
     */
    const NATIONAL = vaccineSchedules.filter(
      (vaccine) => vaccine.funding === 'national' && !vaccine.eligibility,
    );

    /** 最早的公費劑次。 */
    const EARLIEST_NATIONAL = NATIONAL.reduce((earliest, vaccine) =>
      (vaccine.ageInMonths ?? 999) < (earliest.ageInMonths ?? 999)
        ? vaccine
        : earliest,
    );

    /**
     * 不指名任何一筆真實資料：時程表本身會增修（劑數調整、產品拆分），而這裡
     * 驗的是分子分母與「下一劑」的規則，不是某一版時程表剛好長什麼樣子。
     *
     * 要三個不同的 id：同一支疫苗的多劑共用一個 id，混進來會在進度物件裡互相
     * 覆蓋，「三筆記錄」就變成兩筆。
     */
    const [FIRST, SECOND, THIRD] = vaccineSchedules.filter(
      (vaccine, index) =>
        vaccineSchedules.findIndex((candidate) => candidate.id === vaccine.id)
        === index,
    );

    const byId = (id: string): VaccineSchedule => {
      const vaccine = vaccineSchedules.find((candidate) => candidate.id === id);

      if (!vaccine) {
        throw new Error(`vaccine schedule no longer contains ${id}`);
      }

      return vaccine;
    };

    /** 下一劑是從出生日推算的，所以每個呼叫都要給生日；分子分母與它無關。 */
    const BIRTHDAY = '2026-01-15';
    /** today 一律注入，否則測試會隨真實時鐘漂移。 */
    const at = (iso: string) => new Date(`${iso}T12:00:00`);

    /** 該筆記錄所代表的劑次，與接種頁寫入進度時使用的鍵一致。 */
    const doseOf = (vaccine: VaccineSchedule): number => vaccine.currentDose ?? 1;

    /**
     * 指定的每一筆記錄都完成接種的進度。
     *
     * 同 id 的多劑要合併而不是覆蓋：五合一四筆共用一個 id，逐筆覆蓋只會留下
     * 最後一劑，其餘三筆看起來就像沒打。
     */
    const administered = (vaccines: VaccineSchedule[]): VaccineProgress => {
      const progress: VaccineProgress = {};

      for (const vaccine of vaccines) {
        const doses = progress[vaccine.id]?.doses ?? {};

        doses[doseOf(vaccine)] = {
          administered: true,
          administeredDate: '2026-01-01',
        };

        progress[vaccine.id] = { doses };
      }

      return progress;
    };

    it('derives the denominator from the number of scheduled doses', () => {
      expect(TOTAL_DOSES).toBeGreaterThan(0);

      expect(calculateVaccineSummary({}, BIRTHDAY).totalDoses).toBe(
        vaccineSchedules.length,
      );
    });

    it('does not inflate the denominator with the series length of every record', () => {
      const summedSeriesLengths = vaccineSchedules.reduce(
        (sum, vaccine) => sum + vaccine.doses,
        0,
      );

      // 資料集真的含多劑疫苗，否則這個測試不具鑑別力。
      expect(summedSeriesLengths).toBeGreaterThan(vaccineSchedules.length);

      expect(calculateVaccineSummary({}, BIRTHDAY).totalDoses).not.toBe(
        summedSeriesLengths,
      );
    });

    it('reports nothing administered for empty progress', () => {
      const summary = calculateVaccineSummary({}, BIRTHDAY);

      expect(summary.totalDoses).toBe(TOTAL_DOSES);
      expect(summary.administeredCount).toBe(0);
      expect(summary.administrationRate).toBe(0);
    });

    it('aggregates administered doses across records and ignores pending ones', () => {
      const progress: VaccineProgress = {
        ...administered([FIRST, SECOND]),
        [THIRD.id]: { doses: { [doseOf(THIRD)]: { administered: false } } },
      };

      const summary = calculateVaccineSummary(progress, BIRTHDAY);

      expect(summary.administeredCount).toBe(2);
      expect(summary.totalDoses).toBe(TOTAL_DOSES);
      expect(summary.administrationRate).toBe(Math.round((2 / TOTAL_DOSES) * 100));
    });

    it('ignores dose numbers that belong to another record of the same series', () => {
      // 承載第 2 劑的那筆記錄不認第 1 劑：第 1 劑記在系列的前一筆。
      const secondDoseRecord = vaccineSchedules.find(
        (vaccine) => doseOf(vaccine) === 2,
      );

      expect(secondDoseRecord).toBeDefined();

      const strayDoses: DoseProgress = {
        1: { administered: true, administeredDate: '2026-02-02' },
      };

      const summary = calculateVaccineSummary(
        { [secondDoseRecord!.id]: { doses: strayDoses } },
        BIRTHDAY,
      );

      expect(summary.administeredCount).toBe(0);
      expect(summary.administrationRate).toBe(0);
    });

    it('ignores progress recorded against vaccines outside the schedule', () => {
      const progress: VaccineProgress = {
        'legacy-vaccine': {
          doses: {
            1: { administered: true, administeredDate: '2026-01-01' },
            2: { administered: true, administeredDate: '2026-02-01' },
          },
        },
      };

      const summary = calculateVaccineSummary(progress, BIRTHDAY);

      expect(summary.administeredCount).toBe(0);
      expect(summary.administrationRate).toBe(0);
    });

    it('reaches 100% with no next vaccine once every scheduled dose is done', () => {
      const summary = calculateVaccineSummary(
        administered(vaccineSchedules),
        BIRTHDAY,
      );

      expect(summary.administeredCount).toBe(TOTAL_DOSES);
      expect(summary.administrationRate).toBe(100);
      expect(summary.nextVaccine).toBeUndefined();
      expect(summary.remainingNationalDoses).toBe(0);
    });

    it('caps a record at one dose even when the whole series is logged under it', () => {
      const progress = administered(vaccineSchedules);
      const seriesUnderOneRecord: DoseProgress = {};

      for (let doseNumber = 1; doseNumber <= FIRST.doses + 2; doseNumber++) {
        seriesUnderOneRecord[doseNumber] = {
          administered: true,
          administeredDate: '2026-01-01',
        };
      }

      progress[FIRST.id] = { doses: seriesUnderOneRecord };

      const summary = calculateVaccineSummary(progress, BIRTHDAY);

      expect(summary.administeredCount).toBe(TOTAL_DOSES);
      expect(summary.administrationRate).toBe(100);
    });

    it('always yields an integer rate between 0 and 100', () => {
      for (let count = 0; count <= vaccineSchedules.length; count++) {
        const progress = administered(vaccineSchedules.slice(0, count));

        const { administrationRate } = calculateVaccineSummary(progress, BIRTHDAY);

        expect(Number.isInteger(administrationRate)).toBe(true);
        expect(administrationRate).toBeGreaterThanOrEqual(0);
        expect(administrationRate).toBeLessThanOrEqual(100);
      }
    });

    it('counts only publicly funded doses as remaining', () => {
      // 這個數字讓卡片分得清「還沒記完」與「都打完了」——兩種情況都沒有下一劑。
      expect(NATIONAL.length).toBeLessThan(TOTAL_DOSES);

      expect(calculateVaccineSummary({}, BIRTHDAY).remainingNationalDoses).toBe(
        NATIONAL.length,
      );

      expect(
        calculateVaccineSummary(administered(NATIONAL), BIRTHDAY)
          .remainingNationalDoses,
      ).toBe(0);
    });

    it('does not count a dose reserved for a named group as one the family owes', () => {
      // 公費、算得出日期，卻只給名單上的孩子。算進「還有幾劑公費疫苗沒記錄」
      // 等於對每一個健康寶寶的家長多報一劑；端成「下一劑」它還會永遠卡在那
      // 裡，因為不會去打的劑次永遠不會被記錄。
      const gated = vaccineSchedules.filter(
        (vaccine) => vaccine.funding === 'national' && vaccine.eligibility,
      );

      // 資料集真的有這種劑次，否則這個測試不具鑑別力。
      expect(gated.length).toBeGreaterThan(0);
      expect(gated.every((vaccine) => !NATIONAL.includes(vaccine))).toBe(true);

      // 六個月大：限定對象那一劑正好到期，而且沒有被記錄。
      const summary = calculateVaccineSummary(
        administered(NATIONAL),
        BIRTHDAY,
        at('2026-07-20'),
      );

      expect(summary.administeredCount).toBe(NATIONAL.length);
      expect(summary.remainingNationalDoses).toBe(0);
      expect(summary.nextVaccine).toBeUndefined();
    });

    it('advances past an optional dose once the first recorded dose is logged', () => {
      // 這是實際的壞法，比「排序上自費在前面」嚴重得多：家長一記下出生第一劑，
      // 卡片就永遠停在那一列健保有條件給付的產品，之後每一劑公費都跳不過去——
      // 因為家長不會去買的劑次永遠不會被記錄，「第一筆沒接種的」就永遠不動。
      const progress = administered([EARLIEST_NATIONAL]);
      const twoMonthsIn = at(addMonths(BIRTHDAY, 2));

      const { nextVaccine } = calculateVaccineSummary(
        progress,
        BIRTHDAY,
        twoMonthsIn,
      );

      // 要往前走，不是「不回答」：回傳 undefined 也會讓上面那個排除測試通過。
      expect(nextVaccine).toBeDefined();
      expect(nextVaccine!.id).not.toBe(EARLIEST_NATIONAL.id);
      expect(byId(nextVaccine!.id).funding).toBe('national');
    });

    it('never offers a dose from outside the public schedule as the next one', () => {
      // 公費都記完之後，不看 funding 的版本會把最早的自費或健保有條件給付
      // 劑次端出來當「下次接種」，用的還是和免費劑次一模一樣的字。
      const summary = calculateVaccineSummary(
        administered(NATIONAL),
        BIRTHDAY,
        at('2026-03-20'),
      );

      // 時程表上確實還有沒記錄的劑次，否則這個測試不具鑑別力。
      expect(summary.administeredCount).toBeLessThan(summary.totalDoses);
      expect(summary.nextVaccine).toBeUndefined();
      expect(summary.remainingNationalDoses).toBe(0);
    });

    it('skips a dose that is not publicly funded even when it comes first', () => {
      const paidEarly = vaccineSchedules.filter(
        (vaccine) =>
          vaccine.funding !== 'national' && (vaccine.ageInMonths ?? 999) <= 2,
      );

      // 自費劑次就是排在公費劑次前面的那些；沒有這種資料就驗不到東西。
      expect(paidEarly.length).toBeGreaterThan(0);

      const progress = administered(
        NATIONAL.filter((v) => (v.ageInMonths ?? 999) <= 2),
      );

      const { nextVaccine } = calculateVaccineSummary(
        progress,
        BIRTHDAY,
        at('2026-03-20'),
      );

      expect(nextVaccine).toBeDefined();
      expect(byId(nextVaccine!.id).funding).toBe('national');
      expect(byId(nextVaccine!.id).ageInMonths).toBeGreaterThan(2);
    });

    it('reports the dose number the pending record stands for, not dose 1', () => {
      const laterDose = NATIONAL.find((vaccine) => doseOf(vaccine) > 1);

      expect(laterDose).toBeDefined();

      const progress = administered(NATIONAL.filter((v) => v.id !== laterDose!.id));
      const dueDay = addMonths(BIRTHDAY, laterDose!.ageInMonths!);

      expect(
        calculateVaccineSummary(progress, BIRTHDAY, at(dueDay)).nextVaccine,
      ).toEqual({
        id: laterDose!.id,
        name: laterDose!.name,
        timing: laterDose!.timing,
        doseNumber: doseOf(laterDose!),
      });
    });

    it('offers the earliest publicly funded dose to a newborn', () => {
      const nextVaccine = calculateVaccineSummary(
        {},
        BIRTHDAY,
        at(BIRTHDAY),
      ).nextVaccine;

      expect(nextVaccine?.id).toBe(EARLIEST_NATIONAL.id);
      expect(nextVaccine?.doseNumber).toBe(doseOf(EARLIEST_NATIONAL));
    });

    it('treats a recorded-but-not-administered dose as still pending', () => {
      const progress: VaccineProgress = {
        [EARLIEST_NATIONAL.id]: {
          doses: { [doseOf(EARLIEST_NATIONAL)]: { administered: false } },
        },
      };

      expect(
        calculateVaccineSummary(progress, BIRTHDAY, at(BIRTHDAY)).nextVaccine,
      ).toMatchObject({ id: EARLIEST_NATIONAL.id });
    });

    it('offers no next dose once every remaining one is behind the child', () => {
      // 從來沒記錄過的學齡兒童：每一劑都遠超出可以補打的範圍，「下一劑」因此
      // 沒有答案——但那不等於「都打完了」，remainingNationalDoses 才說得清楚。
      const lastScheduled = Math.max(
        ...vaccineSchedules.map((vaccine) => vaccine.ageInMonths ?? 0),
      );

      expect(lastScheduled).toBeLessThan(12 * 7);

      const summary = calculateVaccineSummary({}, BIRTHDAY, at('2033-01-15'));

      expect(summary.nextVaccine).toBeUndefined();
      expect(summary.remainingNationalDoses).toBe(NATIONAL.length);
    });
  });

  describe('calculateAgeDisplay', () => {
    // The helper parses 'YYYY-MM-DD' birthdays as UTC but reads them back with
    // local getters, so the timezone is pinned to keep the calendar maths exact.
    const originalTz = process.env.TZ;

    beforeAll(() => {
      process.env.TZ = 'UTC';
    });

    afterAll(() => {
      if (originalTz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTz;
      }
    });

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-15T08:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows days only during the first month', () => {
      expect(calculateAgeDisplay('2026-06-01')).toBe('14天');
    });

    it('shows zero days on the day of birth', () => {
      expect(calculateAgeDisplay('2026-06-15')).toBe('0天');
    });

    it('reports an unborn baby for a future birthday', () => {
      expect(calculateAgeDisplay('2026-06-20')).toBe('尚未出生');
    });

    it('omits the day part on an exact month boundary', () => {
      expect(calculateAgeDisplay('2026-03-15')).toBe('3個月');
    });

    it('appends the leftover days below one year', () => {
      expect(calculateAgeDisplay('2026-03-10')).toBe('3個月又5天');
    });

    it(
      'borrows days from the previous month when the day of month is '
      + 'not reached',
      () => {
        // 15 - 20 = -5 days, so a month is given back and May's 31 days added.
        expect(calculateAgeDisplay('2026-03-20')).toBe('2個月又26天');
      },
    );

    it('keeps counting in months right up to the twelfth', () => {
      expect(calculateAgeDisplay('2025-07-15')).toBe('11個月');
      expect(calculateAgeDisplay('2025-06-20')).toBe('11個月又26天');
    });

    it('switches to years at 12 months and drops the day remainder', () => {
      expect(calculateAgeDisplay('2025-06-15')).toBe('1歲');
      expect(calculateAgeDisplay('2025-06-10')).toBe('1歲');
    });

    it('shows years and months for toddlers', () => {
      expect(calculateAgeDisplay('2025-01-15')).toBe('1歲5個月');
      expect(calculateAgeDisplay('2024-03-15')).toBe('2歲3個月');
    });

    it('follows the mocked clock rather than the real one', () => {
      const before = calculateAgeDisplay('2026-03-15');

      vi.setSystemTime(new Date('2026-07-15T08:00:00Z'));

      expect(before).toBe('3個月');
      expect(calculateAgeDisplay('2026-03-15')).toBe('4個月');
    });
  });
});
