import { formatDuration } from '~app/littlesteps/domain/logHelpers';
import { StatCard } from './StatCard';
import { formatDateTime } from './formatDateTime';
interface ClinicSummaryView13Props {
  data: import('~app/littlesteps/domain/clinicSummary').ClinicSummaryData;
}

export function ClinicSummaryView13({ data }: ClinicSummaryView13Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
      <StatCard
        label="每日平均餵奶次數"
        value={
          data.weekSummary.feedingDays > 0
            ? `${data.weekSummary.avgFeedingCount} 次`
            : '無記錄'
        }
        loggedDays={data.weekSummary.feedingDays}
      />
      <StatCard
        label="每日平均奶量"
        value={
          data.weekSummary.feedingDays > 0
            ? `${data.weekSummary.avgFeedingAmount} ml`
            : '無記錄'
        }
        loggedDays={data.weekSummary.feedingDays}
      />
      <StatCard
        label="每日平均睡眠"
        value={
          data.weekSummary.sleepDays > 0
            ? `${data.weekSummary.avgSleepHours} 小時`
            : '無記錄'
        }
        loggedDays={data.weekSummary.sleepDays}
      />
      <StatCard
        label="最長連續睡眠"
        value={
          data.weekSummary.longestSleep > 0
            ? formatDuration(data.weekSummary.longestSleep)
            : '無記錄'
        }
      />
      <StatCard
        label="每日平均便便次數"
        value={
          data.weekSummary.diaperDays > 0
            ? `${data.weekSummary.avgPoopCount} 次`
            : '無記錄'
        }
        loggedDays={data.weekSummary.diaperDays}
      />
      <StatCard
        label="最後一次便便"
        value={
          data.weekSummary.lastPoopTime
            ? formatDateTime(data.weekSummary.lastPoopTime)
            : '無紀錄'
        }
        small
      />
    </div>
  );
}
