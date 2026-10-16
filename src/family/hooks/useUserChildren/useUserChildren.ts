import { useChildSubscriptions } from './useChildSubscriptions';
import {
  subscribeRecord,
  removeRecord,
} from '~app/family/services/record_subscription';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { User } from 'firebase/auth';

/**
 * 訂閱這個帳號的孩子清單。
 *
 * 兩個 effect 而不是巢狀的 onValue：孩子的 listener 原本開在 users/{uid} 的
 * callback 裡，並在該 callback 內 return 一個清理函式——但 onValue 不看
 * callback 的回傳值，那個清理從來沒被呼叫過。users/{uid} 每變動一次（換孩子、
 * 新增、刪除都會寫它）就再疊一整組孩子 listener，舊的那組還活著，而且各自
 * 握著自己那份過期的名單。
 *
 * 不只是洩漏：舊 closure 被觸發時會拿它的舊名單去 setChildren，於是剛新增的
 * 孩子可能從畫面上消失、剛刪掉的又冒回來，而且發生與否取決於 Firebase 回呼
 * 的順序——正是那種在自己機器上重現不了的 bug。
 *
 * 拆成「聽帳號」與「聽名單裡的每個孩子」兩層之後，第二層的清理交給 React，
 * 名單一變就確實退訂舊的。每個孩子各自更新自己那一格，不再需要 loadedCount
 * 這種計數器。
 */
export function useUserChildren(user: User | null) {
  const [childIds, setChildIds] = useState<string[]>([]);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const [childrenById, setChildrenById] = useState<Record<string, ChildProfile>>({});
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  // 同一個孩子只補一次索引，不必每次快照都送一筆布林值。
  const indexedRef = useRef<Set<string>>(new Set());
  const [userLoaded, setUserLoaded] = useState(false);
  // 讀不到帳號的名單，與讀不到某個孩子，兩者都不等於「沒有孩子」。
  const [userError, setUserError] = useState(false);
  const [failedIds, setFailedIds] = useState<string[]>([]);

  // 這個帳號有哪些孩子、現在選了誰。
  useEffect(() => {
    if (!user) {
      setChildIds([]);
      setCurrentChildId(null);
      setChildrenById({});
      setReportedIds([]);
      setUserError(false);
      setUserLoaded(true);

      return;
    }

    setUserLoaded(false);
    setUserError(false);

    return subscribeRecord(
      `users/${user.uid}`,
      (snapshot) => {
        const userData = snapshot.val();

        setCurrentChildId(userData?.currentChildId ?? null);
        setChildIds(userData?.childrenIds ? Object.keys(userData.childrenIds) : []);
        setUserLoaded(true);
      },
      (error) => {
        // 沒有這個 callback，讀取被拒或斷線時 userLoaded 永遠停在 false，
        // 整個 app 就卡在載入畫面上，而且畫面上沒有任何線索。
        console.error('讀取寶寶名單失敗:', error);
        setUserError(true);
        setUserLoaded(true);
      },
    );
  }, [user]);

  // 名單裡每個孩子各一個 listener。key 用字串是為了讓 effect 只在名單真的
  // 變了才重跑，而不是每次 render 都因為新陣列而重訂閱。
  const childIdsKey = childIds.join(',');

  useChildSubscriptions({
    user,
    childIdsKey,
    indexedRef,
    setChildrenById,
    setReportedIds,
    setFailedIds,
  });

  // 順序跟著 childrenIds，而不是回呼抵達的先後，否則切換器每次刷新都可能重排。
  const children = useMemo(
    () =>
      childIds
        .map((id) => childrenById[id])
        .filter((child): child is ChildProfile => !!child),
    [childIds, childrenById],
  );

  // 每個 id 都回報過一次（存在、不存在或讀取失敗）才算載入完成。用「回報過」
  // 而不是「拿到資料」，殘留的孤兒 id 與讀不到的孩子才不會讓載入狀態卡住。
  const loading = !userLoaded || childIds.some((id) => !reportedIds.includes(id));

  /**
   * currentChildId 指向一個已經回報「不存在」的孩子時，把它清掉。
   *
   * 上面清的是 childrenIds，但選取狀態是另一個欄位。留著它，切換器會沒有任何
   * 一列被標示為選取中，而畫面其實已經退到另一個孩子上——兩邊講的不是同一件事。
   *
   * 條件必須是「回報過、不存在、而且不是讀取失敗」。只看 childrenById 有沒有
   * 的話，載入中的孩子也還不在裡面，那時候清掉會把正常的選取狀態一起清掉；
   * 而讀取失敗也算回報過，把它當成「不存在」就會因為一次斷線退掉選取的孩子。
   */
  useEffect(() => {
    if (!user || !currentChildId) {
      return;
    }

    if (!reportedIds.includes(currentChildId)) {
      return;
    }

    if (failedIds.includes(currentChildId)) {
      return;
    }

    if (currentChildId in childrenById) {
      return;
    }

    setCurrentChildId(null);

    removeRecord(`users/${user.uid}/currentChildId`).catch(() => {
      /* best-effort cleanup; ignore */
    });
  }, [user, currentChildId, reportedIds, failedIds, childrenById]);

  return {
    children,
    currentChildId,
    loading,
    /**
     * 帳號名單上的孩子數，直接數 childrenIds。
     *
     * 上限檢查不能用 children.length：那份陣列會濾掉還沒回報的孩子，於是
     * 第二個孩子還在載入時新增第三個會通過檢查，兩個孩子的上限就被繞過了。
     * loading 為 true 時這個數字還不權威（名單自己都還沒到），呼叫端要一起看。
     */
    childCount: childIds.length,
    /** 名單或某個孩子讀不到；這與「這個帳號沒有孩子」是兩件事。 */
    error: userError || failedIds.length > 0,
  };
}
