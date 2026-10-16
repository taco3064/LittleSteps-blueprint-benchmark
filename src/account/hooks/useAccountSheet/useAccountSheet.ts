import { useState } from 'react';
import { useAuth } from '~app/platform/hooks/useAuth';
import { useOptionalChildStore } from '~app/family/hooks/useChildStoreContext';
import type { ChildFormValues } from '~app/family/domain/childForm';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { useDialogA11y } from '~app/platform/hooks/useDialogA11y';

import { type ServiceId } from '~app/portal/domain/serviceCatalogue';
import { MAX_CHILDREN } from '~app/family/domain/childLimits';
import { confirmDelete } from '~app/platform/services/confirmation';
import { useToast } from '~app/platform/hooks/useToast';
import {
  CHILD_EXPORT_MIME,
  buildChildExport,
  childExportFilename,
} from '~app/family/domain/childExport';
import { downloadFile } from '~app/platform/services/download';

const SERVICE_USES_CHILD: Record<ServiceId, boolean> = {
  littlesteps: true,
  littlebloom: true,
  littleexplorer: true,
  littleouting: false,
  babyoasis: false,
  littleguard: false,
};

interface AccountSheetProps {
  service: ServiceId;
  onClose: () => void;
}

function useAccountSheetState({
  service,
  onClose,
}: AccountSheetProps & { navigate: (page: 'home' | 'about') => void }) {
  const { user, signInWithGoogle, signOut, deleteAccount } = useAuth();
  const store = useOptionalChildStore();
  const toast = useToast();
  // 只在開著的時候才掛載（AccountButton 用 AnimatePresence 包住），所以固定傳 true。
  const dialogRef = useDialogA11y(true, onClose);
  const childProfiles = store?.childProfiles ?? [];
  const currentChildId = store?.currentChildId ?? null;

  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  // 正在讀哪個孩子的資料。四筆讀取要一點時間，而按鍵在那段時間裡看起來
  // 跟沒按過一樣——再按一次就會下載出第二個一模一樣的檔案。
  const [exportingChildId, setExportingChildId] = useState<string | null>(null);
  // 存 id 而不是 child 物件：切換「開放用代碼加入」之後 store 會送新的 profile
  // 進來，抓著開窗當下那份快照的話，開關會停在資料庫沒有的狀態。
  const [sharingChildId, setSharingChildId] = useState<string | null>(null);
  // 刪除帳號要走網路，而且不能來第二次：沒有這個狀態，連按兩下的第二下會對一個
  // 已經刪掉的使用者再刪一次，只換到一則講不出原因的錯誤。
  const [deleting, setDeleting] = useState(false);

  const showChildren = SERVICE_USES_CHILD[service] && store !== null;

  const sharingChild
    = childProfiles.find((profile) => profile.id === sharingChildId) ?? null;

  return {
    user,
    signInWithGoogle,
    signOut,
    deleteAccount,
    store,
    toast,
    dialogRef,
    childProfiles,
    currentChildId,
    showChildModal,
    setShowChildModal,
    editingChild,
    setEditingChild,
    exportingChildId,
    setExportingChildId,
    sharingChildId,
    setSharingChildId,
    deleting,
    setDeleting,
    showChildren,
    canAddChild: childProfiles.length < MAX_CHILDREN,
    sharingChild,
  };
}

function useChildActions(state: ReturnType<typeof useAccountSheetState>) {
  const { store, setShowChildModal, editingChild, setEditingChild } = state;

  const handleSaveChild = async (values: ChildFormValues) => {
    if (editingChild) {
      await store?.updateChild({ id: editingChild.id, ...values });
    } else {
      await store?.addChild(values);
    }

    setEditingChild(null);
  };

  const handleDeleteChild = (id: string) => {
    if (confirmDelete('這位寶寶的資料', '所有里程碑進度')) {
      store?.deleteChild(id);
      setShowChildModal(false);
      setEditingChild(null);
    }
  };

  return { handleSaveChild, handleDeleteChild };
}

function useExportAction(state: ReturnType<typeof useAccountSheetState>) {
  const { store, toast, exportingChildId, setExportingChildId } = state;

  const handleExportChild = async (childId: string) => {
    if (!store || exportingChildId) {
      return;
    }

    setExportingChildId(childId);

    try {
      const source = await store.readChildExport(childId);

      downloadFile(
        JSON.stringify(buildChildExport(source), null, 2),
        childExportFilename(source.child.name),
        CHILD_EXPORT_MIME,
      );

      // 下載在手機上不一定看得出來：Safari 只在螢幕頂端閃一下，Chrome 的下載列
      // 在分頁底下。少了這一句，「按了沒反應」與「檔案已經好了」在畫面上一模一樣。
      toast.show(`已匯出 ${source.child.name} 的紀錄，檔案在你的下載裡`, 'success');
    } catch (error) {
      console.error('匯出寶寶資料失敗:', error);
      toast.show('匯出失敗，請稍後再試');
    } finally {
      setExportingChildId(null);
    }
  };

  return { handleExportChild };
}

function useAccountActions(
  state: ReturnType<typeof useAccountSheetState>,
  options: { onClose: () => void; navigate: (page: 'home' | 'about') => void },
) {
  const { signOut, deleteAccount, store, toast, deleting, setDeleting } = state;
  const { onClose, navigate } = options;

  const handleSignOut = async () => {
    await signOut();
    navigate('home');
    onClose();
  };

  const handleDeleteAccount = async () => {
    if (!store || deleting) {
      return;
    }

    if (
      !confirmDelete(
        '這個帳號',
        '只有你一個人在用的寶寶資料與所有紀錄',
        // 共用的孩子留給對方，這句一定要在：少了它，唯一講得通的讀法是
        // 「全部刪掉」，而那會讓另一半的紀錄看起來也要跟著消失。
        '和家人共用的寶寶會留給他們，只把你從成員名單上移除。',
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      // 資料先刪、Auth 使用者後刪。反過來的話，使用者一消失就沒有任何身分回得去
      // 清那些節點——孩子的紀錄會留在資料庫裡，誰都讀不到也刪不掉。
      await store.deleteAccountData();

      // 重新驗證、登出與回到入口頁都在 deleteAccount 裡，失敗也由它出訊息。
      // 沒刪成功就把這張表留著：刪除的入口在這裡，而 WebView 那條路要家長
      // 重新登入——登入按鈕也在這張表上。
      if (await deleteAccount()) {
        onClose();
      }
    } catch {
      // 資料那一步沒過，所以 Auth 使用者還在，家長可以再試一次。store 記過 log。
      toast.show('帳號還沒刪掉，請稍後再試');
    } finally {
      setDeleting(false);
    }
  };

  return { handleSignOut, handleDeleteAccount };
}

export function useAccountSheet(
  options: AccountSheetProps & { navigate: (page: 'home' | 'about') => void },
) {
  const state = useAccountSheetState(options);

  return {
    ...state,
    ...useChildActions(state),
    ...useExportAction(state),
    ...useAccountActions(state, options),
  };
}
