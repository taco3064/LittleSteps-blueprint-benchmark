import { useState } from 'react';
import { SleepTrainingView } from '../SleepTrainingView';
import { trainingTips } from '~app/littlesteps/domain/sleep';

export default function SleepTrainingPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const [ritualChecklist, setRitualChecklist] = useState<Record<string, boolean>>(
    {},
  );

  const toggleRitualStep = (stepId: string) => {
    setRitualChecklist((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const tipCards = [
    {
      tip: trainingTips.timing,
      tint: 'bg-secondary-soft',
      ink: 'text-secondary-dark',
    },
    { tip: trainingTips.consistency, tint: 'bg-mint-soft', ink: 'text-mint-dark' },
    { tip: trainingTips.patience, tint: 'bg-butter-soft', ink: 'text-butter-dark' },
  ];

  return (
    <SleepTrainingView
      ritualChecklist={ritualChecklist}
      toggleRitualStep={toggleRitualStep}
      selectedMethod={selectedMethod}
      setSelectedMethod={setSelectedMethod}
      tipCards={tipCards}
    />
  );
}
