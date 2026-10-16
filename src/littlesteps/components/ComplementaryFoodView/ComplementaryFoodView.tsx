import { AnimatePresence, motion } from 'framer-motion';

import { ChevronLeft, Hand, TestTube } from 'lucide-react';

import { User } from 'firebase/auth';

import {
  allergyTestingMethod,
  fingerFoodPrinciples,
} from '~app/littlesteps/domain/complementaryFood';

import { FoodTrialInput, FoodTrialRecord } from '~app/family/domain/familyRecords';

import FoodTrialModal from '../FoodTrialModal';

import FoodSheet from '../FoodSheet';

import FoodHomeView from '../FoodHomeView';

import FoodGuideOverview from '../FoodGuideOverview';

import FoodGuideStages from '../FoodGuideStages';

import FoodGuideMenu from '../FoodGuideMenu';

import FoodGuideSafety from '../FoodGuideSafety';

import FoodTrackingView from '../FoodTrackingView';

import type { TrackingTab, ViewMode } from '~app/littlesteps/domain/foodTypes';

import { fadeInUp } from '~app/platform/components/Motion';
interface ComplementaryFoodView3Props {
  viewMode: ViewMode;
  stats: import('~app/littlesteps/hooks/useFoodTracking').FoodStats;
  openTracking: (tab: TrackingTab) => void;
  setViewMode: import('react').Dispatch<import('react').SetStateAction<ViewMode>>;
  expandedStage: number | null;
  setExpandedStage: import('react').Dispatch<
    import('react').SetStateAction<number | null>
  >;
  error: boolean;
  trackingTab: TrackingTab;
  setTrackingTab: import('react').Dispatch<
    import('react').SetStateAction<TrackingTab>
  >;
  foodTrials: FoodTrialRecord[];
  handleAddFood: () => void;
  handleEditFood: (food: FoodTrialRecord) => void;
  handleDeleteFood: (foodId: string) => Promise<void>;
  handleAddTrialDate: (foodId: string) => Promise<void>;
  user: User | null;
}

interface ComplementaryFoodView2Props {
  viewMode: ViewMode;
  stats: import('~app/littlesteps/hooks/useFoodTracking').FoodStats;
  openTracking: (tab: TrackingTab) => void;
  setViewMode: import('react').Dispatch<import('react').SetStateAction<ViewMode>>;
  expandedStage: number | null;
  setExpandedStage: import('react').Dispatch<
    import('react').SetStateAction<number | null>
  >;
  error: boolean;
  trackingTab: TrackingTab;
  setTrackingTab: import('react').Dispatch<
    import('react').SetStateAction<TrackingTab>
  >;
  foodTrials: FoodTrialRecord[];
  handleAddFood: () => void;
  handleEditFood: (food: FoodTrialRecord) => void;
  handleDeleteFood: (foodId: string) => Promise<void>;
  handleAddTrialDate: (foodId: string) => Promise<void>;
  user: User | null;
}

interface ComplementaryFoodView1Props {
  setShowAllergyTest: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setShowFingerFood: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  viewMode: ViewMode;
  setViewMode: import('react').Dispatch<import('react').SetStateAction<ViewMode>>;
  stats: import('~app/littlesteps/hooks/useFoodTracking').FoodStats;
  openTracking: (tab: TrackingTab) => void;
  expandedStage: number | null;
  setExpandedStage: import('react').Dispatch<
    import('react').SetStateAction<number | null>
  >;
  error: boolean;
  trackingTab: TrackingTab;
  setTrackingTab: import('react').Dispatch<
    import('react').SetStateAction<TrackingTab>
  >;
  foodTrials: FoodTrialRecord[];
  handleAddFood: () => void;
  handleEditFood: (food: FoodTrialRecord) => void;
  handleDeleteFood: (foodId: string) => Promise<void>;
  handleAddTrialDate: (foodId: string) => Promise<void>;
  user: User | null;
}

interface ComplementaryFoodView5Props {
  setShowAllergyTest: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
}

interface ComplementaryFoodView4Props {
  showAllergyTest: boolean;
  setShowAllergyTest: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
}

interface ComplementaryFoodViewProps {
  setShowAllergyTest: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setShowFingerFood: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  viewMode: ViewMode;
  setViewMode: import('react').Dispatch<import('react').SetStateAction<ViewMode>>;
  stats: import('~app/littlesteps/hooks/useFoodTracking').FoodStats;
  openTracking: (tab: TrackingTab) => void;
  expandedStage: number | null;
  setExpandedStage: import('react').Dispatch<
    import('react').SetStateAction<number | null>
  >;
  error: boolean;
  trackingTab: TrackingTab;
  setTrackingTab: import('react').Dispatch<
    import('react').SetStateAction<TrackingTab>
  >;
  foodTrials: FoodTrialRecord[];
  handleAddFood: () => void;
  handleEditFood: (food: FoodTrialRecord) => void;
  handleDeleteFood: (foodId: string) => Promise<void>;
  handleAddTrialDate: (foodId: string) => Promise<void>;
  user: User | null;
  showFoodModal: boolean;
  setShowFoodModal: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setEditingFood: import('react').Dispatch<
    import('react').SetStateAction<FoodTrialRecord | null>
  >;
  handleSaveFood: (foodData: FoodTrialInput) => Promise<void>;
  editingFood: FoodTrialRecord | null;
  showAllergyTest: boolean;
  showFingerFood: boolean;
}

export function ComplementaryFoodView3({
  viewMode, stats, openTracking, setViewMode, expandedStage, setExpandedStage, error,
  trackingTab, setTrackingTab, foodTrials, handleAddFood, handleEditFood,
  handleDeleteFood, handleAddTrialDate, user,
}: ComplementaryFoodView3Props) {
  return (
    <motion.div
      key={viewMode}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
    >
      {viewMode === 'home' && (
        <FoodHomeView
          stats={stats}
          onOpenTracking={openTracking}
          onOpenGuide={setViewMode}
        />
      )}

      {viewMode === 'guide-overview' && <FoodGuideOverview />}

      {viewMode === 'guide-stages' && (
        <FoodGuideStages
          expandedStage={expandedStage}
          onToggleStage={setExpandedStage}
        />
      )}

      {viewMode === 'guide-menu' && <FoodGuideMenu />}

      {viewMode === 'guide-safety' && <FoodGuideSafety />}

      {/*
              讀取失敗時 foodTrials 是空的，直接畫追蹤頁就會說「還沒有食物記錄」，
              把「讀不到」講成「還沒記過」。
            */}
      {viewMode === 'my-tracking'
        && (error
          ? (
              <div className="card">
                <p className="text-sm text-ink-muted">
                  讀不到食物記錄，請確認網路後重新載入
                </p>
              </div>
            )
          : (
              <FoodTrackingView
                activeTab={trackingTab}
                onTabChange={setTrackingTab}
                foodTrials={foodTrials}
                stats={stats}
                onAddFood={handleAddFood}
                onEditFood={handleEditFood}
                onDeleteFood={handleDeleteFood}
                onAddTrialDate={handleAddTrialDate}
                user={user}
              />
            ))}
    </motion.div>
  );
}

export function ComplementaryFoodView2({
  viewMode, stats, openTracking, setViewMode, expandedStage, setExpandedStage, error,
  trackingTab, setTrackingTab, foodTrials, handleAddFood, handleEditFood,
  handleDeleteFood, handleAddTrialDate, user,
}: ComplementaryFoodView2Props) {
  return (
    <AnimatePresence mode="wait">
      <ComplementaryFoodView3
        key={viewMode}
        viewMode={viewMode}
        stats={stats}
        openTracking={openTracking}
        setViewMode={setViewMode}
        expandedStage={expandedStage}
        setExpandedStage={setExpandedStage}
        error={error}
        trackingTab={trackingTab}
        setTrackingTab={setTrackingTab}
        foodTrials={foodTrials}
        handleAddFood={handleAddFood}
        handleEditFood={handleEditFood}
        handleDeleteFood={handleDeleteFood}
        handleAddTrialDate={handleAddTrialDate}
        user={user}
      />
    </AnimatePresence>
  );
}

export function ComplementaryFoodView1({
  setShowAllergyTest, setShowFingerFood, viewMode, setViewMode, stats, openTracking,
  expandedStage, setExpandedStage, error, trackingTab, setTrackingTab, foodTrials,
  handleAddFood, handleEditFood, handleDeleteFood, handleAddTrialDate, user,
}: ComplementaryFoodView1Props) {
  return (
    <div className="screen-body">
      <p className="text-sm text-ink-muted mb-4">4-12個月寶寶的副食品添加完整攻略</p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setShowAllergyTest(true)}
          className="btn-secondary w-full text-sm"
        >
          <TestTube className="w-4 h-4" />
          <span>4x3 試敏法</span>
        </button>
        <button
          onClick={() => setShowFingerFood(true)}
          className="btn-secondary w-full text-sm"
        >
          <Hand className="w-4 h-4" />
          <span>手指食物指南</span>
        </button>
      </div>

      {viewMode !== 'home' && (
        <button onClick={() => setViewMode('home')} className="btn-ghost -ml-4 mb-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">返回主頁</span>
        </button>
      )}

      {/* viewMode 是這一頁的主要導航（六個檢視），原本硬切換，
            其他小 modal 卻都有動畫。 */}
      <ComplementaryFoodView2
        viewMode={viewMode}
        stats={stats}
        openTracking={openTracking}
        setViewMode={setViewMode}
        expandedStage={expandedStage}
        setExpandedStage={setExpandedStage}
        error={error}
        trackingTab={trackingTab}
        setTrackingTab={setTrackingTab}
        foodTrials={foodTrials}
        handleAddFood={handleAddFood}
        handleEditFood={handleEditFood}
        handleDeleteFood={handleDeleteFood}
        handleAddTrialDate={handleAddTrialDate}
        user={user}
      />
    </div>
  );
}

export function ComplementaryFoodView5({
  setShowAllergyTest,
}: ComplementaryFoodView5Props) {
  return (
    <FoodSheet
      title={allergyTestingMethod.name}
      onClose={() => setShowAllergyTest(false)}
    >
      <div className="bg-secondary-soft rounded-2xl p-4">
        <p className="text-sm text-ink">{allergyTestingMethod.description}</p>
      </div>

      {allergyTestingMethod.steps.map((step) => (
        <div key={step.step} className="card">
          <div className="flex gap-3">
            <div
              className={
                'w-10 h-10 rounded-xl bg-secondary-light flex items-center '
                + 'justify-center flex-shrink-0 font-bold text-secondary-dark'
              }
            >
              {step.step}
            </div>
            <div className="flex-1">
              <h3 className="mb-1">{step.title}</h3>
              <p className="text-sm text-ink-muted">{step.description}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-butter-light rounded-2xl p-4">
        <p className="text-sm text-butter-dark font-medium">
          {allergyTestingMethod.principle}
        </p>
      </div>
    </FoodSheet>
  );
}

export function ComplementaryFoodView4({
  showAllergyTest, setShowAllergyTest,
}: ComplementaryFoodView4Props) {
  return (
    <AnimatePresence>
      {showAllergyTest && (
        <ComplementaryFoodView5 setShowAllergyTest={setShowAllergyTest} />
      )}
    </AnimatePresence>
  );
}

export function ComplementaryFoodView({
  setShowAllergyTest, setShowFingerFood, viewMode, setViewMode, stats, openTracking,
  expandedStage, setExpandedStage, error, trackingTab, setTrackingTab, foodTrials,
  handleAddFood, handleEditFood, handleDeleteFood, handleAddTrialDate, user,
  showFoodModal, setShowFoodModal, setEditingFood, handleSaveFood, editingFood,
  showAllergyTest, showFingerFood,
}: ComplementaryFoodViewProps) {
  return (
    <div className="screen">
      <ComplementaryFoodView1
        setShowAllergyTest={setShowAllergyTest}
        setShowFingerFood={setShowFingerFood}
        viewMode={viewMode}
        setViewMode={setViewMode}
        stats={stats}
        openTracking={openTracking}
        expandedStage={expandedStage}
        setExpandedStage={setExpandedStage}
        error={error}
        trackingTab={trackingTab}
        setTrackingTab={setTrackingTab}
        foodTrials={foodTrials}
        handleAddFood={handleAddFood}
        handleEditFood={handleEditFood}
        handleDeleteFood={handleDeleteFood}
        handleAddTrialDate={handleAddTrialDate}
        user={user}
      />

      <FoodTrialModal
        isOpen={showFoodModal}
        onClose={() => {
          setShowFoodModal(false);
          setEditingFood(null);
        }}
        onSave={handleSaveFood}
        editingFood={editingFood}
      />

      <ComplementaryFoodView4
        showAllergyTest={showAllergyTest}
        setShowAllergyTest={setShowAllergyTest}
      />

      <AnimatePresence>
        {showFingerFood && (
          <FoodSheet
            title={fingerFoodPrinciples.title}
            onClose={() => setShowFingerFood(false)}
          >
            <div className="bg-butter-light rounded-2xl p-4">
              <p className="text-sm text-butter-dark font-medium">
                適用年齡：
                {fingerFoodPrinciples.ageRange}
              </p>
            </div>

            {fingerFoodPrinciples.principles.map((principle, idx) => (
              <div key={idx} className="card">
                <h3 className="mb-1">{principle.name}</h3>
                <p className="text-sm text-ink-muted">{principle.description}</p>
              </div>
            ))}
          </FoodSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
