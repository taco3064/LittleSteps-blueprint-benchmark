import { useEffect, useMemo, useRef, useState } from 'react';
import { User } from '~app/domain/authUser';
import { ChildProfile } from '~app/domain/records';
import {
  clearSelectedChild,
  pruneChildReference,
  restoreChildIndex,
  subscribeChildProfile,
  subscribeUserChildren,
} from '~app/services/childSubscriptions';

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

  useUserIndex(user, {
    setChildIds,
    setCurrentChildId,
    setChildrenById,
    setReportedIds,
    setUserError,
    setUserLoaded,
  });

  // 名單裡每個孩子各一個 listener。key 用字串是為了讓 effect 只在名單真的
  // 變了才重跑，而不是每次 render 都因為新陣列而重訂閱。
  const childIdsKey = childIds.join(',');

  useEffect(() => {
    // childIdsKey 就是 childIds 的值語意，所以名單從 key 還原，deps 才誠實。
    const ids = childIdsKey ? childIdsKey.split(',') : [];

    if (!user || ids.length === 0) {
      setChildrenById({});
      setReportedIds([]);
      setFailedIds([]);

      return;
    }

    setReportedIds([]);
    setFailedIds([]);

    const unsubscribes = ids.map((childId) =>
      subscribeChildProfile(
        childId,
        (profile) => {
          if (profile) {
            // members 一定是個物件。分享視窗直接數 Object.keys(members).length，
            // 而搬遷之前建立的孩子還沒有這個節點——少了這一行，那份檔案一打開
            // 分享視窗就是一片白畫面。
            setChildrenById((prev) => ({
              ...prev,
              [childId]: { ...profile, members: profile.members ?? {} },
            }));

            // 補上加入用的公開索引。
            //
            // childIndex 之前不存在，所以既有的孩子都沒有條目——共享出去的代碼
            // 會查不到。規則要求寫索引的人已經是成員，而這個 listener 跑的正是
            // 「每一個我有權限的孩子」，所以這裡是唯一辦得到的一端；新建的孩子
            // 也走這條路，addChild 那一筆寫入當下還不是成員。與下面清理殘留
            // childrenIds 是同一個自癒模式。
            if (!indexedRef.current.has(childId)) {
              indexedRef.current.add(childId);

              restoreChildIndex(childId).catch(() => {
                // 補索引失敗不影響這一頁能不能用；放回去讓下次快照再試。
                indexedRef.current.delete(childId);
              });
            }
          } else {
            // 這個孩子不在了（例如建立者刪掉了共享的孩子）。安全規則只允許每個
            // 使用者寫自己的 childrenIds，所以殘留的參照只能由這一端清掉。
            setChildrenById((prev) => {
              if (!(childId in prev)) {
                return prev;
              }

              const next = { ...prev };

              delete next[childId];

              return next;
            });

            pruneChildReference(user.uid, childId).catch(() => {
              /* best-effort cleanup; ignore */
            });
          }

          setReportedIds((prev) =>
            prev.includes(childId) ? prev : [...prev, childId],
          );
        },
        (error) => {
          // 讀取失敗與「這個孩子不存在」必須分開處理，而可撤回的共享讓這件事
          // 更要緊：成員資格被別人移掉之後，這裡收到的就是一個
          // permission_denied，跟斷線長得一模一樣。上面那條分支會順手清掉
          // childrenIds 與 currentChildId，走錯邊就是一次斷線把孩子退掉；而共享
          // 真的被收回時，家長只會看到孩子無聲消失，連問對方都不知道要問什麼。
          // 這裡只回報「問過了」讓載入狀態走完，並記下是哪一個。
          console.error(`讀取寶寶資料失敗 (${childId}):`, error);

          setFailedIds((prev) =>
            prev.includes(childId) ? prev : [...prev, childId],
          );

          setReportedIds((prev) =>
            prev.includes(childId) ? prev : [...prev, childId],
          );
        },
      ),
    );

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };
  }, [user, childIdsKey]);

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
  useClearMissingSelection({
    user,
    currentChildId,
    reportedIds,
    failedIds,
    childrenById,
    setCurrentChildId,
  });

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

function useUserIndex(
  user: User | null,
  {
    setChildIds,
    setCurrentChildId,
    setChildrenById,
    setReportedIds,
    setUserError,
    setUserLoaded,
  }: {
    setChildIds: React.Dispatch<React.SetStateAction<string[]>>;
    setCurrentChildId: React.Dispatch<React.SetStateAction<string | null>>;
    setChildrenById: React.Dispatch<
      React.SetStateAction<Record<string, ChildProfile>>
    >;
    setReportedIds: React.Dispatch<React.SetStateAction<string[]>>;
    setUserError: React.Dispatch<React.SetStateAction<boolean>>;
    setUserLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  },
) {
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

    return subscribeUserChildren(
      user.uid,
      (userData) => {
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
  }, [
    user,
    setChildIds,
    setCurrentChildId,
    setChildrenById,
    setReportedIds,
    setUserError,
    setUserLoaded,
  ]);
}

function useClearMissingSelection({
  user,
  currentChildId,
  reportedIds,
  failedIds,
  childrenById,
  setCurrentChildId,
}: {
  user: User | null;
  currentChildId: string | null;
  reportedIds: string[];
  failedIds: string[];
  childrenById: Record<string, ChildProfile>;
  setCurrentChildId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
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

    clearSelectedChild(user.uid).catch(() => {
      /* best-effort cleanup; ignore */
    });
  }, [
    user,
    currentChildId,
    reportedIds,
    failedIds,
    childrenById,
    setCurrentChildId,
  ]);
}
