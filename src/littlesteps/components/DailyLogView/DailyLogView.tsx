import { motion } from 'framer-motion';

import { User } from 'firebase/auth';

import { DailyLog } from '~app/family/domain/familyRecords';

import QuickLogButtons, { type SleepMode } from '../QuickLogButtons';

import LogEntryModal from '../LogEntryModal';

import LogTimeline from '../LogTimeline';

import DaySelector from '../DaySelector';

import OpenSleepCard from '../OpenSleepCard';

import NightWakingsPrompt from '../NightWakingsPrompt';

import RepeatLastLog from '../RepeatLastLog';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { listItem, stagger } from '~app/platform/components/Motion';
interface DailyLogView3Props {
  handleQuickLog: (type: 'feeding' | 'sleep' | 'diaper') => void;
  sleepMode: SleepMode;
  isToday: boolean;
  lastFeeding: DailyLog | null;
  lastPumping: DailyLog | null;
  lastDiaper: DailyLog | null;
  handleRepeat: (log: DailyLog) => Promise<void>;
  openLogForm: (type: 'feeding' | 'sleep' | 'diaper') => void;
}

interface DailyLogView4Props {
  isToday: boolean;
  error: boolean;
  logs: DailyLog[];
  handleEdit: (log: DailyLog) => void;
  handleDelete: (logId: string, title: string) => Promise<void>;
  user: User | null;
  selectedDate: Date;
}

interface DailyLogView2Props {
  childSwitcher: import('react').ReactNode;
  selectedDate: Date;
  setJustClosedSleep: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  setSelectedDate: import('react').Dispatch<import('react').SetStateAction<Date>>;
  showOpenSleep: boolean;
  openSleep: DailyLog | null;
  handleWake: (log: DailyLog) => Promise<void>;
  handleEdit: (log: DailyLog) => void;
  justClosedSleep: DailyLog | null;
  handleRecordNightWakings: (log: DailyLog, nightWakings: number) => Promise<void>;
  isToday: boolean;
  stats: { label: string; count: number }[];
  handleQuickLog: (type: 'feeding' | 'sleep' | 'diaper') => void;
  sleepMode: SleepMode;
  lastFeeding: DailyLog | null;
  lastPumping: DailyLog | null;
  lastDiaper: DailyLog | null;
  handleRepeat: (log: DailyLog) => Promise<void>;
  openLogForm: (type: 'feeding' | 'sleep' | 'diaper') => void;
  error: boolean;
  logs: DailyLog[];
  handleDelete: (logId: string, title: string) => Promise<void>;
  user: User | null;
  modalType: 'feeding' | 'sleep' | 'diaper' | null;
  showModal: boolean;
  setShowModal: import('react').Dispatch<import('react').SetStateAction<boolean>>;
  setEditingLog: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  handleSave: (logData: Omit<DailyLog, 'id'>) => Promise<void>;
  editingLog: DailyLog | null;
  lastLogForForm: DailyLog | null;
}

export function DailyLogView() {
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

export function DailyLogView1() {
  return (
    <div className="screen">
      <div className="screen-body flex justify-center py-16">
        <div
          className="w-40 h-1 rounded-full bg-primary-light overflow-hidden"
          role="status"
        >
          <div
            className={
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

export function DailyLogView3({
  handleQuickLog, sleepMode, isToday, lastFeeding, lastPumping, lastDiaper,
  handleRepeat, openLogForm,
}: DailyLogView3Props) {
  return (
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
  );
}

export function DailyLogView4({
  isToday, error, logs, handleEdit, handleDelete, user, selectedDate,
}: DailyLogView4Props) {
  return (
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
  );
}

export function DailyLogView2({
  childSwitcher, selectedDate, setJustClosedSleep, setSelectedDate, showOpenSleep,
  openSleep, handleWake, handleEdit, justClosedSleep, handleRecordNightWakings,
  isToday, stats, handleQuickLog, sleepMode, lastFeeding, lastPumping, lastDiaper,
  handleRepeat, openLogForm, error, logs, handleDelete, user, modalType, showModal,
  setShowModal, setEditingLog, handleSave, editingLog, lastLogForForm,
}: DailyLogView2Props) {
  return (
    <div className="screen">
      <motion.div
        className="screen-body"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {childSwitcher}

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

        <DailyLogView3
          handleQuickLog={handleQuickLog}
          sleepMode={sleepMode}
          isToday={isToday}
          lastFeeding={lastFeeding}
          lastPumping={lastPumping}
          lastDiaper={lastDiaper}
          handleRepeat={handleRepeat}
          openLogForm={openLogForm}
        />

        <DailyLogView4
          isToday={isToday}
          error={error}
          logs={logs}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          user={user}
          selectedDate={selectedDate}
        />

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
