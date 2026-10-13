import { describe, it, expect } from 'vitest';
import type { VaccineProgress, VaccineSchedule } from '../records';
import { toLocalDateKey } from '../dateHelpers';
import { vaccineSchedules } from '../vaccines';
import {
  DUE_WINDOW_DAYS,
  OVERDUE_LOOKBACK_DAYS,
  actionableVaccineDoses,
  nextScheduledDose,
  resolveVaccineDoses,
} from './vaccineSchedule';

/**
 * 22 of 32 doses fall inside LittleSteps' own 0-12 month window, and before this
 * existed the page only filtered by month band — the parent had to know their
 * baby's age and go looking. LittleExplorer, holding 8 linked doses, already
 * computed due dates from the birthday. These tests pin the engine that closes
 * that gap.
 */

const BIRTHDAY = '2026-01-15';
const at = (iso: string) => new Date(`${iso}T12:00:00`);

const vaccine = (over: Partial<VaccineSchedule> = {}): VaccineSchedule =>
  ({
    id: 'v1',
    name: '測試疫苗 第1劑',
    timing: '出生滿 2 個月',
    funding: 'national',
    sourceUrl: 'https://www.cdc.gov.tw/Category/Page/TxRW-x3WzvPhvEtxM628GA',
    ageInMonths: 2,
    ageLabel: '2個月',
    doses: 1,
    currentDose: 1,
    sideEffects: [],
    ...over,
  }) as VaccineSchedule;

describe('resolveVaccineDoses', () => {
  it('到期日就是出生日加月齡', () => {
    const [dose] = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine()],
      progress: {},
      today: at('2026-01-20'),
    });

    expect(dose.dueDate).toBe('2026-03-15');
  });

  it('還沒到就是 upcoming，到了就是 due', () => {
    const before = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine()],
      progress: {},
      today: at('2026-03-14'),
    });

    const onDay = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine()],
      progress: {},
      today: at('2026-03-15'),
    });

    expect(before[0].status).toBe('upcoming');
    expect(onDay[0].status).toBe('due');
  });

  it('寬容期內仍算 due，過了才 overdue', () => {
    // 診所要預約、孩子當天可能感冒。抓太緊會把正常的一兩週延後畫成逾期，
    // 而一片紅字的下一步就是家長學會忽略它。
    const lastDay = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine()],
      progress: {},
      today: at('2026-04-14'),
    });

    const dayAfter = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine()],
      progress: {},
      today: at('2026-04-16'),
    });

    expect(DUE_WINDOW_DAYS).toBe(30);
    expect(lastDay[0].status).toBe('due');
    expect(dayAfter[0].status).toBe('overdue');
  });

  it('接種過就是 done，即使已經逾期很久', () => {
    const progress: VaccineProgress = {
      v1: { doses: { 1: { administered: true, administeredDate: '2026-03-20' } } },
    };

    const [dose] = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine()],
      progress: progress,
      today: at('2026-12-01'),
    });

    expect(dose.status).toBe('done');
    expect(dose.administeredDate).toBe('2026-03-20');
  });

  it('勾了接種但沒填日期，仍然算完成', () => {
    // 勾了就是打了。因為沒填日期而顯示逾期，等於逼家長去補一個他不記得的日子。
    const progress: VaccineProgress = {
      v1: { doses: { 1: { administered: true } } },
    };

    const [dose] = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine()],
      progress: progress,
      today: at('2026-12-01'),
    });

    expect(dose.status).toBe('done');
    expect(dose.administeredDate).toBeUndefined();
  });

  it('多劑疫苗各自用自己的 currentDose 對帳', () => {
    const first = vaccine({ id: 'multi', currentDose: 1, ageInMonths: 2 });
    const second = vaccine({ id: 'multi', currentDose: 2, ageInMonths: 4 });

    const progress: VaccineProgress = {
      multi: { doses: { 1: { administered: true, administeredDate: '2026-03-16' } } },
    };

    // 第 2 劑到期日 2026-05-15，寬容期到 06-14，所以要挑一個真的過了的日子。
    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [first, second],
      progress: progress,
      today: at('2026-07-01'),
    });

    expect(doses.find((d) => d.doseNumber === 1)?.status).toBe('done');
    expect(doses.find((d) => d.doseNumber === 2)?.status).toBe('overdue');
  });

  it('沒有月齡的劑次直接跳過，不假裝算得出日期', () => {
    const relative = vaccine({
      id: 'rel',
      ageInMonths: undefined,
      timing: '與公費同時接種',
    });

    expect(
      resolveVaccineDoses({
        birthday: BIRTHDAY,
        schedules: [relative],
        progress: {},
        today: at('2026-06-01'),
      }),
    ).toEqual([]);
  });

  it('沒有生日就什麼都算不出來', () => {
    expect(
      resolveVaccineDoses({
        birthday: '',
        schedules: [vaccine()],
        progress: {},
        today: at('2026-06-01'),
      }),
    ).toEqual([]);
  });

  it('依到期日遞增排序', () => {
    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [
        vaccine({ id: 'c', ageInMonths: 12 }),
        vaccine({ id: 'a', ageInMonths: 0 }),
        vaccine({ id: 'b', ageInMonths: 6 }),
      ],
      progress: {},
      today: at('2026-06-01'),
    });

    expect(doses.map((d) => d.vaccineId)).toEqual(['a', 'b', 'c']);
  });
});

describe('actionableVaccineDoses', () => {
  it('只留該打的：到期與剛逾期', () => {
    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: vaccineSchedules,
      progress: {},
      today: at('2026-07-15'),
    });

    const actionable = actionableVaccineDoses(doses, at('2026-07-15'));

    expect(actionable.length).toBeGreaterThan(0);
    actionable.forEach((dose) => expect(['due', 'overdue']).toContain(dose.status));
  });

  it('未來的劑次不進清單——把半年後的每一劑都列出來等於沒有重點', () => {
    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: vaccineSchedules,
      progress: {},
      today: at('2026-01-16'),
    });

    const actionable = actionableVaccineDoses(doses, at('2026-01-16'));

    expect(actionable.every((dose) => dose.dueDate <= '2026-01-16')).toBe(true);
  });

  it('久到不能再回頭補的劑次不再出現在提醒裡', () => {
    // 第一版沒有上限：5 個月大、從來沒記過的孩子拿到 13 筆紅字，第一筆是
    // 「出生24小時內」那一劑。那不是提醒，是一面沒有下一步的牆。
    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: vaccineSchedules,
      progress: {},
      today: at('2026-06-15'),
    });

    const actionable = actionableVaccineDoses(doses, at('2026-06-15'));

    expect(OVERDUE_LOOKBACK_DAYS).toBe(90);
    // 出生當天那一劑早就超出回顧範圍
    expect(actionable.some((dose) => dose.vaccineId === 'hepb-birth')).toBe(false);

    // 真正的規則不是「幾筆」，是「每一筆都還在回顧範圍內」。
    // 5 個月大沒記過會列出 6 筆——2 個月與 4 個月那幾劑加上剛到期的卡介苗，
    // 這些是真的可以帶去補打的，和出生 24 小時內那一劑不同。
    // 比字串而不是比毫秒：實作把今天正規化到當地午夜（全 repo 的慣例），
    // 拿中午的時間戳去減會差 12 小時，剛好把邊界那一劑判成超出範圍。
    const oldest = new Date(2026, 5, 15);

    oldest.setDate(oldest.getDate() - (OVERDUE_LOOKBACK_DAYS + DUE_WINDOW_DAYS));
    const oldestKey = toLocalDateKey(oldest);

    expect(actionable.length).toBeGreaterThan(0);

    actionable.forEach((dose) => {
      expect(
        dose.dueDate >= oldestKey,
        `${dose.name} ${dose.dueDate} < ${oldestKey}`,
      ).toBe(true);
    });
  });

  it('公費以外的劑次不算漏打——那是選擇或條件，不是時程', () => {
    // 把 RSV 單株抗體畫成「你漏打了」，家長會以為自己欠了一劑國家規定的疫苗。
    // 健保有條件給付的那一支同樣不放：app 不知道這個孩子算不算高危險群。
    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: vaccineSchedules,
      progress: {},
      today: at('2026-06-15'),
    });

    const actionable = actionableVaccineDoses(doses, at('2026-06-15'));

    expect(doses.some((dose) => dose.funding === 'self-paid')).toBe(true);
    expect(doses.some((dose) => dose.funding === 'nhi-conditional')).toBe(true);
    actionable.forEach((dose) => expect(dose.funding).toBe('national'));
  });

  it('公費但限定對象的劑次不算漏打——app 不知道這個孩子在不在名單上', () => {
    // 時程表講得出「公費，但只給名單上的孩子」：公費加上一段 eligibility。
    // 對每一個健康寶寶的家長說「你漏打了一劑公費疫苗」是新的錯誤資訊，
    // 只是換了方向；條件本身在疫苗頁上不必展開就看得到。
    const today = at('2026-05-20');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [
        vaccine({ id: 'gated', ageInMonths: 2, eligibility: '如為高危險群對象' }),
        vaccine({ id: 'routine', ageInMonths: 4 }),
      ],
      progress: {},
      today: today,
    });

    // 前提要成立：兩劑都是公費，限定對象那一劑真的已經到期。
    expect(doses.map((dose) => dose.funding)).toEqual(['national', 'national']);
    expect(doses.map((dose) => dose.status)).toEqual(['overdue', 'due']);

    expect(actionableVaccineDoses(doses, today).map((d) => d.vaccineId)).toEqual([
      'routine',
    ]);

    expect(nextScheduledDose(doses, today)?.vaccineId).toBe('routine');
  });

  it('只剩下限定對象的那一劑時，答案是「沒有下一劑」而不是它', () => {
    // 沒有人會去記錄一劑自己不需要打的疫苗，所以它一旦被當成待辦就永遠卡在
    // 那裡。這一條要在篩選被拿掉時紅，而不是被隔壁那一劑蓋過去。
    const today = at('2026-03-20');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine({ id: 'gated', eligibility: '如為高危險群對象' })],
      progress: {},
      today: today,
    });

    expect(doses[0].funding).toBe('national');
    expect(doses[0].status).toBe('due');
    expect(actionableVaccineDoses(doses, today)).toEqual([]);
    expect(nextScheduledDose(doses, today)).toBeUndefined();
  });

  it('限定對象的劑次仍然留在時程上，條件也跟著它走', () => {
    // 不是待辦不等於不存在：疫苗頁與行事曆匯出都靠這一列把條件送到家長眼前。
    const [dose] = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine({ id: 'gated', eligibility: '如為高危險群對象' })],
      progress: {},
      today: at('2026-03-20'),
    });

    expect(dose.vaccineId).toBe('gated');
    expect(dose.eligibility).toBe('如為高危險群對象');
  });

  it('剛出生時仍然提醒出生那幾劑', () => {
    // 上限是為了擋掉補不回來的歷史，不是擋掉新生兒真正該打的那一劑。
    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: vaccineSchedules,
      progress: {},
      today: at('2026-01-18'),
    });

    const actionable = actionableVaccineDoses(doses, at('2026-01-18'));

    expect(actionable.some((dose) => dose.vaccineId === 'hepb-birth')).toBe(true);
  });
});

describe('nextScheduledDose', () => {
  // 全部用上面的合成 vaccine()，不碰真實資料：這裡要釘的是規則，而不是
  // 某一版時程表剛好長什麼樣子。

  it('自費劑次不會被當成下一劑，即使它排在公費劑次前面', () => {
    // 這就是 bug 的形狀：自費劑次落在出生、2、4、6、18 個月，排序上全在前面，
    // 於是家長把公費打完後被告知「下次接種」是一支要自己付錢的產品。
    const today = at('2026-03-20');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [
        vaccine({ id: 'paid', ageInMonths: 2, funding: 'self-paid' }),
        vaccine({ id: 'free', ageInMonths: 4, funding: 'national' }),
      ],
      progress: {},
      today: today,
    });

    // 前提要成立：自費那一劑真的排在前面，而且真的已經到期。
    expect(doses[0].vaccineId).toBe('paid');
    expect(doses[0].status).toBe('due');

    expect(nextScheduledDose(doses, today)?.vaccineId).toBe('free');
  });

  it('公費以外的三種付費方式都不是下一劑', () => {
    const today = at('2026-03-20');

    const others: Array<VaccineSchedule['funding']> = [
      'self-paid',
      'nhi-conditional',
      'local-varies',
    ];

    others.forEach((funding) => {
      const doses = resolveVaccineDoses({
        birthday: BIRTHDAY,
        schedules: [vaccine({ funding })],
        progress: {},
        today: today,
      });

      expect(doses[0].status).toBe('due');
      expect(nextScheduledDose(doses, today), funding).toBeUndefined();
    });
  });

  it('打完一劑就往同系列的下一劑走', () => {
    const progress: VaccineProgress = {
      multi: { doses: { 1: { administered: true, administeredDate: '2026-03-16' } } },
    };

    const today = at('2026-03-20');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [
        vaccine({ id: 'multi', currentDose: 1, ageInMonths: 2 }),
        vaccine({ id: 'multi', currentDose: 2, ageInMonths: 4 }),
      ],
      progress: progress,
      today: today,
    });

    expect(nextScheduledDose(doses, today)?.doseNumber).toBe(2);
  });

  it('還沒到的劑次就是下一劑——那正是「下次接種」要回答的', () => {
    // 和提醒清單的差別只在這裡：未來的劑次是下一劑，但不是今天的待辦。
    const today = at('2026-02-01');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine({ id: 'two-month' })],
      progress: {},
      today: today,
    });

    expect(doses[0].status).toBe('upcoming');
    expect(nextScheduledDose(doses, today)?.vaccineId).toBe('two-month');
    expect(actionableVaccineDoses(doses, today)).toEqual([]);
  });

  it('逾期的劑次仍然是下一劑，不會被跳到還沒到的那一劑', () => {
    // 只挑「還沒到」的是相反方向的同一種壞掉：落後的家長最需要看到的，
    // 正是那一劑逾期的，而不是三個月後的下一站。
    const today = at('2026-05-01');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [
        vaccine({ id: 'behind', ageInMonths: 2 }),
        vaccine({ id: 'ahead', ageInMonths: 6 }),
      ],
      progress: {},
      today: today,
    });

    expect(doses[0].status).toBe('overdue');
    expect(doses[1].status).toBe('upcoming');
    expect(nextScheduledDose(doses, today)?.vaccineId).toBe('behind');
  });

  it('還沒出生的孩子，下一劑是出生那一劑', () => {
    // 生日填在未來（預產期先建檔）時，每一劑都還沒到，最早的那一劑才是答案。
    const today = at('2026-05-01');

    const doses = resolveVaccineDoses({
      birthday: '2026-06-01',
      schedules: [
        vaccine({ id: 'birth', ageInMonths: 0 }),
        vaccine({ id: 'two-month' }),
      ],
      progress: {},
      today: today,
    });

    expect(nextScheduledDose(doses, today)?.vaccineId).toBe('birth');
  });

  it('逾期到回顧範圍的最後一天還算下一劑，再過一天就不算', () => {
    // 到期日 2026-01-15，寬容 30 天後開始逾期，回顧 90 天：第 120 天是邊界。
    // 過了這條線的劑次是要和醫師對帳的病史，不是往前的下一步。
    const rows = [vaccine({ id: 'birth', ageInMonths: 0 })];
    const lastDay = at('2026-05-15');
    const dayAfter = at('2026-05-16');

    expect(OVERDUE_LOOKBACK_DAYS + DUE_WINDOW_DAYS).toBe(120);

    expect(
      nextScheduledDose(
        resolveVaccineDoses({
          birthday: BIRTHDAY,
          schedules: rows,
          progress: {},
          today: lastDay,
        }),
        lastDay,
      )?.vaccineId,
    ).toBe('birth');

    expect(
      nextScheduledDose(
        resolveVaccineDoses({
          birthday: BIRTHDAY,
          schedules: rows,
          progress: {},
          today: dayAfter,
        }),
        dayAfter,
      ),
    ).toBeUndefined();
  });

  it('已經打完的公費劑次不會又被端出來', () => {
    const progress: VaccineProgress = {
      v1: { doses: { 1: { administered: true, administeredDate: '2026-03-16' } } },
    };

    const today = at('2026-03-20');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [vaccine()],
      progress: progress,
      today: today,
    });

    expect(nextScheduledDose(doses, today)).toBeUndefined();
  });

  it('有到期劑次時，下一劑就是提醒清單的第一筆', () => {
    // 兩條路徑各走各的正是這個 bug 的來源，所以把它們一致的地方也釘住。
    const today = at('2026-05-01');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: [
        vaccine({ id: 'paid-birth', ageInMonths: 0, funding: 'self-paid' }),
        vaccine({ id: 'overdue-free', ageInMonths: 2 }),
        vaccine({ id: 'later-free', ageInMonths: 6 }),
      ],
      progress: {},
      today: today,
    });

    const actionable = actionableVaccineDoses(doses, today);

    expect(actionable.length).toBeGreaterThan(0);
    expect(nextScheduledDose(doses, today)).toBe(actionable[0]);
  });
});

describe('真實時程', () => {
  it('0-12 個月確實是重心：27 劑落在這個服務自己的範圍', () => {
    // 這個數字就是這個引擎存在的理由。變了要重新想清楚它該放哪個服務。
    // 36 而不是 31：RSV 單株抗體是兩種產品各一列，輪狀病毒是 2 劑型與 3 劑
    // 型各自成列，13 價肺炎鏈球菌的高危險群加打是另外一列；同時少掉一列不
    // 存在的 24 個月肺炎鏈球菌第 4 劑。
    const withAge = vaccineSchedules.filter((v) => v.ageInMonths !== undefined);
    const early = withAge.filter((v) => v.ageInMonths! <= 12);

    expect(withAge).toHaveLength(36);
    expect(early).toHaveLength(27);
  });

  it('高危險群那一劑在時程上，但不是任何一個孩子的待辦', () => {
    // 這一列就是 #33 的理由：公費、算得出日期、看得到條件，卻不該對每一個
    // 健康寶寶的家長說「你漏打了」。真實資料上再驗一次合成測試釘的規則。
    const today = at('2026-08-01');

    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: vaccineSchedules,
      progress: {},
      today: today,
    });

    const highRisk = doses.find((d) => d.vaccineId === 'pneumococcal-highrisk-6m');

    expect(highRisk?.funding).toBe('national');
    expect(highRisk?.dueDate).toBe('2026-07-15');
    expect(highRisk?.status).toBe('due');

    expect(
      actionableVaccineDoses(doses, today).map((d) => d.vaccineId),
    ).not.toContain('pneumococcal-highrisk-6m');

    expect(nextScheduledDose(doses, today)?.vaccineId).not.toBe(
      'pneumococcal-highrisk-6m',
    );
  });

  it('一歲生日當天，出生那一劑早就逾期，一歲那幾劑剛到期', () => {
    const doses = resolveVaccineDoses({
      birthday: BIRTHDAY,
      schedules: vaccineSchedules,
      progress: {},
      today: at('2027-01-15'),
    });

    const birth = doses.find((d) => d.vaccineId === 'hepb-birth');
    const twelve = doses.filter((d) => d.dueDate === '2027-01-15');

    expect(birth?.status).toBe('overdue');
    expect(twelve.length).toBeGreaterThan(0);
    twelve.forEach((dose) => expect(dose.status).toBe('due'));
  });
});
