import { toLocalDateKey } from '~app/platform/domain/calendar';
import { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { isNightSleep } from '~app/littlesteps/domain/sleepAnalysis';
import { SleepTimelineChartPresentation } from './SleepTimelineChartPresentation';

interface SleepTimelineChartProps {
  weekLogs: DailyLog[];
}

interface SleepPeriod {
  date: string;
  startHour: number;
  endHour: number;
  duration: number;
  isNight: boolean;
}

export default function SleepTimelineChart({ weekLogs }: SleepTimelineChartProps) {
  // Group sleep logs by date
  const sleepPeriodsByDate: { [date: string]: SleepPeriod[] } = {};

  // Filter completed sleep logs and group by date
  weekLogs
    .filter((log) => {
      const data = log.data as SleepData;

      return log.type === 'sleep' && data.endTime && data.duration;
    })
    .forEach((log) => {
      const data = log.data as SleepData;
      const startDate = new Date(data.startTime);
      const endDate = new Date(data.endTime!);

      // Use date string as key (YYYY-MM-DD)
      const dateKey = toLocalDateKey(startDate);

      const startHour = startDate.getHours() + startDate.getMinutes() / 60;
      const endHour = endDate.getHours() + endDate.getMinutes() / 60;

      const period: SleepPeriod = {
        date: dateKey,
        startHour,
        endHour,
        duration: data.duration!,
        isNight: isNightSleep(data.startTime),
      };

      if (!sleepPeriodsByDate[dateKey]) {
        sleepPeriodsByDate[dateKey] = [];
      }

      sleepPeriodsByDate[dateKey].push(period);
    });

  // Get last 7 days
  const dates: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);
    dates.push(toLocalDateKey(date));
  }

  // Helper to format date label
  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

    return `${month}/${day} (${weekday})`;
  };

  // Helper to calculate position and width
  const calculatePosition = (startHour: number, endHour: number) => {
    // Handle cross-midnight sleep (e.g., 23:00 to 07:00)
    let adjustedEndHour = endHour;

    if (endHour < startHour) {
      adjustedEndHour = endHour + 24;
    }

    const left = (startHour / 24) * 100;
    const width = ((adjustedEndHour - startHour) / 24) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <SleepTimelineChartPresentation
      dates={dates}
      sleepPeriodsByDate={sleepPeriodsByDate}
      formatDateLabel={formatDateLabel}
      calculatePosition={calculatePosition}
    />
  );
}
