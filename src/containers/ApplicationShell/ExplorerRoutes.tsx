import { lazy } from 'react';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import type { ApplicationState } from '~app/hooks/useApplicationState';
const DevelopmentPage = lazy(() => import('../DevelopmentPage'));

export function ExplorerRoutes({ state }: { state: ApplicationState }) {
  const {
    currentChild,
    addChild,
    joinChild,
    currentChildDevelopmentProgress,
    currentChildToothProgress,
    toggleDevelopmentCheck,
    toggleTooth,
    addDiaryEntry,
    currentPage,
    reminderBadge,
  } = state;

  return (
    <>
      {currentPage === 'littleexplorer' && (
        <DevelopmentPage
          currentChild={currentChild}
          progress={currentChildDevelopmentProgress}
          toothProgress={currentChildToothProgress}
          reminderBadge={reminderBadge}
          onToggleCheck={toggleDevelopmentCheck}
          onToggleTooth={toggleTooth}
          onQuickDiary={async (content, linkedCheckItemId) => {
            await addDiaryEntry({
              date: toLocalDateKey(),
              content,
              linkedCheckItemId,
            });
          }}
          onAddChild={(input) => addChild(input)}
          onJoinChild={joinChild}
        />
      )}
    </>
  );
}
