import { Download, Edit, Share2 } from 'lucide-react';
import { isPregnancyProfile } from '~app/family/domain/pregnancy';
import type { AccountSheetProps } from './types';

export function AccountChildRow({
  model,
  child,
}: Pick<AccountSheetProps, 'model'> & {
  child: AccountSheetProps['model']['childProfiles'][number];
}) {
  const {
    onSelectChild,
    currentChildId,
    onEditChild,
    exportingChildId,
    onShareChild,
    theme,
    handleExportChild,
  } = model;

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
        onClick={() => onSelectChild(child.id)}
        aria-current={child.id === currentChildId ? 'true' : undefined}
      >
        <span className="font-medium text-ink truncate">{child.name}</span>
        {/* 孕期檔案的 birthday 是預產期，外觀上與寶寶檔案無異；
                          沒有這個標記，切換器裡兩者分不出來。 */}
        {isPregnancyProfile(child) && (
          <span
            className={
              'tag bg-bloom-dusty-rose/15 ' + 'text-bloom-dusty-rose-ink shrink-0'
            }
          >
            孕期
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={() => onShareChild(child.id)}
        className="btn-icon"
        title="分享寶寶資料給家人"
        aria-label={`分享 ${child.name} 的資料給家人`}
      >
        <Share2 className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => onEditChild(child)}
        className="btn-icon"
        title="編輯寶寶資料"
        aria-label={`編輯 ${child.name} 的資料`}
      >
        <Edit className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => handleExportChild(child.id)}
        disabled={exportingChildId === child.id}
        className="btn-icon disabled:opacity-50"
        title="匯出寶寶的完整紀錄"
        aria-label={`匯出 ${child.name} 的資料`}
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
}
