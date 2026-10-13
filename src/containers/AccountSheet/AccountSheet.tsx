import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { backdrop, sheet } from '~app/domain/motion';
import { goTo } from '~app/domain/navigate';
import { SERVICE_THEME, type ServiceId } from '~app/domain/serviceTheme';
import { useAuth } from '~app/hooks/useAuth';
import { useOptionalChildStore } from '~app/hooks/useChildStoreContext';
import { useDialogA11y } from '~app/hooks/useDialogA11y';
import AccountChildren from './AccountChildren';
import AccountIdentity from './AccountIdentity';
import DeleteAccountButton from './DeleteAccountButton';

/**
 * 讀不讀某個孩子的資料，決定這個服務該不該顯示切換器。
 *
 * 親子館名冊、哺乳室地圖與疫情雷達不看孩子，在那裡放一個切換器等於暗示它會
 * 改變畫面上的東西——不會。帳號本身則到處都要能碰到，登出不該只在某一個服務裡有。
 */
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

export default function AccountSheet({ service, onClose }: AccountSheetProps) {
  const { user } = useAuth();
  const store = useOptionalChildStore();
  const dialogRef = useDialogA11y(true, onClose);
  const theme = SERVICE_THEME[service];
  const showChildren = SERVICE_USES_CHILD[service] && store !== null;

  return (
    <>
      <motion.div
        {...backdrop}
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 z-40"
      />
      <motion.div
        {...sheet}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="帳號與寶寶"
        tabIndex={-1}
        className={
          'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50'
          + ' max-h-[85vh] overflow-y-auto'
        }
      >
        <div
          className={
            'sticky top-0 bg-white border-b border-ink/10 px-4 py-3 flex'
            + ' items-center justify-between gap-3'
          }
        >
          <h2>帳號與寶寶</h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="btn-icon bg-ink/5 hover:bg-ink/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <AccountIdentity onClose={onClose} />

          {/* 已登入的家長想確認資料怎麼被保護時，會來這裡找；未登入的人也
              該在交出帳號之前就看得到。 */}
          <button
            type="button"
            onClick={() => {
              goTo('about');
              onClose();
            }}
            className="btn-ghost w-full justify-between px-4"
          >
            <span className="text-ink">關於資料</span>
            <span className="text-sm text-ink-faint">存在哪裡、誰看得到</span>
          </button>

          {showChildren && user && <AccountChildren theme={theme} />}

          {/* 放在整張表的最後，離右上角的登出最遠：兩個動作的後果差得太多，
              擠在一起就會有人誤按。整句文字而不是圖示——這裡沒有任何圖示
              說得比字清楚，而且它不該看起來像一個順手的動作。 */}
          <DeleteAccountButton onClose={onClose} />
        </div>
      </motion.div>
    </>
  );
}
