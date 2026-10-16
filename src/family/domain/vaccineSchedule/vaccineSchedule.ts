import { addMonths, parseLocalDate, toLocalDateKey } from '~app/platform/domain/calendar';
import {
  resolveScheduleStatus,
  type ScheduleStatus,
} from '~app/knowledge/domain/scheduleStatus';
import type { VaccineProgress } from '../familyRecords';
import type { VaccineSchedule } from '~app/knowledge/domain/referenceModels';

/**
 * 把疫苗時程依出生日展開成「什麼時候該打」。
 *
 * 修之前 LittleSteps 只把 ageInMonths 拿來篩選和顯示，從來沒有和生日相減過：
 * 疫苗頁是一份可以按月齡瀏覽的清單，家長得自己知道寶寶幾個月大、自己去翻。
 * 而 32 劑裡有 22 劑落在 0-12 個月，也就是這個服務自己的守備範圍——時程最密、
 * 最不能拖的那一年，用的是最被動的介面。
 *
 * 對照組是 LittleExplorer：它手上只有 8 劑連結，卻有 resolveCareTasks 算出
 * 到期日、可執行區間與逾期狀態，提醒頁直接告訴家長。這裡缺的不是想法，是接線。
 *
 * 狀態判斷走共用的 resolveScheduleStatus，和產檢、幼兒照護任務同一套；
 * 這個檔案負責的只有「疫苗特有的錨點與區間」。
 */

/**
 * 可執行區間的寬容天數。
 *
 * 疾管署的公費時程給的是「滿 N 個月」的建議接種時間，不是一個硬性截止日；
 * 診所要預約、要看孩子當天有沒有感冒。抓太緊會讓正常的一兩週延後被畫成逾期，
 * 家長對著一片紅字反而學會忽略它。
 *
 * 選 30 天：比「下次回診」的常見間隔略寬一點，又短到過期一個月會真的講出來。
 * 這是介面上的寬容度，不是醫學建議——真正的接種時程請看每一劑的 timing。
 */
export const DUE_WINDOW_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ResolvedVaccineDose {
  vaccineId: string;
  /** VaccineSchedule.currentDose；同一支疫苗多劑時用來區分 */
  doseNumber: number;
  name: string;
  /** 疾管署寫的建議時間，逐字沿用，不改寫成數字 */
  timing: string;
  funding: VaccineSchedule['funding'];
  /**
   * 來源寫的給付條件，逐字沿用。有值就代表這一劑只給名單上的孩子，
   * 於是它是資訊而不是待辦——判斷寫在 isScheduledDose。
   */
  eligibility?: string;
  /** 建議接種日 = 出生日 + ageInMonths */
  dueDate: string;
  status: ScheduleStatus;
  /** 已接種且有記日期時才有值 */
  administeredDate?: string;
}

function doseRecord(progress: VaccineProgress, vaccineId: string, doseNumber: number) {
  return progress[vaccineId]?.doses?.[doseNumber];
}

/**
 * 依出生日展開所有有月齡的劑次，依建議接種日遞增排序。
 *
 * 沒有 ageInMonths 的劑次會被跳過：算不出日期就不該假裝算得出來（自費疫苗
 * 有幾筆只寫「與公費同時」這類相對時程）。
 *
 * 完全無 I/O；today 可注入以利測試。
 */
export function resolveVaccineDoses({
  birthday,
  schedules,
  progress,
  today = new Date(),
}: {
  birthday: string;
  schedules: VaccineSchedule[];
  progress: VaccineProgress;
  today?: Date;
}): ResolvedVaccineDose[] {
  if (!birthday) {
    return [];
  }

  const todayLocal = parseLocalDate(toLocalDateKey(today));

  return schedules
    .filter((vaccine) => vaccine.ageInMonths !== undefined)
    .map((vaccine) => {
      const doseNumber = vaccine.currentDose ?? 1;
      const dueDate = addMonths(birthday, vaccine.ageInMonths!);

      const windowEnd = toLocalDateKey(
        new Date(parseLocalDate(dueDate).getTime() + DUE_WINDOW_DAYS * MS_PER_DAY),
      );

      const record = doseRecord(progress, vaccine.id, doseNumber);

      // 已接種但沒填日期時給空字串，讓狀態仍然是 done——勾了就是打了。
      const completedDate = record?.administered
        ? (record.administeredDate ?? '')
        : undefined;

      return {
        vaccineId: vaccine.id,
        doseNumber,
        name: vaccine.name,
        timing: vaccine.timing,
        funding: vaccine.funding,
        eligibility: vaccine.eligibility,
        dueDate,
        status: resolveScheduleStatus({
          completedDate,
          today: todayLocal,
          dueDate: parseLocalDate(dueDate),
          windowEnd: parseLocalDate(windowEnd),
        }),
        administeredDate: record?.administeredDate,
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/**
 * 逾期還要提醒多久。
 *
 * 第一版沒有這個上限，結果 5 個月大、從來沒記過的孩子會拿到 13 筆紅字，
 * 第一筆是「B型肝炎疫苗 第1劑（出生24小時內）」——那不是提醒，是一面沒有下一步
 * 的牆，而家長對著一面牆學會的是忽略它。這個 session 早先在幼兒期那邊修過
 * 一模一樣的東西（「已逾期 425 天」的徽章），我自己又寫了一次。
 *
 * 超過這個天數的劑次仍然在疫苗頁上、仍然沒有勾——它變成要和醫師對帳的病史，
 * 不是今天的待辦。
 */
export const OVERDUE_LOOKBACK_DAYS = 90;

/**
 * 只有公費常規時程算「時程」。
 *
 * 自費疫苗是選擇不是時程，把它畫成「你漏打了」會讓家長以為自己欠了一劑國家
 * 規定的疫苗——這和幼兒期提醒清單刻意排除自費劑次是同一個判斷。
 *
 * nhi-conditional 刻意也不放進來，即使它可能不用錢。健保給付綁的是「1 歲以下
 * 高危險群」這類條件，而這個 app 不知道這個孩子算不算——把它列成到期的待辦，
 * 等於對每一個健康寶寶的家長說「你漏打了一劑」，那是新的錯誤資訊，只是換了
 * 方向。條件本身在疫苗頁上不必展開就看得到，該知道的家長在那裡會看到。
 *
 * 這是全 app 唯一決定這件事的地方：提醒清單、下一劑、儀表板卡片與看診摘要
 * 都指向這個常數。兩份各自判斷 funding 的實作就是 #25 本身——不看 funding
 * 的那一份不只偶爾答錯，而是一旦家長記下出生第一劑就永遠卡在自費那一列，
 * 因為不會去買的劑次永遠不會被記錄，「第一筆沒接種的」就永遠不會往前走。
 *
 * 光是這個值還不夠：公費也分「每個孩子都該打」與「只給名單上的孩子」，
 * 後者由 isScheduledDose 一起判斷，不要單獨比對這個常數。
 */
export const SCHEDULED_FUNDING: VaccineSchedule['funding'] = 'national';

/**
 * 這一劑算不算「這個孩子欠的」。
 *
 * 光看 funding 不夠：時程表也講得出「公費，但只給名單上的孩子」——公費加上
 * 一段 eligibility，例如高危險群才多打的那一劑。這個 app 不知道這個孩子在
 * 不在名單上，而兩種預設不是對稱的錯：
 *
 *   * 預設每個孩子都在，等於對絕大多數健康寶寶的家長說「你漏打了一劑公費
 *     疫苗」，而且那一劑不會有人去打、就永遠不會被記錄，於是它會一直卡在
 *     「下一劑」那張卡上——正是 #25 拔掉的毛病。
 *   * 預設都不在，最壞的情況是真的符合條件的那一家在疫苗頁上讀到條件——那
 *     一段不必展開就看得到，行事曆匯出也帶著它。
 *
 * 所以帶 eligibility 的劑次是資訊，不是待辦。提醒清單、下一劑、儀表板卡片
 * 與看診摘要都問這一個述詞，不要各自再判斷一次 funding。
 */
export function isScheduledDose(
  dose: Pick<VaccineSchedule, 'funding' | 'eligibility'>,
): boolean {
  return dose.funding === SCHEDULED_FUNDING && !dose.eligibility;
}

/**
 * 「還在這個孩子的時程上」——下一劑與提醒清單共用的同一條規則。
 *
 * 逾期超過 OVERDUE_LOOKBACK_DAYS 的不算：那一劑已經在孩子身後，是要和醫師
 * 對帳的病史，不是往前的下一步。還沒到的算——那才是接下來要做的事。
 *
 * 回傳判斷函式而不是直接判斷：cutoff 一次算完，不必每一劑重新解析日期。
 */
const stillOnSchedule = (today: Date) => {
  const cutoff
    = parseLocalDate(toLocalDateKey(today)).getTime()
      - (OVERDUE_LOOKBACK_DAYS + DUE_WINDOW_DAYS) * MS_PER_DAY;

  return (dose: ResolvedVaccineDose): boolean => {
    if (!isScheduledDose(dose)) {
      return false;
    }

    if (dose.status === 'done') {
      return false;
    }

    if (dose.status !== 'overdue') {
      return true;
    }

    return parseLocalDate(dose.dueDate).getTime() >= cutoff;
  };
};

/**
 * 現在該提醒家長的劑次。
 *
 * 在 stillOnSchedule 之上再排除「還沒到」的：把未來半年每一劑都列出來等於
 * 沒有重點。這也是它和 nextScheduledDose 唯一的差別——一個回答「今天要做
 * 什麼」，一個回答「接下來是哪一劑」。
 */
export function actionableVaccineDoses(
  doses: ResolvedVaccineDose[],
  today: Date = new Date(),
): ResolvedVaccineDose[] {
  const onSchedule = stillOnSchedule(today);

  return doses.filter((dose) => dose.status !== 'upcoming' && onSchedule(dose));
}

/**
 * 這個孩子的「下一劑」。儀表板卡片與看診摘要都在問這個問題。
 *
 * 這個問題原本有兩個答案：這裡的公費規則，以及 summaryCalculator 自己按
 * ageInMonths 排序、回傳第一筆沒接種的版本。後者不看 funding，而自費劑次落在
 * 出生、2、4、6、18 個月，全部排在公費劑次前面——於是把公費打完的家長，會被
 * 用和免費劑次一模一樣的字告知「下次接種」是一支要自己付錢的產品。現在只剩
 * 這一個答案。
 *
 * 也不再無視孩子多大：早就超出回顧範圍的劑次不是下一步，但還沒到的算——
 * 那正是「下次接種」要回答的東西。
 *
 * doses 必須是 resolveVaccineDoses 的輸出（已依到期日遞增），所以第一筆符合的
 * 就是最早的那一劑。
 */
export function nextScheduledDose(
  doses: ResolvedVaccineDose[],
  today: Date = new Date(),
): ResolvedVaccineDose | undefined {
  return doses.find(stillOnSchedule(today));
}
