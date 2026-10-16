import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

export function SleepAnalysisView2() {
  return (
    <div className="screen">
      <div className="screen-body">
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="還沒有睡眠記錄"
          description={
            '開始記錄寶寶的睡眠，就能看到分析與建議囉！\n前往「快速日誌」頁面記錄睡眠'
          }
        />
      </div>
    </div>
  );
}
