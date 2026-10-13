import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameDay, toLocalDateKey } from '~app/domain/dateHelpers';

interface DaySelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 在日子之間移動。
 *
 * 這一頁原本硬寫成 `new Date()`：半夜 00:10 打開，23:40 那一餐就再也看不到了，
 * 而新生兒的餵奶大半發生在半夜。紀錄一直都在 Firebase 也一直載進來了，只是
 * 沒有任何入口。
 *
 * 沒有「下一天」可以按到未來:那裡不會有紀錄，只會是一片空白。
 */
export default function DaySelector({ value, onChange }: DaySelectorProps) {
  const today = new Date();
  const isToday = isSameDay(value, today);

  const shift = (days: number) => {
    // 用當地時區的 y/m/d 相加，算的是「日曆上的下一天」而不是「24 小時後」。
    // 台灣沒有日光節約，所以測試分不出這兩種寫法；選這一種是因為它表達的
    // 正是這裡要的意思，而不是因為量到了差異。
    const next = new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate() + days,
    );

    onChange(next);
  };

  const label = isToday
    ? '今天'
    : `${value.getMonth() + 1}月${value.getDate()}日（${WEEKDAYS[value.getDay()]}）`;

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => shift(-1)}
        className="btn-icon"
        aria-label="前一天"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="text-center">
        <div className="font-bold">{label}</div>
        {!isToday && (
          <div className="text-xs text-ink-faint">{toLocalDateKey(value)}</div>
        )}
      </div>

      <button
        type="button"
        onClick={() => shift(1)}
        disabled={isToday}
        className="btn-icon disabled:opacity-30"
        aria-label="後一天"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
