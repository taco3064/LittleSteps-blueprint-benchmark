import { AlertTriangle } from 'lucide-react';
import DashboardCard from '../DashboardCard';
import SparklineChart from '../SparklineChart';
import { DailyLog, DiaperData } from '~app/domain/records';
import { generateSparklineData } from '~app/domain/trendCalculator';

interface PoopSummaryCardProps {
  dailyLogs: DailyLog[];
  onNavigate: () => void;
}

export default function PoopSummaryCard({
  dailyLogs,
  onNavigate,
}: PoopSummaryCardProps) {
  // Find last poop time
  const poopLogs = dailyLogs
    .filter((log) => log.type === 'diaper')
    .filter((log) => {
      const data = log.data as DiaperData;

      return data.type === 'poop' || data.type === 'both';
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const lastPoopTime = poopLogs.length > 0 ? new Date(poopLogs[0].timestamp) : null;

  const hoursSinceLastPoop = lastPoopTime
    ? (Date.now() - lastPoopTime.getTime()) / (1000 * 60 * 60)
    : null;

  // Format relative time
  const formatRelativeTime = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);

      return `${minutes} 分鐘前`;
    }

    if (hours < 24) {
      return `${Math.round(hours)} 小時前`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);

    if (remainingHours === 0) {
      return `${days} 天前`;
    }

    return `${days} 天 ${remainingHours} 小時前`;
  };

  // 7-day sparkline data
  const sparklineData = generateSparklineData(dailyLogs, 7, 'poop_count');
  const total7Days = sparklineData.reduce((sum, v) => sum + v, 0);
  const isWarning = hoursSinceLastPoop !== null && hoursSinceLastPoop > 48;

  return (
    <DashboardCard title="排便追蹤" onClick={onNavigate} bgColor="bg-butter-light/30">
      {lastPoopTime
        ? (
            <>
              <div className={`rounded-xl p-3 ${isWarning ? 'bg-red-50' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-ink-muted mb-1">上次排便</div>
                    <div
                      className={`text-lg font-bold ${isWarning ? 'text-red-600' : 'text-butter-dark'}`}
                    >
                      {formatRelativeTime(hoursSinceLastPoop!)}
                    </div>
                  </div>
                  {isWarning && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-xs font-medium">留意</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-ink-muted">近 7 天趨勢</span>
                  <span className="text-xs text-ink-faint">
                    {'共 '}
                    {total7Days}
                    {' 次'}
                  </span>
                </div>
                {/* `#9A6212` is `butter-dark`; SVG paint can't take a Tailwind class. */}
                <SparklineChart
                  data={sparklineData}
                  height={36}
                  color="#9A6212"
                  fillColor="#9A6212"
                />
              </div>
            </>
          )
        : (
            <p className="text-center py-4 text-ink-faint">尚無排便記錄</p>
          )}
    </DashboardCard>
  );
}
