import { useToggleMilestone } from './toggleMilestone';
import { useSetVaccineDose } from './setVaccineDose';
import { useAddChild } from './addChild';
import { useJoinChild } from './joinChild';
import { useUpdateChild } from './updateChild';
import { useDeleteChild } from './deleteChild';
import { useDeleteAccountData } from './deleteAccountData';
import { useRevokeOtherMembers } from './revokeOtherMembers';
import { useSetJoinOpen } from './setJoinOpen';
import { useSetCurrentChild } from './setCurrentChild';
import { useToggleDevelopmentCheck } from './toggleDevelopmentCheck';
import { useToggleTooth } from './toggleTooth';
import { useUpsertPrenatalRecord } from './upsertPrenatalRecord';
import { useClearPrenatalRecord } from './clearPrenatalRecord';
import { useRecordBirth } from './recordBirth';
import { useUpsertCareTaskRecord } from './upsertCareTaskRecord';
import { useClearCareTaskRecord } from './clearCareTaskRecord';
import { useAddDiaryEntry } from './addDiaryEntry';
import { useUpdateDiaryEntry } from './updateDiaryEntry';
import { useDeleteDiaryEntry } from './deleteDiaryEntry';
import { useMemo } from 'react';
import type { ChildStore } from '~app/family/domain/childStore';
import type { User } from 'firebase/auth';
import type {
  DevelopmentCheckProgress,
  MilestoneProgress,
  PrenatalCheckupProgress,
  ToothProgress,
  VaccineProgress,
} from '~app/family/domain/familyRecords';

import { resolvePregnancyChild } from '~app/family/domain/pregnancy';

import { useToast } from '~app/platform/hooks/useToast';
import { useUserChildren } from '../useUserChildren';
import { createChildRecords } from '~app/family/services/child_records';
export type { ChildStore } from '~app/family/domain/childStore';

/**
 * Single source of truth for child-profile state and mutations, backed by
 * Firebase. Login is mandatory, so there is no LocalStorage/guest branch:
 * unauthenticated callers get empty data and no-op mutators.
 */
export function useChildStore(user: User | null): ChildStore {
  const toast = useToast();

  const {
    children: childProfiles,
    currentChildId,
    loading: childrenLoading,
    childCount,
  } = useUserChildren(user);

  const firebaseChildren = createChildRecords(user?.uid || null);

  /**
   * currentChildId 可能指著一個已經不存在的孩子：共享的孩子被建立者刪掉之後，
   * 這一端的 childrenIds 會自癒，但 currentChildId 不會——安全規則只允許
   * 每個使用者寫自己那份，執行刪除的人碰不到別人的 currentChildId。
   *
   * 少了這個 fallback，畫面會說「還沒有選擇寶寶」，即使家長明明還有另一個孩子。
   * 名單真的空的時候維持 undefined：那時候「沒有孩子」是事實。
   */
  const currentChild = useMemo(
    () =>
      childProfiles.find((child) => child.id === currentChildId) ?? childProfiles[0],
    [childProfiles, currentChildId],
  );

  const currentChildMilestoneProgress: MilestoneProgress = useMemo(
    () => (currentChild ? currentChild.milestoneProgress || {} : {}),
    [currentChild],
  );

  const currentChildVaccineProgress: VaccineProgress = useMemo(
    () => (currentChild ? currentChild.vaccineProgress || {} : {}),
    [currentChild],
  );

  const currentChildDevelopmentProgress: DevelopmentCheckProgress = useMemo(
    () => (currentChild ? currentChild.developmentProgress || {} : {}),
    [currentChild],
  );

  const currentChildToothProgress: ToothProgress = useMemo(
    () => (currentChild ? currentChild.toothProgress || {} : {}),
    [currentChild],
  );

  const pregnancyChild = useMemo(
    () => resolvePregnancyChild(childProfiles, currentChild),
    [childProfiles, currentChild],
  );

  const pregnancyPrenatalProgress: PrenatalCheckupProgress = useMemo(
    () => pregnancyChild?.prenatalProgress || {},
    [pregnancyChild],
  );

  const actionContext = {
    user,
    toast,
    firebaseChildren,
    currentChild,
    currentChildMilestoneProgress,
    currentChildVaccineProgress,
    childCount,
    childProfiles,
    currentChildDevelopmentProgress,
    currentChildToothProgress,
    pregnancyChild,
  };

  return {
    childProfiles,
    currentChildId,
    currentChild,
    currentChildMilestoneProgress,
    currentChildVaccineProgress,
    currentChildDevelopmentProgress,
    currentChildToothProgress,
    childrenLoading,
    toggleMilestone: useToggleMilestone(actionContext),
    setVaccineDose: useSetVaccineDose(actionContext),
    addChild: useAddChild(actionContext),
    joinChild: useJoinChild(actionContext),
    updateChild: useUpdateChild(actionContext),
    deleteChild: useDeleteChild(actionContext),
    // 直接轉手，不包一層：這裡沒有什麼要加的，錯誤要原樣讓呼叫端看見。
    readChildExport: firebaseChildren.readChildExport,
    deleteAccountData: useDeleteAccountData(actionContext),
    revokeOtherMembers: useRevokeOtherMembers(actionContext),
    setJoinOpen: useSetJoinOpen(actionContext),
    setCurrentChild: useSetCurrentChild(actionContext),
    toggleDevelopmentCheck: useToggleDevelopmentCheck(actionContext),
    toggleTooth: useToggleTooth(actionContext),
    pregnancyChild,
    pregnancyPrenatalProgress,
    upsertPrenatalRecord: useUpsertPrenatalRecord(actionContext),
    clearPrenatalRecord: useClearPrenatalRecord(actionContext),
    recordBirth: useRecordBirth(actionContext),
    upsertCareTaskRecord: useUpsertCareTaskRecord(actionContext),
    clearCareTaskRecord: useClearCareTaskRecord(actionContext),
    addDiaryEntry: useAddDiaryEntry(actionContext),
    updateDiaryEntry: useUpdateDiaryEntry(actionContext),
    deleteDiaryEntry: useDeleteDiaryEntry(actionContext),
  };
}
