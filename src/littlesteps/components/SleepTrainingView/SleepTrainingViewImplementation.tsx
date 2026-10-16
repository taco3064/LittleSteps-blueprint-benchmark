import { motion } from 'framer-motion';
import { listItem, stagger } from '~app/platform/components/Motion';
import { SleepTrainingView1 } from './SleepTrainingView1';
import { SleepTrainingView3 } from './SleepTrainingView3';
import { SleepTrainingView4 } from './SleepTrainingView4';
import { SleepTrainingView6 } from './SleepTrainingView6';
import { SleepTrainingView9 } from './SleepTrainingView9';
interface SleepTrainingViewProps {
  ritualChecklist: Record<string, boolean>;
  toggleRitualStep: (stepId: string) => void;
  selectedMethod: string | null;
  setSelectedMethod: import('react').Dispatch<
    import('react').SetStateAction<string | null>
  >;
  tipCards: { tip: { title: string; content: string }; tint: string; ink: string }[];
}

export function SleepTrainingView({
  ritualChecklist, toggleRitualStep, selectedMethod, setSelectedMethod, tipCards,
}: SleepTrainingViewProps) {
  return (
    <div className="screen">
      <div className="screen-body">
        <p className="text-sm text-ink-muted mb-5">
          0-3 歲階段需求、安全守則與訓練技巧
        </p>

        {/*
          睡眠時間參考表。原本是五欄表格：前四欄 whitespace-nowrap 把第五欄
          擠成窄柱，於是「睡眠特性」在 390px 下折成七八行，每列高約 250px，
          右側欄位還被切掉。手機上不該用表格排長句，改成一張張卡片。
        */}
        <h2 className="mb-3">睡眠時間參考表</h2>
        <SleepTrainingView1 />

        {/* 睡眠知識 */}
        <h2 className="mb-3">睡眠狀況與相關知識</h2>
        <SleepTrainingView3 />

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

        <SleepTrainingView4 />

        {/* 睡眠儀式 */}
        <h2 className="mb-3">睡眠儀式清單</h2>
        <SleepTrainingView6
          ritualChecklist={ritualChecklist}
          toggleRitualStep={toggleRitualStep}
        />

        {/* 睡眠訓練技巧 */}
        <h2 className="mb-3">睡眠訓練技巧</h2>
        <SleepTrainingView9
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
        />

        {/* 訓練建議 */}
        <h2 className="mb-3">訓練建議與提醒</h2>
        <motion.div
          className="space-y-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {tipCards.map(({ tip, tint, ink }) => (
            <motion.div
              key={tip.title}
              variants={listItem}
              className={`card ${tint}`}
            >
              <h3 className={`mb-1 ${ink}`}>{tip.title}</h3>
              <p className="text-sm text-ink">{tip.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
