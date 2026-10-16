import { Baby } from 'lucide-react';
import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import type { BloomShellProps } from '../BloomShell';
const THEME = SERVICE_THEME.littlebloom;
interface PrenatalCompletedProps {
  BloomShell: React.ComponentType<BloomShellProps>;
  onOpenInfantCare: () => void;
}

export default function PrenatalCompleted({
  BloomShell,
  onOpenInfantCare,
}: PrenatalCompletedProps) {
  return (
    <BloomShell title="產檢時程" backTo="littlebloom">
      <EmptyState
        theme={THEME}
        icon={Baby}
        title="寶寶已經出生了"
        description={
          '產檢時程已經走完，紀錄都保留著。\n寶寶的健兒門診與疫苗時程請到 LittleSteps 查看。'
        }
        action={{
          label: '前往 LittleSteps',
          onClick: () => {
            onOpenInfantCare();
          },
        }}
      />
    </BloomShell>
  );
}
