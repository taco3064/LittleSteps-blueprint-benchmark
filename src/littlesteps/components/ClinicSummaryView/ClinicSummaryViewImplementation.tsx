import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

export function ClinicSummaryView() {
  return (
    <div className="screen">
      <div className="screen-body-wide">
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="尚未建立寶寶檔案"
          description="請從左上角選單新增寶寶資料"
        />
      </div>
    </div>
  );
}
