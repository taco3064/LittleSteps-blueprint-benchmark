import DashboardCard from '../DashboardCard';
import { VaccineProgress } from '~app/domain/records';
import { calculateVaccineSummary } from '~app/domain/summaryCalculator';

interface VaccineSummaryCardProps {
  vaccineProgress: VaccineProgress;
  /** 下一劑是從出生日推算的，沒有生日就算不出「接下來是哪一劑」 */
  birthday: string;
  onNavigate: () => void;
}

export default function VaccineSummaryCard({
  vaccineProgress,
  birthday,
  onNavigate,
}: VaccineSummaryCardProps) {
  const summary = calculateVaccineSummary(vaccineProgress, birthday);

  // 公費都記完之後還剩幾劑。分母是整份時程表，而這個分支只在公費劑次一劑
  // 不欠時出現，所以差額就是「不在公費常規時程內」的那些——自費的、健保有
  // 條件給付的，以及只給名單上的孩子的那一劑。
  const remainingOutsideSchedule = summary.totalDoses - summary.administeredCount;

  return (
    <DashboardCard title="疫苗追蹤" onClick={onNavigate} bgColor="bg-mint-light/30">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-mint-dark">
          {summary.administeredCount}
        </span>
        <span className="text-ink-muted">
          {'/ '}
          {summary.totalDoses}
          {' 已接種'}
        </span>
      </div>

      <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-mint transition-all duration-500"
          style={{ width: `${summary.administrationRate}%` }}
        />
      </div>

      {summary.nextVaccine
        ? (
            <div className="pt-2 border-t border-ink/10">
              <p className="text-xs font-medium text-ink-faint mb-2">下次接種</p>
              <div className="bg-white rounded-xl p-3 border border-mint/40">
                <p className="font-medium text-ink">{summary.nextVaccine.name}</p>
                <p className="text-sm text-ink-muted mt-1">
                  {'第 '}
                  {summary.nextVaccine.doseNumber}
                  {' 劑 • '}
                  {summary.nextVaccine.timing}
                </p>
              </div>
            </div>
          )
        : summary.remainingNationalDoses > 0
          ? (
        // 沒有下一劑，但公費劑次還沒記完——剩下的都已經超出可以補打的範圍。
        // 這時候說「皆已接種完成」是假的，說「你漏打了」也不對：家長可能打了
        // 只是沒記。用和幼兒期提醒頁同一個講法。
              <div className="pt-2 border-t border-ink/10">
                <p className="text-sm text-ink-muted leading-relaxed">
                  {'尚有 '}
                  {summary.remainingNationalDoses}
                  {' 劑公費疫苗沒有記錄，沒有記錄不代表沒打，可對照兒童健康手冊補登'}
                </p>
              </div>
            )
          : (
        // 分母是整份時程表（含自費），所以只說「公費」會和上面的 20/36 對不起來。
        // 把差額的來由與劑數都講出來：隔壁那個分支說得出「尚有 N 劑」，這一個
        // 只說「其餘劑次」，而沒有公費可打的這一刻，正是家長想知道還剩什麼的
        // 時候——那個減法家長自己做得出來，說不出來的是那些劑次還能不能打。
        //
        // 只給數量與可得性，不指名任何一支、也不說該不該打：把自費劑次寫成
        // 待辦正是 #25 拔掉的東西。
        //
        // 年齡上限不是註腳。會走到這個分支的多半是大孩子——公費一劑不欠、又
        // 沒有下一劑，本來就是把時程走完的那一種。以測試裡那個 2020 年生的
        // 孩子算，16 劑裡至少 8 劑已經不可能再打（輪狀病毒 24/32 週封頂、RSV
        // 限一歲以下、高危險群那一劑是 6 個月的公費）。那是一半，先講「仍可
        // 依需要接種」再補一句「部分有年齡上限」，順序就把話說反了。
              <div className="pt-2 border-t border-ink/10">
                <p className="text-sm text-mint-dark font-medium leading-relaxed">
                  {remainingOutsideSchedule > 0
                    ? `公費疫苗皆已接種完成，另有 ${remainingOutsideSchedule} 劑不在公費常規時程內（自費或有條件給付），部分有年齡上限、未必還來得及，請與醫師討論`
                    : '時程表上的疫苗皆已接種完成'}
                </p>
              </div>
            )}
    </DashboardCard>
  );
}
