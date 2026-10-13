import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { listItem, stagger } from '~app/domain/motion';
import { sleepSafetyRules } from '~app/domain/sleep';

export default function SleepSafety() {
  return (
    <>
      {/* 睡眠安全 - 重點強調 */}
      <div className="flex items-baseline gap-2 mb-3">
        <h2>睡眠安全守則</h2>
        <span className="text-sm text-primary-dark font-medium">
          (降低嬰兒猝死症風險)
        </span>
      </div>

      <div className="card bg-primary-light mb-4">
        <h3 className="text-primary-dark mb-1">重要提醒</h3>
        <p className="text-sm text-ink leading-relaxed">
          為降低嬰兒猝死症 (SIDS) 風險，應嚴格遵守以下睡眠安全準則。
          這些守則經過醫學研究證實，能有效保護寶寶的睡眠安全。
        </p>
      </div>

      <motion.div
        className="grid md:grid-cols-2 gap-3 mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {sleepSafetyRules.map((rule) => (
          <motion.div
            key={rule.id}
            variants={listItem}
            className={`card ${rule.type === 'do' ? 'bg-mint-soft' : 'bg-primary-soft'}`}
          >
            <div className="flex items-start gap-3">
              {/* 該做／不該做只靠這個符號區分，所以圖示留著 */}
              {rule.type === 'do'
                ? (
                    <Check className="w-5 h-5 text-mint-dark shrink-0 mt-0.5" />
                  )
                : (
                    <X className="w-5 h-5 text-primary-dark shrink-0 mt-0.5" />
                  )}
              <div className="flex-1">
                <h3
                  className={`mb-1 ${rule.type === 'do' ? 'text-mint-dark' : 'text-primary-dark'}`}
                >
                  {rule.title}
                </h3>
                <p className="text-sm text-ink leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
