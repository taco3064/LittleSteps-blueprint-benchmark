import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
interface PregnancyGateProps {
  onNavigate: () => void;
}
const THEME = SERVICE_THEME.littlesteps;

export default function PregnancyGate({ onNavigate }: PregnancyGateProps) {
  return (
    <div className="screen">
      <div className="screen-body">
        <EmptyState
          theme={THEME}
          title="這是孕期檔案"
          description={
            '目前選擇的是還沒出生的寶寶，這一頁記錄的是出生之後的事。\n孕期的產檢與每週指南在 '
            + 'LittleBloom；在那裡登記出生日期之後，這裡就會接手。'
          }
          action={{
            label: '前往 LittleBloom',
            onClick: onNavigate,
          }}
        />
      </div>
    </div>
  );
}
