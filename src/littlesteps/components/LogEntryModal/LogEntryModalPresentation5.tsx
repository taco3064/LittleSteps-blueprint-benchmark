import { Minus, Plus } from 'lucide-react';
import { FIELD } from './FIELD';
import { LogEntryModalPresentation5Props } from './LogEntryModalPresentation5Props';

export function LogEntryModalPresentation5({
  stepNightWakings, nightWakings, setNightWakings,
}: LogEntryModalPresentation5Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => stepNightWakings(-1)}
        className="btn-icon"
        aria-label="減少夜醒次數"
      >
        <Minus className="w-5 h-5" />
      </button>
      <input
        id="sleep-night-wakings"
        type="number"
        inputMode="numeric"
        value={nightWakings}
        onChange={(e) => setNightWakings(e.target.value)}
        className={`${FIELD} text-center`}
        placeholder="未記錄"
        min="0"
      />
      <button
        type="button"
        onClick={() => stepNightWakings(1)}
        className="btn-icon"
        aria-label="增加夜醒次數"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
