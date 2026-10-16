import { Baby } from 'lucide-react';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import type { BloomShellProps } from '../BloomShell';
const THEME = SERVICE_THEME.littlebloom;
interface BirthRecordedNoticeProps {
  BloomShell: React.ComponentType<BloomShellProps>;
  currentChild: ChildProfile;
  onOpenInfantCare: () => void;
}

export default function BirthRecordedNotice({
  BloomShell,
  currentChild,
  onOpenInfantCare,
}: BirthRecordedNoticeProps) {
  return (
    <BloomShell title="LittleBloom" subtitle="孕期已完成">
      <EmptyState
        theme={THEME}
        icon={Baby}
        title="寶寶已經出生了"
        description={`${currentChild.name} 的孕期紀錄已經封存保留。\n接下來的成長里程碑與疫苗，請到 LittleSteps 繼續。`}
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
