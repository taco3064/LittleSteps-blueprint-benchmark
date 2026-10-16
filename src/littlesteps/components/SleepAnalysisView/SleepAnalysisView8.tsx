import { Star } from 'lucide-react';
interface SleepAnalysisView8Props {
  bedtimeStars: number;
}

export function SleepAnalysisView8({ bedtimeStars }: SleepAnalysisView8Props) {
  return (
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-ink">入睡時間規律性</span>
      {/* 星星只用顏色與填滿表達程度，讀螢幕軟體看不到；名稱補在
                      群組上，個別星星就不必逐顆唸。 */}
      <div
        className="flex gap-1"
        role="img"
        aria-label={`5 顆星中的 ${bedtimeStars} 顆`}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={`w-4 h-4 ${
              i <= bedtimeStars ? 'text-butter-dark fill-butter-dark' : 'text-ink/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
