import { Minus, Plus } from 'lucide-react';
import { FIELD, LABEL } from './formPresentation';
import type { LogForm } from './useLogForm';

export default function NightWakingFields({ form }: { form: LogForm }) {
  const { nightWakings, setNightWakings, stepNightWakings } = form;

  return (
    <>
      {/*
                    夜醒次數問在這裡，因為關掉一段睡眠就是想起這件事的那一刻。
                    在這之前，週報有一張夜醒趨勢卡，但全 app 沒有任何地方寫得進
                    這個欄位——那張卡永遠說「持平」。
                  */}
      <div>
        <label htmlFor="sleep-night-wakings" className={LABEL}>
          夜醒次數
        </label>
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
        <p className="mt-1 text-xs text-ink-faint">留白表示沒記，和記 0 次不一樣</p>
      </div>
    </>
  );
}
