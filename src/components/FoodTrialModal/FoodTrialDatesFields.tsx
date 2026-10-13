import { Plus, X } from 'lucide-react';
import { formatDate } from '~app/domain/dateHelpers';
import { LABEL } from './formPresentation';
import type { FoodTrialForm } from './useFoodTrialForm';

export default function FoodTrialDatesFields({ form }: { form: FoodTrialForm }) {
  const { trialDates, today, addTrialDate, removeTrialDate } = form;

  return (
    <>
      {/* Trial Dates (4x3 Rule Tracking) */}
      <div>
        <div className={LABEL}>嘗試日期記錄（4x3 法則）</div>
        <div className="card bg-secondary-soft border border-secondary/40">
          <p className="text-sm text-ink-muted mb-2">
            {'已記錄 '}
            {trialDates.length}
            {' 次嘗試'}
          </p>
          {/* 點錯日期只能整筆刪掉重建，跟過敏反應一樣給一個移除。 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {trialDates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => removeTrialDate(date)}
                aria-label={`移除嘗試日期 ${formatDate(date)}`}
                className="tag min-h-tap bg-secondary-light text-secondary-dark"
              >
                {formatDate(date)}
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={addTrialDate}
            disabled={trialDates.includes(today)}
            className="btn-secondary w-full"
          >
            <Plus className="w-4 h-4" />
            記錄今天嘗試
          </button>
        </div>
      </div>
    </>
  );
}
