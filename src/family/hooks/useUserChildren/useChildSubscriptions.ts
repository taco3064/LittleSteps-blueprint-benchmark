import {
  subscribeRecord,
  removeRecord,
  writeRecord,
} from '~app/family/services/record_subscription';
import { useEffect } from 'react';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { User } from 'firebase/auth';
import type { MutableRefObject, Dispatch, SetStateAction } from 'react';

export function useChildSubscriptions({
  user,
  childIdsKey,
  indexedRef,
  setChildrenById,
  setReportedIds,
  setFailedIds,
}: {
  user: User | null;
  childIdsKey: string;
  indexedRef: MutableRefObject<Set<string>>;
  setChildrenById: Dispatch<SetStateAction<Record<string, ChildProfile>>>;
  setReportedIds: Dispatch<SetStateAction<string[]>>;
  setFailedIds: Dispatch<SetStateAction<string[]>>;
}) {
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
      subscribeRecord(
        `children/${childId}`,
        (childSnapshot) => {
          if (childSnapshot.exists()) {
            const profile = childSnapshot.val() as ChildProfile;

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

              writeRecord(`childIndex/${childId}`, true).catch(() => {
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

            removeRecord(`users/${user.uid}/childrenIds/${childId}`).catch(() => {
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
          setFailedIds((prev) => (prev.includes(childId) ? prev : [...prev, childId]));

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
}
