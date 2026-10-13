import { useDailyLogState } from './useDailyLogState';
import { dailyLogView } from './dailyLogView';
import { createDailyLogActions } from './dailyLogActions';
import { motion } from 'framer-motion';
import { User } from '~app/domain/authUser';
import { ChildProfile, DailyLog } from '~app/domain/records';
import { useDailyLogs } from '~app/hooks/useDailyLogs';
import { createChildRepository } from '~app/services/childRepository';
import QuickLogButtons from '~app/components/QuickLogButtons';
import LogEntryModal from '~app/components/LogEntryModal';
import LogTimeline from '~app/components/LogTimeline';
import DaySelector from '~app/components/DaySelector';
import OpenSleepCard from '~app/components/OpenSleepCard';
import NightWakingsPrompt from '~app/components/NightWakingsPrompt';
import ChildSwitcher from '~app/components/ChildSwitcher';
import RepeatLastLog from '~app/components/RepeatLastLog';
import EmptyState from '~app/components/EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { stagger, listItem } from '~app/domain/motion';
import { useToast } from '~app/hooks/useToast';

interface DailyLogPageProps {
  currentChild?: ChildProfile | null;
  user: User | null;
}

export default function DailyLogPage({
  currentChild,
  user,
}: DailyLogPageProps) {
  const state = useDailyLogState();
  const { selectedDate, modalType } = state;

  const { logs, loading, error } = useDailyLogs(
    currentChild?.id || null,
    user,
  );

  const view = dailyLogView(logs, selectedDate, modalType);
  const toast = useToast();

  const actions = createDailyLogActions({
    currentChild,
    user,
    state,
    view,
    toast,
    repository: createChildRepository(user?.uid || null),
  });

  // No child selected
  if (!currentChild) {
    return <NoChildSelected />;
  }

  // Loading state
  if (loading) {
    return <DailyLogLoading />;
  }

  return <DailyLogContent {...{ state, view, actions, logs, user, error }} />;
}

function NoChildSelected() {
  return (
    <div className="screen">
      <div className="screen-body">
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="還沒有選擇寶寶"
          description="請先在側邊欄選擇或新增寶寶"
        />
      </div>
    </div>
  );
}

function DailyLogLoading() {
  return (
    <div className="screen">
      <div className="screen-body flex justify-center py-16">
        <div
          className="w-40 h-1 rounded-full bg-primary-light overflow-hidden"
          role="status"
        >
          <div className={
            'h-full w-1/3 rounded-full bg-primary-dark '
            + 'animate-[loading_1.2s_ease-in-out_infinite]'
          }
          />
          <span className="sr-only">載入中</span>
        </div>
      </div>
    </div>
  );
}

function DailyLogContent({
  state,
  view,
  actions,
  logs,
  user,
  error,
}: {
  state: ReturnType<typeof useDailyLogState>;
  view: ReturnType<typeof dailyLogView>;
  actions: ReturnType<typeof createDailyLogActions>;
  logs: DailyLog[];
  user: User | null;
  error: ReturnType<typeof useDailyLogs>['error'];
}) {
  const {
    showModal,
    setShowModal,
    modalType,
    editingLog,
    setEditingLog,
    selectedDate,
  } = state;

  const { isToday, lastLogForForm } = view;

  const { handleEdit, handleDelete, handleSave } = actions;

  return (
    <div className="screen">
      <motion.div
        className="screen-body"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <ChildSwitcher service="littlesteps" className="mb-4" />

        <DailyLogSleepStatus {...{ state, view, actions }} />
        <DailyLogSummary view={view} />
        <DailyLogQuickActions view={view} actions={actions} />
        <motion.div variants={listItem}>
          <h2 className="mb-3">{isToday ? '今日記錄' : '這天的記錄'}</h2>
          {/*
            讀取失敗時 logs 是空的，時間軸會說「今天還沒有記錄」——把「讀不到」
            講成「還沒記」，家長會以為剛剛存的東西不見了。
          */}
          {error
            ? (
                <div className="card">
                  <p className="text-sm text-ink-muted">
                    讀不到日常記錄，請確認網路後重新載入
                  </p>
                </div>
              )
            : (
                <LogTimeline
                  logs={logs}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUserId={user?.uid}
                  date={selectedDate}
                />
              )}
        </motion.div>

        {modalType && (
          <LogEntryModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingLog(null);
            }}
            onSave={handleSave}
            logType={modalType}
            editingLog={editingLog}
            lastLog={lastLogForForm}
          />
        )}
      </motion.div>
    </div>
  );
}

function DailyLogSummary({
  view,
}: {
  view: ReturnType<typeof dailyLogView>;
}) {
  const { feedingCount, sleepCount, diaperCount, isToday } = view;

  const stats = [
    { label: '餵奶', count: feedingCount },
    { label: '睡眠', count: sleepCount },
    { label: '尿布', count: diaperCount },
  ];

  return (
    <>
      <motion.div variants={listItem} className="card mb-6">
        <h2 className="mb-3">{isToday ? '今日統計' : '這天的統計'}</h2>
        <div className="flex justify-around">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary-dark">
                {stat.count}
              </div>
              <div className="text-sm text-ink-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

function DailyLogQuickActions({
  view,
  actions,
}: {
  view: ReturnType<typeof dailyLogView>;
  actions: ReturnType<typeof createDailyLogActions>;
}) {
  const { isToday, sleepMode, lastFeeding, lastPumping, lastDiaper } = view;
  const { handleQuickLog, handleRepeat, openLogForm } = actions;

  return (
    <>
      <motion.div variants={listItem} className="mb-6">
        <h2 className="mb-3">快速記錄</h2>
        <QuickLogButtons onLogClick={handleQuickLog} sleepMode={sleepMode} />
        {isToday && (
          <div className="mt-3">
            <RepeatLastLog
              lastFeeding={lastFeeding}
              lastPumping={lastPumping}
              lastDiaper={lastDiaper}
              onRepeat={handleRepeat}
            />
          </div>
        )}
        {/* 今天的睡眠鍵是「現在開始睡」，所以事後補一段完整睡眠需要自己的入口。 */}
        {isToday && (
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={() => openLogForm('sleep')}
              className="btn-ghost text-sm"
            >
              手動輸入睡眠時間
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}

function DailyLogSleepStatus({
  state,
  view,
  actions,
}: {
  state: ReturnType<typeof useDailyLogState>;
  view: ReturnType<typeof dailyLogView>;
  actions: ReturnType<typeof createDailyLogActions>;
}) {
  const {
    selectedDate,
    setSelectedDate,
    justClosedSleep,
    setJustClosedSleep,
  } = state;

  const { showOpenSleep, openSleep } = view;
  const { handleWake, handleEdit, handleRecordNightWakings } = actions;

  return (
    <>
      <motion.div variants={listItem} className="card mb-4">
        <DaySelector
          value={selectedDate}
          onChange={(date) => {
            setJustClosedSleep(null);
            setSelectedDate(date);
          }}
        />
      </motion.div>

      {showOpenSleep && openSleep && (
        <motion.div variants={listItem} className="mb-4">
          <OpenSleepCard
            log={openSleep}
            onWake={handleWake}
            onFixEndTime={handleEdit}
          />
        </motion.div>
      )}

      {justClosedSleep && (
        <motion.div variants={listItem} className="mb-4">
          <NightWakingsPrompt
            log={justClosedSleep}
            onRecord={handleRecordNightWakings}
            onOpenForm={(log) => {
              setJustClosedSleep(null);
              handleEdit(log);
            }}
            onDismiss={() => setJustClosedSleep(null)}
          />
        </motion.div>
      )}
    </>
  );
}
