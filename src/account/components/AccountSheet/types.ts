import type { useAccountSheet } from '~app/account/hooks/useAccountSheet';
import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import type { ChildProfile } from '~app/family/domain/familyRecords';

type SheetState = ReturnType<typeof useAccountSheet>;
export type AccountViewModel = Pick<SheetState,
  'user' | 'dialogRef' | 'deleting' | 'handleDeleteAccount'
  | 'handleSignOut' | 'childProfiles' | 'showChildren' | 'canAddChild'
  | 'currentChildId' | 'exportingChildId' | 'handleExportChild'> & {
    theme: ServiceTheme;
    canDeleteAccount: boolean;
    onSignIn: () => void;
    onAddChild: () => void;
    onEditChild: (child: ChildProfile) => void;
    onSelectChild: (id: string) => void;
    onShareChild: (id: string) => void;
  };

export interface AccountSheetProps {
  model: AccountViewModel;
}
