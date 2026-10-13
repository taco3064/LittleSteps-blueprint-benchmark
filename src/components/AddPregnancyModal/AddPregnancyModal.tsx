import AddChildModal from '../AddChildModal';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

interface AddPregnancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, dueDate: string) => Promise<void>;
}

/**
 * LittleBloom 自己的「新增孕期檔案」入口。
 *
 * 表單本身用共用的 AddChildModal——孩子資料是跨服務共通的，同一張表單沒有
 * 理由抄兩份。這裡只做兩件事：把分頁限定在孕期，以及換成 LittleBloom 的
 * 配色，讓視窗看起來屬於現在這個服務而不是 LittleSteps。
 *
 * 在這之前，唯一能新增孕期檔案的地方是 LittleSteps 的側邊欄，所以想用
 * LittleBloom 得先進另一個服務。
 */
export default function AddPregnancyModal({
  isOpen,
  onClose,
  onAdd,
}: AddPregnancyModalProps) {
  const theme = SERVICE_THEME.littlebloom;

  return (
    <AddChildModal
      isOpen={isOpen}
      onClose={onClose}
      modes={['pregnancy']}
      accent={theme.fill}
      accentText={theme.fillText}
      onSave={({ name, dueDate }) => {
        // pregnancy 分頁一定會帶預產期；沒有就不該送出。
        if (!dueDate) {
          return;
        }

        // 回傳 promise，讓 AddChildModal 等寫入成功才關視窗。原本是
        // `then(onClose)`，不論成敗都關——建立失敗的家長會以為孕期檔案建好了。
        return onAdd(name, dueDate);
      }}
    />
  );
}
