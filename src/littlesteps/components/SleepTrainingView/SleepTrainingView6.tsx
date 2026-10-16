import { SleepTrainingView7 } from './SleepTrainingView7';
interface SleepTrainingView6Props {
  ritualChecklist: Record<string, boolean>;
  toggleRitualStep: (stepId: string) => void;
}

export function SleepTrainingView6({
  ritualChecklist, toggleRitualStep,
}: SleepTrainingView6Props) {
  return (
    <div className="panel bg-secondary-soft mb-8">
      <p className="text-sm text-ink mb-4 leading-relaxed">
        在睡前 1 小時固定執行 3-4 個動作，形成生理連結，幫助寶寶知道「該睡覺了」。
      </p>
      <SleepTrainingView7
        ritualChecklist={ritualChecklist}
        toggleRitualStep={toggleRitualStep}
      />
    </div>
  );
}
