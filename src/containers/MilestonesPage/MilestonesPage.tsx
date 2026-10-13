import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ChildProfile,
  MonthRange,
  Category,
  MilestoneProgress,
} from '~app/domain/records';
import { milestones, monthRanges, categories } from '~app/domain/milestones';
import MonthPicker from '~app/components/MonthPicker';
import CategoryFilter from '~app/components/CategoryFilter';
import MilestoneCard from '~app/components/MilestoneCard';
import MilestoneModal from '../MilestoneModal';
import ChildSwitcher from '~app/components/ChildSwitcher';
import EmptyState from '~app/components/EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { stagger, listItem, fadeInUp } from '~app/domain/motion';
import { monthRangeForChild } from '~app/domain/ageDefaults';

interface MilestonesPageProps {
  currentChild?: ChildProfile | null;
  progress: MilestoneProgress;
  onToggleMilestone: (id: string) => void;
}

export default function MilestonesPage({
  currentChild,
  progress,
  onToggleMilestone,
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

  return (
    <div className="screen">
      <div className="screen-body">
        <ChildSwitcher service="littlesteps" className="mb-4" />

        <div className="mb-4">
          <MonthPicker
            ranges={monthRanges}
            selected={selectedMonth}
            onChange={pickMonth}
          />
        </div>

        <div className="mb-4">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        <AnimatePresence mode="popLayout">
          {filteredMilestones.length > 0 && (
            /* Re-keying on the filter replays the stagger, so a chip tap reads
               as a new list arriving rather than rows silently swapping. */
            <MilestoneResults
              selectedMonth={selectedMonth}
              selectedCategory={selectedCategory}
              filteredMilestones={filteredMilestones}
              progress={progress}
              onToggleMilestone={onToggleMilestone}
              setSelectedMilestoneId={setSelectedMilestoneId}
            />
          )}
          {filteredMilestones.length === 0 && (
            <motion.div
              key="empty"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <EmptyState
                theme={SERVICE_THEME.littlesteps}
                title={
                  selectedCategory === 'all'
                    ? '這個月齡階段沒有里程碑資料'
                    : '這個分類沒有里程碑資料'
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MilestoneModal
        milestone={selectedMilestone}
        isOpen={!!selectedMilestone}
        onClose={() => setSelectedMilestoneId(null)}
        isCompleted={
          selectedMilestone
            ? progress[selectedMilestone.id]?.achieved || false
            : false
        }
        achievedDate={
          selectedMilestone
            ? progress[selectedMilestone.id]?.achievedDate
            : undefined
        }
        onToggle={() => selectedMilestone && onToggleMilestone(selectedMilestone.id)}
      />
    </div>
  );
}

function MilestoneResults({
  selectedMonth,
  selectedCategory,
  filteredMilestones,
  progress,
  onToggleMilestone,
  setSelectedMilestoneId,
}: {
  selectedMonth: import('~app/domain/records').MonthRange;
  selectedCategory: import('~app/domain/records').Category;
  filteredMilestones: import('~app/domain/records').Milestone[];
  progress: import('~app/domain/records').MilestoneProgress;
  onToggleMilestone: (id: string) => void;
  setSelectedMilestoneId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <motion.div
      key={`${selectedMonth}-${selectedCategory}`}
      className="space-y-3"
      variants={stagger}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
    >
      {filteredMilestones.map((milestone) => (
        <motion.div key={milestone.id} layout variants={listItem}>
          <MilestoneCard
            milestone={milestone}
            isCompleted={progress[milestone.id]?.achieved || false}
            achievedDate={progress[milestone.id]?.achievedDate}
            onToggle={() => onToggleMilestone(milestone.id)}
            onClick={() => setSelectedMilestoneId(milestone.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
