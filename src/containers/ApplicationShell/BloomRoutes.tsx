import { lazy } from 'react';
import type { ApplicationState } from '~app/hooks/useApplicationState';
const LittleBloomPage = lazy(() => import('../LittleBloomPage'));
const LittleBloomWikiPage = lazy(() => import('../LittleBloomWikiPage'));
const PrenatalPage = lazy(() => import('../PrenatalPage'));

export function BloomRoutes({ state }: { state: ApplicationState }) {
  const {
    addChild,
    pregnancyChild,
    pregnancyPrenatalProgress,
    upsertPrenatalRecord,
    clearPrenatalRecord,
    recordBirth,
    currentPage,
  } = state;

  return (
    <>
      {currentPage === 'littlebloom' && (
        <LittleBloomPage
          currentChild={pregnancyChild}
          progress={pregnancyPrenatalProgress}
          onRecordBirth={recordBirth}
          // 孕期檔案就是「還沒出生的孩子」，所以走同一個 addChild；帶了
          // 預產期，資料層就會標成孕期檔案。共用資料層，不共用畫面。
          onAddPregnancy={(name, dueDate) =>
            addChild({ name, birthday: dueDate, dueDate })}
        />
      )}
      {currentPage === 'littlebloom/prenatal' && (
        <PrenatalPage
          currentChild={pregnancyChild}
          progress={pregnancyPrenatalProgress}
          onComplete={upsertPrenatalRecord}
          onUndo={clearPrenatalRecord}
        />
      )}
      {currentPage === 'littlebloom/wiki' && <LittleBloomWikiPage />}
    </>
  );
}
