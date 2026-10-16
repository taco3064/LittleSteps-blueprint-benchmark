import type { User } from 'firebase/auth';
import { Calendar, List } from 'lucide-react';
import type { FoodTrialRecord } from '~app/family/domain/familyRecords';
import type { TrackingTab } from '~app/littlesteps/domain/foodTypes';
import type { FoodStats } from '~app/littlesteps/hooks/useFoodTracking';
import FoodTrackingTab from '../FoodTrackingTab';
import FourByThreeTracker from '../FourByThreeTracker';

interface FoodTrackingViewProps {
  activeTab: TrackingTab;
  onTabChange: (tab: TrackingTab) => void;
  foodTrials: FoodTrialRecord[];
  stats: FoodStats;
  onAddFood: () => void;
  onEditFood: (food: FoodTrialRecord) => void;
  onDeleteFood: (foodId: string) => void;
  onAddTrialDate: (foodId: string) => void;
  user: User | null;
}

const tabClass = (isActive: boolean) => `
  flex-1 flex items-center justify-center gap-2 min-h-tap px-4 rounded-xl font-medium transition-all text-sm
  ${isActive ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink'}
`;

/** 「我的追蹤」：食物清單與 4×3 試敏兩個分頁。 */
export default function FoodTrackingView({
  activeTab, onTabChange, foodTrials, stats, onAddFood, onEditFood, onDeleteFood,
  onAddTrialDate, user,
}: FoodTrackingViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-ink/5 rounded-2xl p-1">
        <button
          onClick={() => onTabChange('foods')}
          className={tabClass(activeTab === 'foods')}
        >
          <List className="w-4 h-4" />
          <span>我的食物清單</span>
          {stats.total > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'foods'
                  ? 'bg-mint-light text-mint-dark'
                  : 'bg-ink/10 text-ink-muted'
              }`}
            >
              {stats.total}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('tracker')}
          className={tabClass(activeTab === 'tracker')}
        >
          <Calendar className="w-4 h-4" />
          <span>4×3 追蹤</span>
        </button>
      </div>

      {activeTab === 'foods' && (
        <FoodTrackingTab
          foodTrials={foodTrials}
          stats={stats}
          onAddFood={onAddFood}
          onEditFood={onEditFood}
          onDeleteFood={onDeleteFood}
          user={user}
        />
      )}

      {activeTab === 'tracker' && (
        <FourByThreeTracker
          foodTrials={foodTrials}
          onAddTrialDate={onAddTrialDate}
          onViewFood={onEditFood}
        />
      )}
    </div>
  );
}
