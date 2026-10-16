import { ref, set, update, get } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

import { CHILD_LIMIT_MESSAGE, MAX_CHILDREN } from '~app/family/domain/childLimits';

export function createJoinChild(userId: string | null) {
  return async (childUuid: string, currentChildCount: number) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // 帳號層級的上限，見 common/childLimits。
    if (currentChildCount >= MAX_CHILDREN) {
      throw new Error(CHILD_LIMIT_MESSAGE);
    }

    // 只讀 childIndex，不讀 children。
    //
    // 以前這裡讀的是 children/{uuid} 本體，而那需要 children 的 .read 對任何
    // 登入者開放——於是任何人只要有 UUID 就能讀到別人孩子的完整健康紀錄，而
    // 這個 app 的共享機制正是把 UUID 傳給對方。childIndex 只存一個 true，
    // 恰好是加入流程唯一需要知道的事：這個代碼存不存在。
    const indexSnapshot = await get(ref(database, `childIndex/${childUuid}`));

    if (!indexSnapshot.exists()) {
      throw new Error('找不到此寶寶代碼，請確認代碼是否正確');
    }

    // Check if already joined
    const userChildRef = ref(database, `users/${userId}/childrenIds/${childUuid}`);
    const existingSnapshot = await get(userChildRef);

    if (existingSnapshot.exists()) {
      throw new Error('您已經加入此寶寶');
    }

    await joinMembership(childUuid, userId);

    await set(userChildRef, true);

    await selectFirstChild(userId, childUuid, currentChildCount);

    return childUuid;
  };
}

async function joinMembership(childUuid: string, userId: string) {
  try {
    await set(ref(database, `children/${childUuid}/members/${userId}`), true);
  } catch (error) {
    // 代碼查得到，成員資格卻寫不進去，就只剩一個原因：對方沒有開放加入。
    // 這跟「代碼打錯」是兩件事；講成同一句話，家長會一直去核對一組沒有錯的
    // 代碼，而真正該做的是請對方把共享打開。
    console.error('加入寶寶失敗（成員資格被拒）:', error);

    throw new Error('這個寶寶目前未開放加入，請對方在分享視窗中開啟共享後再試');
  }
}

async function selectFirstChild(
  userId: string,
  childUuid: string,
  currentChildCount: number,
) {
  // 如果是第一個孩子，自動設為 currentChildId
  if (currentChildCount === 0) {
    const userRef = ref(database, `users/${userId}`);

    await update(userRef, {
      currentChildId: childUuid,
    });
  }
}
