import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DAILY_LOG_NOTES_LIMIT } from '~app/family/domain/recordLimits';
import { backdrop, sheet } from '~app/platform/components/Motion';
import { FIELD } from './FIELD';
import { LABEL } from './LABEL';
import { LogEntryModalPresentation1 } from './LogEntryModalPresentation1';
import { LogEntryModalPresentation3 } from './LogEntryModalPresentation3';
import { LogEntryModalPresentation6 } from './LogEntryModalPresentation6';
import { LogEntryModalPresentationProps } from './LogEntryModalPresentationProps';
interface LogEntryFieldsProps {
  handleSubmit: (e: React.FormEvent<Element>) => Promise<void>;
  logType: 'feeding' | 'sleep' | 'diaper';
  timestamp: string;
  setTimestamp: React.Dispatch<React.SetStateAction<string>>;
  feedingType:
    | 'solid'
    | 'breast_left'
    | 'breast_right'
    | 'breast_both'
    | 'breast_milk_bottle'
    | 'formula'
    | 'pumping';
  setFeedingType: React.Dispatch<
    React.SetStateAction<
      | 'solid'
      | 'breast_left'
      | 'breast_right'
      | 'breast_both'
      | 'breast_milk_bottle'
      | 'formula'
      | 'pumping'
    >
  >;
  isPumping: boolean;
  side: '' | NonNullable<'left' | 'right' | 'both' | undefined>;
  setSide: React.Dispatch<
    React.SetStateAction<'' | NonNullable<'left' | 'right' | 'both' | undefined>>
  >;
  duration: string;
  setDuration: React.Dispatch<React.SetStateAction<string>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  startTime: string;
  setStartTime: React.Dispatch<React.SetStateAction<string>>;
  endTime: string;
  setEndTime: React.Dispatch<React.SetStateAction<string>>;
  hasSleepRange: boolean;
  sleepRangeError:
    '結束時間要晚於開始時間；睡到隔天的話，結束時間請選隔天的日期。' | null;
  stepNightWakings: (delta: number) => void;
  nightWakings: string;
  setNightWakings: React.Dispatch<React.SetStateAction<string>>;
  diaperType: 'both' | 'pee' | 'poop';
  setDiaperType: React.Dispatch<React.SetStateAction<'both' | 'pee' | 'poop'>>;
  consistency: 'normal' | 'soft' | 'hard' | undefined;
  setConsistency: React.Dispatch<
    React.SetStateAction<'normal' | 'soft' | 'hard' | undefined>
  >;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  isSubmitting: boolean;
  error: string | null;
  editingLog: import('~app/family/domain/familyRecords').DailyLog | null | undefined;
}

export function LogEntryModalPresentation({
  isOpen, onClose, getTitle, handleSubmit, logType, timestamp, setTimestamp,
  feedingType, setFeedingType, isPumping, side, setSide, duration, setDuration,
  amount, setAmount, startTime, setStartTime, endTime, setEndTime, hasSleepRange,
  sleepRangeError, stepNightWakings, nightWakings, setNightWakings, diaperType,
  setDiaperType, consistency, setConsistency, notes, setNotes, isSubmitting, error,
  editingLog,
}: LogEntryModalPresentationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            {...backdrop}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/*
            A bottom sheet, like every other modal in the app. This one used to be
            a centred dialog with no scroll, so on a phone with the keyboard up the
            submit button was unreachable — and it is the most-used form here.
          */}
          <motion.div
            {...sheet}
            className={
              'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[85vh] '
              + 'overflow-y-auto'
            }
          >
            <div
              className={
                'sticky top-0 bg-white border-b border-ink/10 px-4 py-3 flex '
                + 'items-center justify-between'
              }
            >
              <h2>{getTitle()}</h2>
              <button onClick={onClose} className="btn-icon" aria-label="關閉">
                <X className="w-5 h-5" />
              </button>
            </div>

            <LogEntryFields
              handleSubmit={handleSubmit}
              logType={logType}
              timestamp={timestamp}
              setTimestamp={setTimestamp}
              feedingType={feedingType}
              setFeedingType={setFeedingType}
              isPumping={isPumping}
              side={side}
              setSide={setSide}
              duration={duration}
              setDuration={setDuration}
              amount={amount}
              setAmount={setAmount}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              hasSleepRange={hasSleepRange}
              sleepRangeError={sleepRangeError}
              stepNightWakings={stepNightWakings}
              nightWakings={nightWakings}
              setNightWakings={setNightWakings}
              diaperType={diaperType}
              setDiaperType={setDiaperType}
              consistency={consistency}
              setConsistency={setConsistency}
              notes={notes}
              setNotes={setNotes}
              isSubmitting={isSubmitting}
              error={error}
              editingLog={editingLog}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LogEntryFields({
  handleSubmit, logType, timestamp, setTimestamp, feedingType, setFeedingType,
  isPumping, side, setSide, duration, setDuration, amount, setAmount, startTime,
  setStartTime, endTime, setEndTime, hasSleepRange, sleepRangeError,
  stepNightWakings, nightWakings, setNightWakings, diaperType, setDiaperType,
  consistency, setConsistency, notes, setNotes, isSubmitting, error, editingLog,
}: LogEntryFieldsProps) {
  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {logType === 'feeding' && (
        <LogEntryModalPresentation1
          timestamp={timestamp}
          setTimestamp={setTimestamp}
          feedingType={feedingType}
          setFeedingType={setFeedingType}
          isPumping={isPumping}
          side={side}
          setSide={setSide}
          duration={duration}
          setDuration={setDuration}
          amount={amount}
          setAmount={setAmount}
        />
      )}

      {logType === 'sleep' && (
        <LogEntryModalPresentation3
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          hasSleepRange={hasSleepRange}
          sleepRangeError={sleepRangeError}
          stepNightWakings={stepNightWakings}
          nightWakings={nightWakings}
          setNightWakings={setNightWakings}
        />
      )}

      {logType === 'diaper' && (
        <LogEntryModalPresentation6
          timestamp={timestamp}
          setTimestamp={setTimestamp}
          diaperType={diaperType}
          setDiaperType={setDiaperType}
          consistency={consistency}
          setConsistency={setConsistency}
        />
      )}

      <div>
        <label htmlFor="log-notes" className={LABEL}>
          備註
        </label>
        <textarea
          id="log-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${FIELD} resize-none`}
          rows={3}
          placeholder="選填"
          maxLength={DAILY_LOG_NOTES_LIMIT}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || sleepRangeError !== null}
        className="btn-primary w-full"
      >
        {isSubmitting ? '儲存中...' : editingLog ? '更新' : '儲存'}
      </button>
    </form>
  );
}
