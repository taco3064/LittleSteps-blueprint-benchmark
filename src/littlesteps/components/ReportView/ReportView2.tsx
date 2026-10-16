import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

export function ReportView2() {
  return (
    <div className="screen">
      <div className="screen-body-wide">
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="還沒有足夠的記錄"
          description={
            '開始記錄寶寶的日常，就能看到分析報告囉！\n前往「快速日誌」頁面記錄餵奶、睡眠與換尿布'
          }
        />
      </div>
    </div>
  );
}
