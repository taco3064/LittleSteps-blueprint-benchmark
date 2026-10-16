import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

export function SleepAnalysisView() {
  return (
    <div className="screen">
      <div className="screen-body">
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="還沒有寶寶的資料"
          description="請點右上角的帳號按鈕新增或選擇寶寶。"
        />
      </div>
    </div>
  );
}
