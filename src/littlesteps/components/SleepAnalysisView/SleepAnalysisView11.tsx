import { motion } from 'framer-motion';
import { listItem, stagger } from '~app/platform/components/Motion';
interface SleepAnalysisView11Props {
  advice: import('~app/littlesteps/domain/sleepAnalysis').SleepAdvice[];
}

export function SleepAnalysisView11({ advice }: SleepAnalysisView11Props) {
  return (
    <motion.div className="space-y-3" variants={stagger}>
      {advice.map((item, index) => {
        const tint
          = item.category === 'good'
            ? 'bg-mint-light'
            : item.category === 'attention'
              ? 'bg-butter-light'
              : 'bg-primary-light';

        const textColor
          = item.category === 'good'
            ? 'text-mint-dark'
            : item.category === 'attention'
              ? 'text-butter-dark'
              : 'text-primary-dark';

        return (
          <motion.div key={index} variants={listItem} className={`card ${tint}`}>
            <h3 className={`mb-2 ${textColor}`}>{item.title}</h3>
            <p className={`text-sm mb-3 ${textColor}`}>{item.description}</p>
            {item.suggestions.length > 0 && (
              <ul className={`text-sm space-y-1 list-disc pl-5 ${textColor}`}>
                {item.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
