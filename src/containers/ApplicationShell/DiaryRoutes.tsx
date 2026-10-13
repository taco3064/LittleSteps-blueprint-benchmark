import { lazy } from 'react';
import type { ApplicationState } from '~app/hooks/useApplicationState';
const RemindersPage = lazy(() => import('../RemindersPage'));
const DiaryPage = lazy(() => import('../DiaryPage'));
const ToddlerWikiPage = lazy(() => import('../ToddlerWikiPage'));

export function DiaryRoutes({ state }: { state: ApplicationState }) {
  const {
    currentChild,
    addChild,
    joinChild,
    upsertCareTaskRecord,
    clearCareTaskRecord,
    addDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
    currentPage,
    careTasks,
    diaryEntries,
    reminderBadge,
  } = state;

  return (
    <>
      {currentPage === 'littleexplorer/reminders' && (
        <RemindersPage
          currentChild={currentChild}
          tasks={careTasks}
          reminderBadge={reminderBadge}
          onCompleteTask={upsertCareTaskRecord}
          onUndoTask={clearCareTaskRecord}
          onAddChild={(input) => addChild(input)}
          onJoinChild={joinChild}
        />
      )}
      {currentPage === 'littleexplorer/diary' && (
        <DiaryPage
          currentChild={currentChild}
          entries={diaryEntries}
          reminderBadge={reminderBadge}
          onAdd={addDiaryEntry}
          onUpdate={updateDiaryEntry}
          onDelete={deleteDiaryEntry}
          onAddChild={(input) => addChild(input)}
          onJoinChild={joinChild}
        />
      )}
      {currentPage === 'littleexplorer/wiki' && (
        <ToddlerWikiPage
          currentChild={currentChild}
          reminderBadge={reminderBadge}
        />
      )}
    </>
  );
}
