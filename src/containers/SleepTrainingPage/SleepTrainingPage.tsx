import SleepKnowledge from './SleepKnowledge';
import SleepRequirements from './SleepRequirements';
import SleepRitual from './SleepRitual';
import SleepSafety from './SleepSafety';
import SleepTips from './SleepTips';
import SleepTrainingMethods from './SleepTrainingMethods';

export default function SleepTrainingPage() {
  return (
    <div className="screen">
      <div className="screen-body">
        <p className="text-sm text-ink-muted mb-5">
          0-3 歲階段需求、安全守則與訓練技巧
        </p>

        <SleepRequirements />
        <SleepKnowledge />
        <SleepSafety />
        <SleepRitual />
        <SleepTrainingMethods />
        <SleepTips />
      </div>
    </div>
  );
}
