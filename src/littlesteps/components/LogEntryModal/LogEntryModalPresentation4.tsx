import { LABEL } from './LABEL';
import { LogEntryModalPresentation4Props } from './LogEntryModalPresentation4Props';
import { LogEntryModalPresentation5 } from './LogEntryModalPresentation5';

export function LogEntryModalPresentation4({
  stepNightWakings, nightWakings, setNightWakings,
}: LogEntryModalPresentation4Props) {
  return (
    <div>
      <label htmlFor="sleep-night-wakings" className={LABEL}>
        夜醒次數
      </label>
      <LogEntryModalPresentation5
        stepNightWakings={stepNightWakings}
        nightWakings={nightWakings}
        setNightWakings={setNightWakings}
      />
      <p className="mt-1 text-xs text-ink-faint">留白表示沒記，和記 0 次不一樣</p>
    </div>
  );
}
