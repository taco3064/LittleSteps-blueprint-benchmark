import { motion } from 'framer-motion';

interface ScoreCircleProps {
  /** null＝這段期間有記錄的天數太少，算不出分數。 */
  score: number | null;
  label: string;
  title: string;
}

/*
  SVG 的 stroke 收的是 paint 值，吃不到 Tailwind class，所以環的顏色只能寫
  色碼；中央的數字走 class。三組都是 token 的 dark 階，白底上都在 4.5:1 以上。
*/
const TONES = {
  good: { ring: '#3F7D43', text: 'text-mint-dark' }, // mint-dark
  watch: { ring: '#9A6212', text: 'text-butter-dark' }, // butter-dark
  low: { ring: '#B84A50', text: 'text-primary-dark' }, // primary-dark
} as const;

function toneFor(score: number) {
  if (score >= 70) {
    return TONES.good;
  }

  if (score >= 40) {
    return TONES.watch;
  }

  return TONES.low;
}

// 圓環畫在固定的座標系裡，實際大小交給 CSS。三顆並排時，寫死的 100px 會在
// 320px 的螢幕上撐破版面。
const VIEW = 120;
const STROKE = 8;
const CENTER = VIEW / 2;
const RADIUS = (VIEW - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreCircle({ score, label, title }: ScoreCircleProps) {
  const tone = score === null ? null : toneFor(score);
  const progress = score === null ? 0 : Math.max(0, Math.min(100, score));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="w-full -rotate-90"
          aria-hidden="true"
        >
          {/* 軌道用 currentColor 接 class，才不用為了灰底再造一個 token。 */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-ink/10"
          />
          {/* 沒有分數就不畫弧：畫一段短弧等於用顏色宣判「很差」。 */}
          {tone && (
            <motion.circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={tone.ring}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{
                strokeDashoffset: CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE,
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          {tone
            ? (
                <motion.span
                  className={`text-2xl font-bold leading-none ${tone.text}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                >
                  {score}
                </motion.span>
              )
            : (
                <span className="text-xs font-bold leading-none text-ink-faint">
                  資料不足
                </span>
              )}
          <span className="text-[10px] text-ink-faint mt-1 text-center leading-tight">
            {label}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-ink-muted text-center leading-tight">
        {title}
      </span>
    </div>
  );
}
