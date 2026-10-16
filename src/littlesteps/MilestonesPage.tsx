import { ChildSwitcher } from '~app/family';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { useMemo, useState } from 'react';
import { useToast } from '~app/platform/hooks/useToast';
import { MilestonesView } from '~app/littlesteps/components/MilestonesView';
import { shareMilestone } from '~app/littlesteps/services/share';

import { Category, MonthRange } from '~app/knowledge/domain/referenceModels';
import { ChildProfile, MilestoneProgress } from '~app/family/domain/familyRecords';
import { monthRangeForChild } from '~app/littlesteps/domain/ageDefaults';
import { milestones } from '~app/knowledge/domain/milestones';

interface MilestonesPageProps {
  currentChild?: ChildProfile | null;
  progress: MilestoneProgress;
  onToggleMilestone: (id: string) => void;
}

export default function MilestonesPage({
  currentChild, progress, onToggleMilestone,
}: MilestonesPageProps) {
  // 從孩子現在的月齡起跑，而不是從 0-2 個月。停在出生那一段對任何滿三個月
  // 以上的寶寶都是錯的起點，家長每次進來都得自己滑過去。
  /*
    月齡區間的優先順序：這次點的 > 孩子的月齡。跟 LittleGuard 的年齡層同一種
    寫法（RadarPage.tsx），`null` 就是「家長還沒挑過」。

    換寶寶時這一頁不會卸載（App.tsx 的錯誤邊界綁的是路由，不是孩子），所以不能
    用 useState 的初始值：那只在掛載時算一次，篩選器會一直停在上一個寶寶的月齡，
    六個月大切到三歲，畫面照樣拿 5-6 個月的里程碑對新寶寶打勾。每次 render 重推，
    連改生日也跟著更新；家長挑過的則永遠贏過推導出來的值。

    點到已經選中的那一顆不算挑過：pickMonth 把 picked 收回 null，這一頁就繼續
    跟著孩子走。理由與代價寫在 VaccineTrackingPage.tsx 的同一段註解裡。
  */
  const [pickedMonth, setPickedMonth] = useState<MonthRange | null>(null);
  const derivedMonth = monthRangeForChild(currentChild);
  const selectedMonth = pickedMonth ?? derivedMonth;

  const pickMonth = (value: MonthRange) =>
    setPickedMonth(value === derivedMonth ? null : value);

  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null,
  );

  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      const monthMatch = m.monthRange === selectedMonth;

      const categoryMatch
        = selectedCategory === 'all' || m.category === selectedCategory;

      return monthMatch && categoryMatch;
    });
  }, [selectedMonth, selectedCategory]);

  const selectedMilestone = useMemo(() => {
    return milestones.find((m) => m.id === selectedMilestoneId) || null;
  }, [selectedMilestoneId]);

  const toast = useToast();

  const onShare = async () => {
    if (!selectedMilestone) {
      return;
    }

    const outcome = await shareMilestone(selectedMilestone.title);

    if (outcome === 'copied') {
      toast.show('已複製到剪貼簿', 'success');
    }

    if (outcome === 'failed') {
      toast.show('分享失敗，請稍後再試');
    }
  };

  return (
    <MilestonesView
      childSwitcher={
        <ChildSwitcher theme={SERVICE_THEME.littlesteps} className="mb-4" />
      }
      onShare={onShare}
      selectedMonth={selectedMonth}
      pickMonth={pickMonth}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      filteredMilestones={filteredMilestones}
      progress={progress}
      onToggleMilestone={onToggleMilestone}
      setSelectedMilestoneId={setSelectedMilestoneId}
      selectedMilestone={selectedMilestone}
    />
  );
}
