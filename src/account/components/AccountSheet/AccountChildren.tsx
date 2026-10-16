import { AccountChildRow } from './AccountChildRow';
import { CHILD_LIMIT_MESSAGE } from '~app/family/domain/childLimits';
import type { AccountSheetProps } from './types';

export function AccountChildren({ model }: AccountSheetProps) {
  const {
    user,
    childProfiles,
    onAddChild,
    showChildren,
    canAddChild,
  } = model;

  return (
    <>
      {showChildren && user && (
        <div>
          <h3 className="mb-2">我的寶寶</h3>
          <div className="space-y-2">
            {childProfiles.length === 0 && (
              <p className="text-sm text-ink-muted px-1">還沒有寶寶資料</p>
            )}

            {childProfiles.map((child) => (
              <AccountChildRow key={child.id} model={model} child={child} />
            ))}

            <button
              type="button"
              onClick={onAddChild}
              disabled={!canAddChild}
              className={
                'btn-secondary w-full disabled:opacity-50 '
                + 'disabled:cursor-not-allowed'
              }
              title={canAddChild ? '新增寶寶' : CHILD_LIMIT_MESSAGE}
            >
              新增寶寶
            </button>
          </div>
        </div>
      )}
    </>
  );
}
