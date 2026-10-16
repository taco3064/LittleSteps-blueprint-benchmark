import { useState } from 'react';
import { DailyLog } from '~app/family/domain/familyRecords';

export function useDailyLogDraft() {
  const [showModal, setShowModal] = useState(false);

  const [modalType, setModalType] = useState<'feeding' | 'sleep' | 'diaper' | null>(
    null,
  );

  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  /**
   * 剛剛用「醒了」關掉的那一段。只活在這一次操作裡：想回答夜醒次數的人多按
   * 一下，直接走開的人什麼也沒記——而「沒記」跟「記了 0 次」本來就不一樣。
   *
   * 存的是寫進去的那份快照，不是 id：從 logs 重查會拿到監聽器還沒更新的舊值，
   * 而接著補夜醒次數的那一筆會把整個 data 寫回去，剛設好的結束時間就沒了。
   */
  const [justClosedSleep, setJustClosedSleep] = useState<DailyLog | null>(null);

  return {
    showModal, setShowModal, modalType, setModalType, editingLog, setEditingLog,
    selectedDate, setSelectedDate, justClosedSleep, setJustClosedSleep,
  };
}
