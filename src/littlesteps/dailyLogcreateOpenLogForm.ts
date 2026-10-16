import { DailyLog } from '~app/family/domain/familyRecords';

export function createOpenLogForm({
  setModalType, setEditingLog, setShowModal,
}: {
  setModalType: import('react').Dispatch<
    import('react').SetStateAction<'feeding' | 'sleep' | 'diaper' | null>
  >;
  setEditingLog: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  setShowModal: import('react').Dispatch<import('react').SetStateAction<boolean>>;
}) {
  return (type: 'feeding' | 'sleep' | 'diaper') => {
    setModalType(type);
    setEditingLog(null);
    setShowModal(true);
  };
}
