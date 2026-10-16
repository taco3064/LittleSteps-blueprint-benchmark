import { DailyLog } from '~app/family/domain/familyRecords';

export function createHandleEdit({
  setEditingLog, setModalType, setShowModal,
}: {
  setEditingLog: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  setModalType: import('react').Dispatch<
    import('react').SetStateAction<'feeding' | 'sleep' | 'diaper' | null>
  >;
  setShowModal: import('react').Dispatch<import('react').SetStateAction<boolean>>;
}) {
  return (log: DailyLog) => {
    setEditingLog(log);
    setModalType(log.type);
    setShowModal(true);
  };
}
