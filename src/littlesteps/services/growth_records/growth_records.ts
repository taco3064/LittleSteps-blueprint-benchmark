import { onValue, ref, remove, set, update } from 'firebase/database';
import type { GrowthRecord } from '~app/family/domain/familyRecords';
import {
  sortRecordsByDate,
  validateRecord,
} from '~app/littlesteps/domain/growthRecords';
import {
  changedFields,
  removeUndefined,
  toUpdatePaths,
} from '~app/platform/domain/firebaseData';
import { database } from '~app/platform/services/firebase';

export function createGrowthActions(
  childId: string | null,
  storedRecords: GrowthRecord[],
) {
  const addRecord = async (record: Omit<GrowthRecord, 'id'>): Promise<void> => {
    if (!childId) {
      throw new Error('No child selected');
    }

    validateRecord(record);

    const newRecord: GrowthRecord = {
      ...record,
      id: crypto.randomUUID(),
      // 表單送的是 {}；不存，讀取時算。
      percentile: undefined,
    };

    const recordRef = ref(
      database,
      `childRecords/${childId}/growthRecords/${newRecord.id}`,
    );

    await set(recordRef, removeUndefined(newRecord));
  };

  /**
   * 改一筆測量：只寫真的改到的欄位。
   *
   * 原本是拿手上那一版加上這次的欄位、重算百分位、set 整筆。兩位照顧者各補一
   * 項測量時，後到的那一筆連著他手上沒有另一項的舊版蓋回去，對方剛量的數字就
   * 沒了，而且兩邊都不會看到任何提示。改成攤平成 <欄位> 一條一條 update()，
   * 各改各的欄位就會合併——跟 createChildRecords.updateDailyLog 同一套。
   *
   * 比對的基準是 opened——表單打開時帶入的那一版，不是 listener 最新的那一版。
   * 表單每個欄位都送、沒填的送 undefined，而對方存的合併結果會在表單還開著的
   * 時候抵達畫面：拿最新的那一版當基準，對方剛補的身高在我表單裡是空白，存下
   * 去就變成 height: null，把它清掉。拿打開時那一版當基準，沒動過的空白兩邊都
   * 是 undefined，什麼都不寫——跟 DailyLogPage 拿 editingLog 給 dailyLogChanges
   * 是同一件事。
   *
   * 「這一筆還在不在」則要看 listener 最新的那一版，不是 opened：對方在表單開
   * 著的時候把它刪了，PATCH 打在已經不存在的節點上會被規則收下（合併後有
   * date 就夠，id 與 childId 都不是必填），寫回來的那一筆沒有 id——列表以
   * undefined 當 key，刪除鍵指向 growthRecords/undefined，一筆誰都刪不掉的
   * 健康紀錄。所以存在與否查 store，比對的基準才是 opened。
   *
   * percentile 兩邊都先拿掉再比：寫入端不存它，但舊紀錄存著的那一份也不能因
   * 為表單送了 {} 就被寫成 null。送進來卻是 undefined 的欄位是「清掉」，寫
   * null；沒送的欄位不動。沒有任何欄位改到就不寫。
   */
  const updateRecord = async (
    recordId: string,
    updates: Partial<Omit<GrowthRecord, 'id' | 'childId'>>,
    opened: GrowthRecord,
  ): Promise<void> => {
    if (!childId) {
      throw new Error('No child selected');
    }

    if (!storedRecords.some((record) => record.id === recordId)) {
      throw new Error('Record not found');
    }

    validateRecord({ ...opened, ...updates });

    const submitted: Record<string, unknown> = { ...updates };

    delete submitted.percentile;
    const before: Record<string, unknown> = {};

    for (const key of Object.keys(submitted)) {
      before[key] = (opened as unknown as Record<string, unknown>)[key];
    }

    const paths = toUpdatePaths(changedFields(before, submitted));

    if (Object.keys(paths).length === 0) {
      return;
    }

    const recordRef = ref(
      database,
      `childRecords/${childId}/growthRecords/${recordId}`,
    );

    await update(recordRef, paths);
  };

  const deleteRecord = async (recordId: string): Promise<void> => {
    if (!childId) {
      throw new Error('No child selected');
    }

    const recordRef = ref(
      database,
      `childRecords/${childId}/growthRecords/${recordId}`,
    );

    await remove(recordRef);
  };

  return { addRecord, updateRecord, deleteRecord };
}

export function subscribeGrowthRecords(
  childId: string,
  callbacks: {
    onRecords: (records: GrowthRecord[]) => void;
    onError: (error: unknown) => void;
  },
) {
  return onValue(
    ref(database, `childRecords/${childId}/growthRecords`),
    (snapshot) => {
      const data = snapshot.val();

      callbacks.onRecords(
        data ? sortRecordsByDate(Object.values(data) as GrowthRecord[]) : [],
      );
    },
    callbacks.onError,
  );
}
