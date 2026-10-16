import type { ToastApi } from '~app/platform/domain/toast';
import { User } from 'firebase/auth';
import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';
import { createHandleDelete } from './dailyLogcreateHandleDelete';
import { createHandleEdit } from './dailyLogcreateHandleEdit';
import { createHandleQuickLog } from './dailyLogcreateHandleQuickLog';
import { createHandleRecordNightWakings } from './dailyLogcreateHandleRecordNightWakings';
import { createHandleRepeat } from './dailyLogcreateHandleRepeat';
import { createHandleSave } from './dailyLogcreateHandleSave';
import { createHandleSleepQuickLog } from './dailyLogcreateHandleSleepQuickLog';
import { createHandleWake } from './dailyLogcreateHandleWake';
import { createOpenLogForm } from './dailyLogcreateOpenLogForm';
import { createReportWriteFailure } from './dailyLogcreateReportWriteFailure';

export function createDailyLogHandlers({
  setModalType, setEditingLog, setShowModal, toast, currentChild, isToday, openSleep,
  firebaseChildren, user, setJustClosedSleep, setSelectedDate, editingLog,
  justClosedSleep,
}: {
  setModalType: import('react').Dispatch<
    import('react').SetStateAction<'feeding' | 'sleep' | 'diaper' | null>
  >;
  setEditingLog: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  setShowModal: import('react').Dispatch<import('react').SetStateAction<boolean>>;
  toast: ToastApi;
  currentChild: ChildProfile | null | undefined;
  isToday: boolean;
  openSleep: DailyLog | null;
  firebaseChildren: ReturnType<
    typeof import('~app/family/services/child_records').createChildRecords
  >;
  user: User | null;
  setJustClosedSleep: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  setSelectedDate: import('react').Dispatch<import('react').SetStateAction<Date>>;
  editingLog: DailyLog | null;
  justClosedSleep: DailyLog | null;
}) {
  const openLogForm = createOpenLogForm({
    setModalType, setEditingLog, setShowModal,
  });

  const reportWriteFailure = createReportWriteFailure({ toast });

  const handleSleepQuickLog = createHandleSleepQuickLog({
    currentChild, isToday, openLogForm, openSleep, toast, firebaseChildren, user,
    setJustClosedSleep, setSelectedDate, reportWriteFailure,
  });

  const handleRepeat = createHandleRepeat({
    currentChild, firebaseChildren, user, setSelectedDate, reportWriteFailure,
  });

  const handleQuickLog = createHandleQuickLog({ handleSleepQuickLog, openLogForm });

  const handleWake = createHandleWake({
    currentChild, firebaseChildren, setJustClosedSleep, reportWriteFailure,
  });

  const handleRecordNightWakings = createHandleRecordNightWakings({
    currentChild, firebaseChildren, setJustClosedSleep, reportWriteFailure,
  });

  const handleSave = createHandleSave({
    currentChild, editingLog, user, firebaseChildren, setSelectedDate,
  });

  const handleEdit = createHandleEdit({ setEditingLog, setModalType, setShowModal });

  const handleDelete = createHandleDelete({
    currentChild, firebaseChildren, justClosedSleep, setJustClosedSleep, toast,
  });

  return {
    openLogForm, reportWriteFailure, handleSleepQuickLog, handleRepeat,
    handleQuickLog, handleWake, handleRecordNightWakings, handleSave, handleEdit,
    handleDelete,
  };
}
