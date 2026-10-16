import { FoodTrialModalPresentationProps } from './FoodTrialModalPresentationProps';

export function FoodTrialModalPresentationSection7({
  onClose, handleSave, saving, editingFood,
}: Pick<
  FoodTrialModalPresentationProps,
  'onClose' | 'handleSave' | 'saving' | 'editingFood'
>) {
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onClose} className="btn-secondary flex-1">
        取消
      </button>
      <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
        {saving ? '儲存中...' : editingFood ? '更新' : '儲存'}
      </button>
    </div>
  );
}
