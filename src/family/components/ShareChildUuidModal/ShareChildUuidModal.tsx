import type { ChildProfile } from '~app/family/domain/familyRecords';
import ModalFrame from '~app/platform/components/ModalFrame';

import type { useShareChildUuidModal } from '~app/family/hooks/useShareChildUuidModal';

export interface ShareChildUuidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAbout: () => void;
  child: ChildProfile | null;
  /** 失敗時 reject 且不 toast：訊息要留在這扇窗裡，家長才知道剛才那一下沒生效。 */
  revokeOtherMembers: (childId: string) => Promise<void>;
  setJoinOpen: (childId: string, open: boolean) => Promise<void>;
}

export default function ShareChildUuidModalView({
  isOpen,
  onClose,
  child,
  pending,
  error,
  copied,
  memberCount,
  joinOpen,
  busy,
  handleCopy,
  handleToggleJoin,
  handleRevoke,
  onAbout,
}: NonNullable<ReturnType<typeof useShareChildUuidModal>>) {
  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title="分享寶寶資料">
      <ShareChildUuidModalSection1 {...{ child, memberCount }} />

      <ShareChildUuidModalSection2 {...{ joinOpen, busy, handleToggleJoin }} />

      <ShareChildUuidModalSection3 {...{ child }} />

      <ShareChildUuidModalSection4
        {...{ pending, copied, joinOpen, busy, handleCopy }}
      />

      {error && (
        <p
          role="alert"
          className={
            'text-sm text-primary-dark bg-primary-light ro' + 'unded-2xl px-4 py-3 mt-3'
          }
        >
          {error}
        </p>
      )}

      <div
        className={
          'bg-secondary-soft border border-secondary/40 ' + 'rounded-2xl p-4 mt-4 mb-4'
        }
      >
        <h3 className="text-ink mb-1.5">家人怎麼加入？</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-ink-muted">
          <li>把代碼傳給家人（Line、訊息都可以）</li>
          <li>家人在「新增寶寶」選「加入寶寶」</li>
          <li>貼上代碼就能一起管理</li>
        </ol>
      </div>

      <p className="text-sm text-ink-muted">
        代碼就是這份寶寶資料的編號，換不了新的一組。要收回分享，只能移除其他帳號的存取權——移除時會一併關掉「開放用代碼加入」，流出去的舊代碼就再也加不進來。
      </p>

      {/* 把代碼交出去的這一刻，是家長最想知道「這份資料到底怎麼被保護」的時候。 */}
      <button
        type="button"
        onClick={onAbout}
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
            'btn-ghost w-full mt-2 text-primary-dark hover'
            + ':bg-primary-light disabled:opacity-50'
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

function ShareChildUuidModalSection1({
  child,
  memberCount,
}: Pick<
  NonNullable<ReturnType<typeof useShareChildUuidModal>>,
  'child' | 'memberCount'
>) {
  return (
    <div className="bg-primary-soft rounded-2xl p-4 mb-4">
      <p className="font-bold text-ink">
        目前有
        {' '}
        {memberCount}
        {' '}
        個帳號可以看到
        {child.name}
        的紀錄（包含你）
      </p>
      <p className="text-sm text-ink-muted mt-1">
        加入的人都能修改紀錄，也能移除其他帳號。
      </p>
    </div>
  );
}

function ShareChildUuidModalSection2({
  joinOpen,
  busy,
  handleToggleJoin,
}: Pick<
  NonNullable<ReturnType<typeof useShareChildUuidModal>>,
  'joinOpen' | 'busy' | 'handleToggleJoin'
>) {
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

function ShareChildUuidModalSection3({
  child,
}: Pick<NonNullable<ReturnType<typeof useShareChildUuidModal>>, 'child'>) {
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
          'w-full min-h-tap px-4 py-3 rounded-2xl border'
          + ' border-ink/15 bg-warm-white font-mono text-s'
          + 'm text-ink select-all'
        }
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
    </div>
  );
}

function ShareChildUuidModalSection4({
  pending,
  copied,
  joinOpen,
  busy,
  handleCopy,
}: Pick<
  NonNullable<ReturnType<typeof useShareChildUuidModal>>,
  'pending' | 'copied' | 'joinOpen' | 'busy' | 'handleCopy'
>) {
  return (
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
  );
}
