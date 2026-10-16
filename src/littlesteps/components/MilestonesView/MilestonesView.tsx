import { AnimatePresence, motion } from 'framer-motion';

import { Category, MonthRange } from '~app/knowledge/domain/referenceModels';
import { MilestoneProgress } from '~app/family/domain/familyRecords';

import { categories, monthRanges } from '~app/knowledge/domain/milestones';

import MonthPicker from '../MonthPicker';

import CategoryFilter from '../CategoryFilter';

import MilestoneCard from '../MilestoneCard';

import MilestoneModal from '../MilestoneModal';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { fadeInUp, listItem, stagger } from '~app/platform/components/Motion';
interface MilestonesView3Props {
  selectedMonth: MonthRange;
  selectedCategory: Category;
  filteredMilestones: import('~app/knowledge/domain/referenceModels').Milestone[];
  progress: MilestoneProgress;
  onToggleMilestone: (id: string) => void;
  setSelectedMilestoneId: import('react').Dispatch<
    import('react').SetStateAction<string | null>
  >;
}

interface MilestonesView2Props {
  filteredMilestones: import('~app/knowledge/domain/referenceModels').Milestone[];
  selectedMonth: MonthRange;
  selectedCategory: Category;
  progress: MilestoneProgress;
  onToggleMilestone: (id: string) => void;
  setSelectedMilestoneId: import('react').Dispatch<
    import('react').SetStateAction<string | null>
  >;
}

interface MilestonesView1Props {
  childSwitcher: import('react').ReactNode;
  selectedMonth: MonthRange;
  pickMonth: (value: MonthRange) => void;
  selectedCategory: Category;
  setSelectedCategory: import('react').Dispatch<
    import('react').SetStateAction<Category>
  >;
  filteredMilestones: import('~app/knowledge/domain/referenceModels').Milestone[];
  progress: MilestoneProgress;
  onToggleMilestone: (id: string) => void;
  setSelectedMilestoneId: import('react').Dispatch<
    import('react').SetStateAction<string | null>
  >;
}

interface MilestonesViewProps {
  childSwitcher: import('react').ReactNode;
  onShare: () => Promise<void>;
  selectedMonth: MonthRange;
  pickMonth: (value: MonthRange) => void;
  selectedCategory: Category;
  setSelectedCategory: import('react').Dispatch<
    import('react').SetStateAction<Category>
  >;
  filteredMilestones: import('~app/knowledge/domain/referenceModels').Milestone[];
  progress: MilestoneProgress;
  onToggleMilestone: (id: string) => void;
  setSelectedMilestoneId: import('react').Dispatch<
    import('react').SetStateAction<string | null>
  >;
  selectedMilestone:
    import('~app/knowledge/domain/referenceModels').Milestone | null;
}

export function MilestonesView3({
  selectedMonth, selectedCategory, filteredMilestones, progress, onToggleMilestone,
  setSelectedMilestoneId,
}: MilestonesView3Props) {
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

export function MilestonesView2({
  filteredMilestones, selectedMonth, selectedCategory, progress, onToggleMilestone,
  setSelectedMilestoneId,
}: MilestonesView2Props) {
  return (
    <AnimatePresence mode="popLayout">
      {filteredMilestones.length > 0
        ? (
      /* Re-keying on the filter replays the stagger, so a chip tap reads
               as a new list arriving rather than rows silently swapping. */
            <MilestonesView3
              key={`${selectedMonth}-${selectedCategory}`}
              selectedMonth={selectedMonth}
              selectedCategory={selectedCategory}
              filteredMilestones={filteredMilestones}
              progress={progress}
              onToggleMilestone={onToggleMilestone}
              setSelectedMilestoneId={setSelectedMilestoneId}
            />
          )
        : (
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
  );
}

export function MilestonesView1({
  childSwitcher, selectedMonth, pickMonth, selectedCategory, setSelectedCategory,
  filteredMilestones, progress, onToggleMilestone, setSelectedMilestoneId,
}: MilestonesView1Props) {
  return (
    <div className="screen-body">
      {childSwitcher}

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

      <MilestonesView2
        filteredMilestones={filteredMilestones}
        selectedMonth={selectedMonth}
        selectedCategory={selectedCategory}
        progress={progress}
        onToggleMilestone={onToggleMilestone}
        setSelectedMilestoneId={setSelectedMilestoneId}
      />
    </div>
  );
}

export function MilestonesView({
  childSwitcher, selectedMonth, pickMonth, selectedCategory, setSelectedCategory,
  filteredMilestones, progress, onToggleMilestone, setSelectedMilestoneId,
  selectedMilestone, onShare,
}: MilestonesViewProps) {
  return (
    <div className="screen">
      <MilestonesView1
        childSwitcher={childSwitcher}
        selectedMonth={selectedMonth}
        pickMonth={pickMonth}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredMilestones={filteredMilestones}
        progress={progress}
        onToggleMilestone={onToggleMilestone}
        setSelectedMilestoneId={setSelectedMilestoneId}
      />

      <MilestoneModal
        onShare={onShare}
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
