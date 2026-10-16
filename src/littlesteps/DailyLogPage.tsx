import { ChildSwitcher } from '~app/family';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { User } from 'firebase/auth';
import { createChildRecords } from '~app/family/services/child_records';
import { useToast } from '~app/platform/hooks/useToast';
import { ChildProfile } from '~app/family/domain/familyRecords';
import {
  DailyLogView,
  DailyLogView1,
  DailyLogView2,
} from '~app/littlesteps/components/DailyLogView';
import { useDailyLogDraft } from '~app/littlesteps/hooks/useDailyLogDraft';
import { createDailyLogHandlers } from './dailyLogHandlers';
import { getDailyLogViewModel } from '~app/littlesteps/domain/dailyLogViewModel';
import { useDailyLogs } from '~app/littlesteps/hooks/useDailyLogs';

interface DailyLogPageProps {
  currentChild?: ChildProfile | null;
  user: User | null;
}

export default function DailyLogPage({ currentChild, user }: DailyLogPageProps) {
  const toast = useToast();

  const {
    showModal, setShowModal, modalType, setModalType, editingLog, setEditingLog,
    selectedDate, setSelectedDate, justClosedSleep, setJustClosedSleep,
  } = useDailyLogDraft();

  // Load data
  const { logs, loading, error } = useDailyLogs(currentChild?.id || null, user);
  const firebaseChildren = createChildRecords(user?.uid || null);

  const {
    isToday, feedingCount, sleepCount, diaperCount, openSleep, showOpenSleep,
    sleepMode, lastFeeding, lastPumping, lastDiaper, lastLogForForm,
  } = getDailyLogViewModel({ logs, selectedDate, modalType });

  const {
    openLogForm, handleRepeat, handleQuickLog, handleWake, handleRecordNightWakings,
    handleSave, handleEdit, handleDelete,
  } = createDailyLogHandlers({
    setModalType, setEditingLog, setShowModal, toast, currentChild, isToday,
    openSleep, firebaseChildren, user, setJustClosedSleep, setSelectedDate,
    editingLog, justClosedSleep,
  });

  // No child selected
  if (!currentChild) {
    return <DailyLogView />;
  }

  // Loading state
  if (loading) {
    return <DailyLogView1 />;
  }

  const stats = [
    { label: '餵奶', count: feedingCount },
    { label: '睡眠', count: sleepCount },
    { label: '尿布', count: diaperCount },
  ];

  return (
    <DailyLogView2
      childSwitcher={
        <ChildSwitcher theme={SERVICE_THEME.littlesteps} className="mb-4" />
      }
      selectedDate={selectedDate}
      setJustClosedSleep={setJustClosedSleep}
      setSelectedDate={setSelectedDate}
      showOpenSleep={showOpenSleep}
      openSleep={openSleep}
      handleWake={handleWake}
      handleEdit={handleEdit}
      justClosedSleep={justClosedSleep}
      handleRecordNightWakings={handleRecordNightWakings}
      isToday={isToday}
      stats={stats}
      handleQuickLog={handleQuickLog}
      sleepMode={sleepMode}
      lastFeeding={lastFeeding}
      lastPumping={lastPumping}
      lastDiaper={lastDiaper}
      handleRepeat={handleRepeat}
      openLogForm={openLogForm}
      error={error}
      logs={logs}
      handleDelete={handleDelete}
      user={user}
      modalType={modalType}
      showModal={showModal}
      setShowModal={setShowModal}
      setEditingLog={setEditingLog}
      handleSave={handleSave}
      editingLog={editingLog}
      lastLogForForm={lastLogForForm}
    />
  );
}
