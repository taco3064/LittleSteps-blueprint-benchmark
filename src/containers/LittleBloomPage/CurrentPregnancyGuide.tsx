import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { listItem } from '~app/domain/motion';
import { PREGNANCY_TOTAL_WEEKS, pregnancyGuides } from '~app/domain/pregnancyGuides';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
const THEME = SERVICE_THEME.littlebloom;

export default function CurrentPregnancyGuide({
  displayWeek,
}: {
  displayWeek: number;
}) {
  // 舊版是 `find(...) || pregnancyGuides[0]`，而資料只有 1-4 週，
  // 於是第 5 週以後的人全部被自信地告知「懷孕第 1 週：準備懷孕」。
  const currentGuide = useMemo(() => {
    if (displayWeek === 0) {
      return null;
    }

    return pregnancyGuides.find((guide) => guide.week === displayWeek) ?? null;
  }, [displayWeek]);

  return (
    <>
      {currentGuide
        ? (
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
          )
        : (
            <motion.section variants={listItem} className="panel">
              <p className={`text-sm leading-relaxed ${THEME.body}`}>
                {'已經超過第 '}
                {PREGNANCY_TOTAL_WEEKS}
                {' 週。37 至 42 週都屬正常生產期，請依產檢醫師的安排追蹤。'}
              </p>
            </motion.section>
          )}
    </>
  );
}
