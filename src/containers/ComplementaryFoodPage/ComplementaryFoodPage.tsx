import {
  useFoodPageModel,
  type ComplementaryFoodPageProps,
} from './useFoodPageModel';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Hand, TestTube } from 'lucide-react';
import { User } from '~app/domain/authUser';
import {
  allergyTestingMethod,
  fingerFoodPrinciples,
} from '~app/domain/complementaryFood';
import FoodTrialModal from '~app/components/FoodTrialModal';
import FoodSheet from '~app/components/FoodSheet';
import FoodHomeView from '~app/components/FoodHomeView';
import FoodGuideOverview from '~app/components/FoodGuideOverview';
import FoodGuideStages from '~app/components/FoodGuideStages';
import FoodGuideMenu from '~app/components/FoodGuideMenu';
import FoodGuideSafety from '~app/components/FoodGuideSafety';
import FoodTrackingView from '~app/components/FoodTrackingView';
import { fadeInUp } from '~app/domain/motion';

/**
 * 副食品指南。
 *
 * 這一頁自己不畫任何內容，只做三件事：管六個檢視的狀態、把食物紀錄的
 * 增刪改接到 Firebase、決定現在要渲染哪一個檢視。每個檢視各自一個檔案。
 */
export default function ComplementaryFoodPage({
  currentChild,
  user,
}: ComplementaryFoodPageProps) {
  const model = useFoodPageModel({ currentChild, user });

  const {
    viewMode,
    setViewMode,
    setShowAllergyTest,
    setShowFingerFood,
    showFoodModal,
    setShowFoodModal,
    editingFood,
    setEditingFood,
  } = model;

  const { handleSaveFood } = model.actions;

  return (
    <div className="screen">
      <div className="screen-body">
        <p className="text-sm text-ink-muted mb-4">
          4-12個月寶寶的副食品添加完整攻略
        </p>

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
          <button
            onClick={() => setViewMode('home')}
            className="btn-ghost -ml-4 mb-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">返回主頁</span>
          </button>
        )}

        <FoodView model={model} user={user} />
      </div>

      <FoodTrialModal
        isOpen={showFoodModal}
        onClose={() => {
          setShowFoodModal(false);
          setEditingFood(null);
        }}
        onSave={handleSaveFood}
        editingFood={editingFood}
      />

      <FoodReferenceSheets model={model} />
    </div>
  );
}

function FoodView({
  model,
  user,
}: {
  model: ReturnType<typeof useFoodPageModel>;
  user: User | null;
}) {
  const {
    viewMode,
    setViewMode,
    stats,
    openTracking,
    expandedStage,
    setExpandedStage,
    error,
    trackingTab,
    setTrackingTab,
    foodTrials,
  } = model;

  const {
    handleAddFood,
    handleEditFood,
    handleDeleteFood,
    handleAddTrialDate,
  } = model.actions;

  return (
    <>
      {/* viewMode 是這一頁的主要導航（六個檢視），原本硬切換，
            其他小 modal 卻都有動畫。 */}
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </>
  );
}

function FoodReferenceSheets({
  model,
}: {
  model: ReturnType<typeof useFoodPageModel>;
}) {
  const {
    showAllergyTest,
    setShowAllergyTest,
    showFingerFood,
    setShowFingerFood,
  } = model;

  return (
    <>
      <AnimatePresence>
        {showAllergyTest && (
          <FoodSheet
            title={allergyTestingMethod.name}
            onClose={() => setShowAllergyTest(false)}
          >
            <div className="bg-secondary-soft rounded-2xl p-4">
              <p className="text-sm text-ink">
                {allergyTestingMethod.description}
              </p>
            </div>

            {allergyTestingMethod.steps.map((step) => (
              <div key={step.step} className="card">
                <div className="flex gap-3">
                  <div className={
                    'w-10 h-10 rounded-xl bg-secondary-light flex '
                    + 'items-center justify-center flex-shrink-0 '
                    + 'font-bold text-secondary-dark'
                  }
                  >
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1">{step.title}</h3>
                    <p className="text-sm text-ink-muted">
                      {step.description}
                    </p>
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
        )}
      </AnimatePresence>

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
                <p className="text-sm text-ink-muted">
                  {principle.description}
                </p>
              </div>
            ))}
          </FoodSheet>
        )}
      </AnimatePresence>
    </>
  );
}
