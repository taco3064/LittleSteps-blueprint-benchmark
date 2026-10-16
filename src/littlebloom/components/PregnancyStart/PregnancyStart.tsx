import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import type { BloomShellProps } from '../BloomShell';
const THEME = SERVICE_THEME.littlebloom;
interface PregnancyStartProps {
  AddPregnancyModal: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, dueDate: string) => Promise<void>;
  }>;
  BloomShell: React.ComponentType<BloomShellProps>;
  setAddOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addOpen: boolean;
  onAddPregnancy: (name: string, dueDate: string) => Promise<void>;
}

export default function PregnancyStart({
  AddPregnancyModal,
  BloomShell,
  setAddOpen,
  addOpen,
  onAddPregnancy,
}: PregnancyStartProps) {
  return (
    <BloomShell title="LittleBloom" subtitle="孕期陪伴">
      <EmptyState
        theme={THEME}
        title="還沒有孕期檔案"
        description="填入預產期就開始——這裡會依週數顯示身體變化、本週提醒與產檢時程。"
        action={{ label: '新增孕期檔案', onClick: () => setAddOpen(true) }}
      />
      <AddPregnancyModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={onAddPregnancy}
      />
    </BloomShell>
  );
}
