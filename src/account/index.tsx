import { AddChildModal, ShareChildUuidModal } from '~app/family';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { useState } from 'react';
import { useOptionalAuth } from '~app/platform/hooks/useAuth';
import AccountButtonView from '~app/account/components/AccountButton';
import AccountSheetView from '~app/account/components/AccountSheet';
import { useAccountSheet } from '~app/account/hooks/useAccountSheet';
import type { ServiceId } from '~app/portal/domain/serviceCatalogue';
import { goTo } from '~app/portal/services/navigate';

export function AccountSheet({
  service,
  onClose,
}: {
  service: ServiceId;
  onClose: () => void;
}) {
  const model = useAccountSheet({ service, onClose, navigate: goTo });
  const theme = SERVICE_THEME[service];
  const view = prepareAccountView(model);

  const onAbout = () => {
    goTo('about');
    onClose();
  };

  return (
    <AccountSheetView
      model={{ ...view, theme }}
      onClose={onClose}
      onAbout={onAbout}
      dialogs={<AccountDialogs model={model} theme={theme} />}
    />
  );
}

export function AccountButton({
  service,
  className,
}: {
  service: ServiceId;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const user = useOptionalAuth()?.user ?? null;

  return (
    <AccountButtonView
      user={user}
      open={open}
      onOpen={() => setOpen(true)}
      className={className}
      sheet={<AccountSheet service={service} onClose={() => setOpen(false)} />}
    />
  );
}

function AccountDialogs({ model, theme }: {
  model: ReturnType<typeof useAccountSheet>;
  theme: (typeof SERVICE_THEME)[ServiceId];
}) {
  const {
    store,
    showChildModal,
    setShowChildModal,
    editingChild,
    setEditingChild,
    setSharingChildId,
    sharingChild,
    handleSaveChild,
    handleDeleteChild,
  } = model;

  return (
    <>
      <AddChildModal
        isOpen={showChildModal}
        onClose={() => {
          setShowChildModal(false);
          setEditingChild(null);
        }}
        onSave={handleSaveChild}
        onJoin={store?.joinChild}
        editingChild={editingChild}
        onDelete={editingChild ? () => handleDeleteChild(editingChild.id) : undefined}
        modes={['create', 'join']}
        accent={theme.fill}
      />

      {store && (
        <ShareChildUuidModal
          onAbout={() => goTo('about')}
          isOpen={sharingChild !== null}
          onClose={() => setSharingChildId(null)}
          child={sharingChild}
          revokeOtherMembers={store.revokeOtherMembers}
          setJoinOpen={store.setJoinOpen}
        />
      )}
    </>
  );
}

function prepareAccountView(model: ReturnType<typeof useAccountSheet>) {
  const { user, dialogRef, deleting, handleDeleteAccount, handleSignOut,
    childProfiles, showChildren, canAddChild, currentChildId,
    exportingChildId, handleExportChild } = model;

  const onEditChild = (child: ChildProfile | null) => {
    model.setEditingChild(child);
    model.setShowChildModal(true);
  };

  return {
    user, dialogRef, deleting, handleDeleteAccount, handleSignOut,
    childProfiles, showChildren, canAddChild, currentChildId,
    exportingChildId, handleExportChild,
    canDeleteAccount: model.store !== null,
    onSignIn: () => { model.signInWithGoogle(); },
    onAddChild: () => onEditChild(null),
    onEditChild,
    onSelectChild: (id: string) => model.store?.setCurrentChild(id),
    onShareChild: (id: string) => model.setSharingChildId(id),
  };
}
