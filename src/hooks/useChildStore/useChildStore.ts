import { useMemo } from 'react';
import type { User } from '~app/domain/authUser';
import type { ChildStore } from '~app/domain/childStore';
import { resolvePregnancyChild } from '~app/domain/pregnancy';
import type {
  DevelopmentCheckProgress,
  MilestoneProgress,
  PrenatalCheckupProgress,
  ToothProgress,
  VaccineProgress,
} from '~app/domain/records';
import { useToast } from '../useToast';
import { createChildStoreActions } from '~app/services/childStoreActions';
import { createChildRepository } from '~app/services/childRepository';
import { useUserChildren } from '../useUserChildren';

export function useChildStore(user: User | null): ChildStore {
  const toast = useToast();

  const {
    children: childProfiles,
    currentChildId,
    loading: childrenLoading,
    childCount,
  } = useUserChildren(user);

  const firebaseChildren = createChildRepository(user?.uid || null);

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

  return {
    ...createChildStoreActions({
      user,
      currentChild,
      currentChildMilestoneProgress,
      currentChildVaccineProgress,
      currentChildDevelopmentProgress,
      currentChildToothProgress,
      childCount,
      childProfiles,
      pregnancyChild,
      firebaseChildren,
      toast,
    }),
    childProfiles,
    currentChildId,
    currentChild,
    currentChildMilestoneProgress,
    currentChildVaccineProgress,
    currentChildDevelopmentProgress,
    currentChildToothProgress,
    childrenLoading,
    // 直接轉手，不包一層：這裡沒有什麼要加的，錯誤要原樣讓呼叫端看見。
    readChildExport: firebaseChildren.readChildExport,
    pregnancyChild,
    pregnancyPrenatalProgress,
  };
}
