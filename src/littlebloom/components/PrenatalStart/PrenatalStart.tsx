import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import type { BloomShellProps } from '../BloomShell';
const THEME = SERVICE_THEME.littlebloom;
interface PrenatalStartProps {
  BloomShell: React.ComponentType<BloomShellProps>;
  onStartPregnancy: () => void;
}

export default function PrenatalStart({
  BloomShell,
  onStartPregnancy,
}: PrenatalStartProps) {
  return (
    <BloomShell title="產檢時程" backTo="littlebloom">
      <EmptyState
        theme={THEME}
        title="還沒有孕期資料"
        description={
          '新增一個孕期檔案並填入預產期後，\n14 次公費產檢的時程會依末次月經自動排出來。'
        }
        action={{
          label: '回 LittleBloom 建立孕期檔案',
          onClick: () => {
            // 留在 LittleBloom 之內：新增孕期檔案的入口在本服務的首頁。
            onStartPregnancy();
          },
        }}
      />
    </BloomShell>
  );
}
