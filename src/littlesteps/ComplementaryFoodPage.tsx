import { confirmDelete } from '~app/platform/services/confirmation';
import { User } from 'firebase/auth';
import { createChildRecords } from '~app/family/services/child_records';
import { useToast } from '~app/platform/hooks/useToast';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import {
  ChildProfile,
  FoodTrialInput,
  FoodTrialRecord,
} from '~app/family/domain/familyRecords';
import { ComplementaryFoodView } from '~app/littlesteps/components/ComplementaryFoodView';
import { trialDatesOf } from '~app/littlesteps/domain/foodTrialDates';
import { foodTrialChanges } from '~app/littlesteps/domain/foodTrialEdit';
import type { TrackingTab } from '~app/littlesteps/domain/foodTypes';
import { useFoodTracking } from '~app/littlesteps/hooks/useFoodTracking';
import {
  useComplementaryFoodDraft,
} from '~app/littlesteps/hooks/useComplementaryFoodDraft';

interface ComplementaryFoodPageProps {
  currentChild?: ChildProfile | null;
  user: User | null;
}

/**
 * 副食品指南。
 *
 * 這一頁自己不畫任何內容，只做三件事：管六個檢視的狀態、把食物紀錄的
 * 增刪改接到 Firebase、決定現在要渲染哪一個檢視。每個檢視各自一個檔案。
 */
export default function ComplementaryFoodPage({
  currentChild, user,
}: ComplementaryFoodPageProps) {
  const {
    viewMode, setViewMode, trackingTab, setTrackingTab, showAllergyTest,
    setShowAllergyTest, showFingerFood, setShowFingerFood, expandedStage,
    setExpandedStage, showFoodModal, setShowFoodModal, editingFood, setEditingFood,
  } = useComplementaryFoodDraft();

  const toast = useToast();

  const childId = currentChild?.id || null;
  const { foodProgress, foodTrials, stats, error } = useFoodTracking(childId, user);
  const firebaseChildren = createChildRecords(user?.uid || null);

  const handleAddFood = () => {
    setEditingFood(null);
    setShowFoodModal(true);
  };

  const handleEditFood = (food: FoodTrialRecord) => {
    setEditingFood(food);
    setShowFoodModal(true);
  };

  /*
    失敗時不接住：訊息與「表單留在原地」都由 FoodTrialModal 自己處理，
    這裡再 toast 一次就是同一件事講兩遍。
  */
  const handleSaveFood = async (foodData: FoodTrialInput) => {
    if (!childId) {
      throw new Error('請先選擇寶寶');
    }

    if (editingFood) {
      // 只送這次真的改到的欄位，而且是跟「打開表單當下那一版」比出來的：整筆
      // 寫回去會把另一位照顧者同時改的欄位一起蓋掉，被清空的欄位則要寫成
      // null，省略它等於不碰，家長刪掉的備註就會原封不動留在資料庫裡。
      await firebaseChildren.updateFoodTrial(
        childId,
        editingFood.id,
        foodTrialChanges(editingFood, foodData),
      );
    } else {
      await firebaseChildren.addFoodTrial(childId, foodData);
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    const food = foodTrials.find((item) => item.id === foodId);

    if (!childId || !food || !confirmDelete(`「${food.foodName}」的記錄`)) {
      return;
    }

    try {
      await firebaseChildren.deleteFoodTrial(childId, foodId);
    } catch (error) {
      console.error('刪除食物記錄失敗:', error);
      toast.show(error instanceof Error ? error.message : '刪除失敗，請稍後再試');
    }
  };

  const handleAddTrialDate = async (foodId: string) => {
    if (!childId) {
      return;
    }

    const today = toLocalDateKey();
    const food = foodProgress[foodId];

    if (!food) {
      return;
    }

    // 同一天按兩次不該記成兩次嘗試。
    if (trialDatesOf(food).includes(today)) {
      return;
    }

    try {
      // 一天一條 leaf。整個清單重寫的話，兩位照顧者同一天各按一次，後到的那筆
      // 會連著自己手上的舊清單把對方那一天蓋掉。
      await firebaseChildren.updateFoodTrial(childId, foodId, {
        trialDates: { [today]: true },
      });
    } catch (error) {
      console.error('新增嘗試日期失敗:', error);
      toast.show(error instanceof Error ? error.message : '新增失敗，請稍後再試');
    }
  };

  const openTracking = (tab: TrackingTab) => {
    setTrackingTab(tab);
    setViewMode('my-tracking');
  };

  return (
    <ComplementaryFoodView
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
      showFoodModal={showFoodModal}
      setShowFoodModal={setShowFoodModal}
      setEditingFood={setEditingFood}
      handleSaveFood={handleSaveFood}
      editingFood={editingFood}
      showAllergyTest={showAllergyTest}
      showFingerFood={showFingerFood}
    />
  );
}
