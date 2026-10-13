import { useState } from 'react';
import { ChildProfile } from '~app/domain/records';
import ModalFrame from '~app/components/ModalFrame';
import { confirmDelete } from '~app/domain/confirmDelete';
import { goTo } from '~app/domain/navigate';

interface ShareChildUuidModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile | null;
  /** 失敗時 reject 且不 toast：訊息要留在這扇窗裡，家長才知道剛才那一下沒生效。 */
  revokeOtherMembers: (childId: string) => Promise<void>;
  setJoinOpen: (childId: string, open: boolean) => Promise<void>;
}

/**
 * 分享代碼就是寶寶資料的 id，換不掉；所以「收回分享」只能是移除其他帳號並關掉
 * 加入。這扇窗是家長唯一看得到、也唯一改得動存取權的地方，因此它先講有幾個帳號
 * 看得到，再給開關與代碼。
 */
export default function ShareChildUuidModal({
  isOpen,
  onClose,
  child,
  revokeOtherMembers,
  setJoinOpen,
}: ShareChildUuidModalProps) {
  const sharing = useSharingControl({ child, revokeOtherMembers, setJoinOpen });

  if (!sharing || !child) {
    return null;
  }

  const {
    memberCount,
    joinOpen,
    busy,
    handleCopy,
    handleToggleJoin,
    handleRevoke,
    pending,
    copied,
    error,
  } = sharing;

  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title="分享寶寶資料">
      <ShareMembershipSummary memberCount={memberCount} child={child} />

      <JoinAccessToggle
        joinOpen={joinOpen}
        busy={busy}
        handleToggleJoin={handleToggleJoin}
      />

      <ShareCodeInput child={child} />

      <button
        type="button"
        onClick={handleCopy}
        disabled={busy}
        className="btn-primary w-full disabled:opacity-60"
      >
        {pending === 'copy'
          ? '處理中…'
          : copied
            ? '已複製代碼'
            : joinOpen
              ? '複製代碼'
              : '開放加入並複製代碼'}
      </button>

      {error && (
        <p
          role="alert"
          className={
            'text-sm text-primary-dark bg-primary-light rounded-2xl px-4'
            + ' py-3 mt-3'
          }
        >
          {error}
        </p>
      )}

      <ShareInstructions />

      <p className="text-sm text-ink-muted">
        代碼就是這份寶寶資料的編號，換不了新的一組。要收回分享，只能移除其他帳號的存取權——移除時會一併關掉「開放用代碼加入」，流出去的舊代碼就再也加不進來。
      </p>

      {/* 把代碼交出去的這一刻，是家長最想知道「這份資料到底怎麼被保護」的時候。 */}
      <button
        type="button"
        onClick={() => {
          onClose();
          goTo('about');
        }}
        className="btn-ghost w-full mt-2 text-secondary-dark"
      >
        看看孩子的紀錄怎麼被保護
      </button>

      {memberCount > 1 && (
        <button
          type="button"
          onClick={handleRevoke}
          disabled={busy}
          className={
            'btn-ghost w-full mt-2 text-primary-dark'
            + ' hover:bg-primary-light disabled:opacity-50'
          }
        >
          {pending === 'revoke'
            ? '移除中…'
            : `移除其他 ${memberCount - 1} 個帳號的存取權`}
        </button>
      )}
    </ModalFrame>
  );
}

function JoinAccessToggle({
  joinOpen,
  busy,
  handleToggleJoin,
}: {
  joinOpen: boolean;
  busy: boolean;
  handleToggleJoin: () => Promise<void>;
}) {
  return (
    <div className="card bg-warm-white flex items-center justify-between gap-3 mb-4">
      <div className="min-w-0">
        <p className="font-medium text-ink">開放用代碼加入</p>
        <p className="text-sm text-ink-muted">
          {joinOpen
            ? '現在拿到代碼的人都能加入，家人加入後記得關掉。'
            : '現在就算有代碼也加不進來。'}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={joinOpen}
        aria-label="開放用代碼加入"
        disabled={busy}
        onClick={handleToggleJoin}
        className="h-tap flex items-center shrink-0 disabled:opacity-50"
      >
        <span
          className={`w-12 h-6 rounded-full flex items-center transition-colors ${
            joinOpen ? 'bg-secondary-dark' : 'bg-ink/25'
          }`}
        >
          <span
            className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              joinOpen ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </span>
      </button>
    </div>
  );
}

function ShareInstructions() {
  return (
    <div
      className={
        'bg-secondary-soft border border-secondary/40 rounded-2xl p-4' + ' mt-4 mb-4'
      }
    >
      <h3 className="text-ink mb-1.5">家人怎麼加入？</h3>
      <ol className="list-decimal list-inside space-y-1 text-sm text-ink-muted">
        <li>把代碼傳給家人（Line、訊息都可以）</li>
        <li>家人在「新增寶寶」選「加入寶寶」</li>
        <li>貼上代碼就能一起管理</li>
      </ol>
    </div>
  );
}

function ShareCodeInput({
  child,
}: {
  child: import('~app/domain/records').ChildProfile;
}) {
  return (
    <div className="mb-3">
      <label htmlFor="childCode" className="block text-sm font-medium text-ink mb-2">
        寶寶代碼
      </label>
      <input
        id="childCode"
        type="text"
        value={child.id}
        readOnly
        className={
          'w-full min-h-tap px-4 py-3 rounded-2xl border border-ink/15'
          + ' bg-warm-white font-mono text-sm text-ink select-all'
        }
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
    </div>
  );
}

function ShareMembershipSummary({
  memberCount,
  child,
}: {
  memberCount: number;
  child: import('~app/domain/records').ChildProfile;
}) {
  return (
    <div className="bg-primary-soft rounded-2xl p-4 mb-4">
      <p className="font-bold text-ink">
        {'目前有 '}
        {memberCount}
        {' 個帳號可以看到'}
        {child.name}
        的紀錄（包含你）
      </p>
      <p className="text-sm text-ink-muted mt-1">
        加入的人都能修改紀錄，也能移除其他帳號。
      </p>
    </div>
  );
}

function useSharingControl({
  child,
  revokeOtherMembers,
  setJoinOpen,
}: Pick<ShareChildUuidModalProps, 'child' | 'revokeOtherMembers' | 'setJoinOpen'>) {
  const [pending, setPending] = useState<'copy' | 'join' | 'revoke' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!child) {
    return null;
  }

  const memberCount = Object.keys(child.members).length;
  // 開關直接讀資料庫來的值，不留一份本地狀態：寫入失敗時它就不會停在
  // 資料庫沒有的位置上。
  const joinOpen = child.joinOpen === true;
  const busy = pending !== null;

  const handleCopy = async () => {
    setError(null);
    setPending('copy');
    let opened = joinOpen;

    try {
      // 先確定代碼真的能用，才把它交到家長手上：順序反過來的話，寫入失敗的人
      // 手上會有一組貼出去也加不進來的代碼，而且看不出哪裡不對。
      if (!opened) {
        await setJoinOpen(child.id, true);
        opened = true;
      }

      await navigator.clipboard.writeText(child.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        opened
          ? '複製失敗，請手動選取上方代碼'
          : '開放加入沒有成功，代碼現在還不能用，請再試一次',
      );
    } finally {
      setPending(null);
    }
  };

  const handleToggleJoin = async () => {
    setError(null);
    setPending('join');

    try {
      await setJoinOpen(child.id, !joinOpen);
    } catch {
      setError('設定沒有存到，開關維持原本的狀態，請再試一次');
    } finally {
      setPending(null);
    }
  };

  const handleRevoke = async () => {
    // 走共用的刪除確認：全 app 只有這一種攔阻的說法，收回存取權不該長出第二種。
    if (!confirmDelete(`其他 ${memberCount - 1} 個帳號的存取權`)) {
      return;
    }

    setError(null);
    setPending('revoke');

    try {
      await revokeOtherMembers(child.id);
    } catch {
      setError('移除沒有成功，其他帳號仍然看得到，請再試一次');
    } finally {
      setPending(null);
    }
  };

  return {
    memberCount,
    joinOpen,
    busy,
    handleCopy,
    handleToggleJoin,
    handleRevoke,
    pending,
    copied,
    error,
  };
}
