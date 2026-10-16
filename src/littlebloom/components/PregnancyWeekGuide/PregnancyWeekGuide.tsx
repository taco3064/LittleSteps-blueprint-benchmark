import { motion } from 'framer-motion';
import type { PregnancyGuide } from '~app/littlebloom/domain/pregnancyGuides';
import { listItem } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littlebloom;
interface PregnancyWeekGuideProps {
  currentGuide: PregnancyGuide;
}

export default function PregnancyWeekGuide({
  currentGuide,
}: PregnancyWeekGuideProps) {
  return (
    <motion.section variants={listItem} className="panel">
      <h2 className={`mb-2 ${THEME.body}`}>{currentGuide.title}</h2>
      <p className={`text-sm leading-relaxed mb-5 ${THEME.muted}`}>
        {currentGuide.summary}
      </p>

      <h3 className={`mb-2 ${THEME.ink}`}>本週提醒</h3>
      <ul className="space-y-2 mb-5">
        {currentGuide.tips.map((tip) => (
          <li
            key={tip}
            className={`text-sm flex gap-2 leading-relaxed ${THEME.body}`}
          >
            <span className="text-bloom-dusty-rose-ink shrink-0">·</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      {currentGuide.warningSignals.length > 0 && (
        <div className="rounded-2xl bg-bloom-terracotta/10 p-4">
          <h3 className="mb-2 text-bloom-terracotta-ink">這些情況請盡快就醫</h3>
          <ul className="space-y-1.5">
            {currentGuide.warningSignals.map((signal) => (
              <li
                key={signal}
                className={`text-sm flex gap-2 leading-relaxed ${THEME.body}`}
              >
                <span className="text-bloom-terracotta-ink shrink-0">·</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}
