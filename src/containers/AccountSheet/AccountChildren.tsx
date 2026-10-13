import { Download, Edit, Share2 } from 'lucide-react';
import { useState } from 'react';
import AddChildModal from '~app/components/AddChildModal';
import {
  CHILD_EXPORT_MIME,
  buildChildExport,
  childExportFilename,
} from '~app/domain/childExport';
import { CHILD_LIMIT_MESSAGE, MAX_CHILDREN } from '~app/domain/childLimits';
import { confirmDelete } from '~app/domain/confirmDelete';
import { downloadFile } from '~app/domain/download';
import { isPregnancyProfile } from '~app/domain/pregnancy';
import type { ChildProfile } from '~app/domain/records';
import { useOptionalChildStore } from '~app/hooks/useChildStoreContext';
import { useToast } from '~app/hooks/useToast';
import ShareChildUuidModal from '../ShareChildUuidModal';

import type { ServiceTheme } from '~app/domain/serviceTheme';

export default function AccountChildren({ theme }: { theme: ServiceTheme }) {
  const store = useOptionalChildStore();
  const childProfiles = store?.childProfiles ?? [];

  const {
    showChildModal,
    setShowChildModal,
    editingChild,
    setEditingChild,
    handleSaveChild,
    handleDeleteChild,
  } = useChildEditor();

  // 存 id 而不是 child 物件：切換「開放用代碼加入」之後 store 會送新的 profile
  // 進來，抓著開窗當下那份快照的話，開關會停在資料庫沒有的狀態。
  const [sharingChildId, setSharingChildId] = useState<string | null>(null);
  const canAddChild = childProfiles.length < MAX_CHILDREN;

  const sharingChild
    = childProfiles.find((profile) => profile.id === sharingChildId) ?? null;

  const { exportingChildId, handleExportChild } = useChildExport();

  return (
    <>
      <div>
        <h3 className="mb-2">我的寶寶</h3>
        <div className="space-y-2">
          {childProfiles.length === 0 && (
            <p className="text-sm text-ink-muted px-1">還沒有寶寶資料</p>
          )}

          {childProfiles.map((child) => (
            <AccountChildRow
              key={child.id}
              child={child}
              theme={theme}
              onShare={() => setSharingChildId(child.id)}
              onEdit={() => {
                setEditingChild(child);
                setShowChildModal(true);
              }}
              onExport={() => handleExportChild(child.id)}
              exporting={exportingChildId === child.id}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              setEditingChild(null);
              setShowChildModal(true);
            }}
            disabled={!canAddChild}
            className={
              'btn-secondary w-full disabled:opacity-50'
              + ' disabled:cursor-not-allowed'
            }
            title={canAddChild ? '新增寶寶' : CHILD_LIMIT_MESSAGE}
          >
            新增寶寶
          </button>
        </div>
      </div>
      <AddChildModal
        isOpen={showChildModal}
        onClose={() => {
          setShowChildModal(false);
          setEditingChild(null);
        }}
        onSave={handleSaveChild}
        onJoin={store?.joinChild}
        editingChild={editingChild}
        onDelete={
          editingChild ? () => handleDeleteChild(editingChild.id) : undefined
        }
        modes={['create', 'join']}
        accent={theme.fill}
      />
      {store && (
        <ShareChildUuidModal
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

function AccountChildRow({
  child,
  theme,
  onShare,
  onEdit,
  onExport,
  exporting,
}: {
  child: ChildProfile;
  theme: ServiceTheme;
  onShare: () => void;
  onEdit: () => void;
  onExport: () => Promise<void>;
  exporting: boolean;
}) {
  const store = useOptionalChildStore();
  const currentChildId = store?.currentChildId ?? null;

  return (
    <div
      key={child.id}
      className={`flex items-center gap-1 p-2 pl-3 rounded-2xl transition-colors ${
        child.id === currentChildId ? theme.tint : 'bg-ink/5 hover:bg-ink/10'
      }`}
    >
      <button
        type="button"
        className="flex-1 min-w-0 flex items-center gap-2 min-h-tap text-left"
        onClick={() => store?.setCurrentChild(child.id)}
        aria-current={child.id === currentChildId ? 'true' : undefined}
      >
        <span className="font-medium text-ink truncate">{child.name}</span>
        {/* 孕期檔案的 birthday 是預產期，外觀上與寶寶檔案無異；
                          沒有這個標記，切換器裡兩者分不出來。 */}
        {isPregnancyProfile(child) && (
          <span className="tag bg-bloom-dusty-rose/15 text-bloom-dusty-rose-ink shrink-0">
            孕期
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onShare}
        className="btn-icon"
        title="分享寶寶資料給家人"
        aria-label={`分享 ${child.name} 的資料給家人`}
      >
        <Share2 className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="btn-icon"
        title="編輯寶寶資料"
        aria-label={`編輯 ${child.name} 的資料`}
      >
        <Edit className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        className="btn-icon disabled:opacity-50"
        title="匯出寶寶的完整紀錄"
        aria-label={`匯出 ${child.name} 的資料`}
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
}

function useChildExport() {
  const store = useOptionalChildStore();
  const toast = useToast();
  // 正在讀哪個孩子的資料。四筆讀取要一點時間，而按鍵在那段時間裡看起來
  // 跟沒按過一樣——再按一次就會下載出第二個一模一樣的檔案。
  const [exportingChildId, setExportingChildId] = useState<string | null>(null);

  /**
   * 匯出整份紀錄：孩子本體與三份紀錄讀回來，組成一個 JSON 檔下載。
   *
   * 讀完之後就不再 await。iOS Safari 只認得同一個手勢裡發生的 <a download>
   * 點擊，四筆讀取已經花掉一輪；後面再插一個 await，等於把那個點擊推到更遠的
   * 地方，家長按了匯出卻什麼都沒下載。
   *
   * 這個抽屜本來沒有任何出錯的地方可以講話，所以失敗走 toast——不出訊息的話，
   * 按下去毫無反應與「檔案正在準備」在畫面上長得一模一樣。
   */
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

  return { exportingChildId, handleExportChild };
}

function useChildEditor() {
  const store = useOptionalChildStore();
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);

  // 回傳 promise，讓 AddChildModal 等寫入成功才關窗；失敗時它會留著輸入
  // 並顯示原因，而不是安靜地關掉、把打好的名字與生日一起丟掉。
  const handleSaveChild = async ({
    name,
    birthday,
    gender,
    dueDate,
    gestationalAge,
  }: Parameters<
    NonNullable<React.ComponentProps<typeof AddChildModal>['onSave']>
  >[0]) => {
    if (editingChild) {
      await store?.updateChild({
        id: editingChild.id,
        name,
        birthday,
        gender,
        gestationalAge,
      });
    } else {
      await store?.addChild({ name, birthday, gender, dueDate, gestationalAge });
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

  return {
    showChildModal,
    setShowChildModal,
    editingChild,
    setEditingChild,
    handleSaveChild,
    handleDeleteChild,
  };
}
