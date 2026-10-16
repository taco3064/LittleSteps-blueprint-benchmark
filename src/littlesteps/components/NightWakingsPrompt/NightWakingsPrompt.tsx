import { X } from 'lucide-react';
import { useState } from 'react';
import { calculateDuration, formatDuration } from '~app/platform/domain/calendar';
import { DailyLog, SleepData } from '~app/family/domain/familyRecords';

interface NightWakingsPromptProps {
  /** The sleep session the parent just closed from the live card. */
  log: DailyLog;
  onRecord: (log: DailyLog, nightWakings: number) => void | Promise<void>;
  /** More wakings than the choices offer: fall through to the form. */
  onOpenForm: (log: DailyLog) => void;
  onDismiss: () => void;
}

/** Choices stop at 3. Higher counts open the form; 3 never means "3 or more". */
const CHOICES = [0, 1, 2, 3];

/**
 * Asks for the night-waking count after a sleep has been closed, never during.
 *
 * The wake button has to stay one tap - it is pressed with a crying baby in the
 * other arm and cannot be blocked by a form. But the count is only accurate at
 * that same moment, so the question comes immediately afterwards: one more tap
 * for a parent who wants to answer, nothing recorded for a parent who walks
 * away. Nothing recorded and a recorded zero are different facts.
 */
export default function NightWakingsPrompt({
  log, onRecord, onOpenForm, onDismiss,
}: NightWakingsPromptProps) {
  const data = log.data as SleepData;
  const [isSaving, setIsSaving] = useState(false);

  const handlePick = async (nightWakings: number) => {
    setIsSaving(true);

    try {
      await onRecord(log, nightWakings);
    } finally {
      setIsSaving(false);
    }
  };

  const duration
    = data.duration
      ?? (data.endTime ? calculateDuration(data.startTime, data.endTime) : 0);

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold">
            睡了
            {formatDuration(duration)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">這一段中間醒來幾次？</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="btn-icon -mr-1.5 -mt-1.5"
          aria-label="不記夜醒次數"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/*
        min-w-tap 加上換行：五個 flex-1 在 320px 的卡片裡各自擠不到 44px，而這
        一下是單手、凌晨三點按的。寧可換行也不要少一個選項——少的那個選項就是
        少掉的資訊。
      */}
      <div className="mt-3 flex flex-wrap gap-2">
        {CHOICES.map((count) => (
          <button
            key={count}
            type="button"
            disabled={isSaving}
            onClick={() => handlePick(count)}
            aria-label={`夜醒 ${count} 次`}
            className="chip flex-1 min-w-tap justify-center disabled:opacity-50"
          >
            {count}
          </button>
        ))}
        <button
          type="button"
          disabled={isSaving}
          onClick={() => onOpenForm(log)}
          className="chip flex-1 min-w-tap justify-center disabled:opacity-50"
        >
          更多
        </button>
      </div>
    </div>
  );
}
