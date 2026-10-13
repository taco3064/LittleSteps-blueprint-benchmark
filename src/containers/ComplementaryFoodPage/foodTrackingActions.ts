import type { FoodTrialInput, FoodTrialRecord } from '~app/domain/records';
import type { useFoodTracking } from '~app/hooks/useFoodTracking';
import type { useToast } from '~app/hooks/useToast';
import type { createChildRepository } from '~app/services/childRepository';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import { trialDatesOf } from '~app/domain/foodTrialDates';
import { foodTrialChanges } from '~app/domain/foodTrialEdit';
interface FoodActionContext {
  childId: string | null;
  editingFood: FoodTrialRecord | null;
  foodProgress: ReturnType<typeof useFoodTracking>['foodProgress'];
  repository: ReturnType<typeof createChildRepository>;
  toast: ReturnType<typeof useToast>;
  setEditingFood: (food: FoodTrialRecord | null) => void;
  setShowFoodModal: (open: boolean) => void;
}

export function createFoodActions(context: FoodActionContext) {
  return {
    handleAddFood: () => handleAddFood(context),
    handleEditFood: (food: FoodTrialRecord) => handleEditFood(context, food),
    handleSaveFood: (foodData: FoodTrialInput) =>
      handleSaveFood(context, foodData),
    handleDeleteFood: (foodId: string) => handleDeleteFood(context, foodId),
    handleAddTrialDate: (foodId: string) =>
      handleAddTrialDate(context, foodId),
  };
}

function handleAddFood(context: FoodActionContext) {
  const { setEditingFood, setShowFoodModal } = context;

  setEditingFood(null);
  setShowFoodModal(true);
}

function handleEditFood(context: FoodActionContext, food: FoodTrialRecord) {
  const { setEditingFood, setShowFoodModal } = context;

  setEditingFood(food);
  setShowFoodModal(true);
}

async function handleSaveFood(
  context: FoodActionContext,
  foodData: FoodTrialInput,
) {
  const { childId, editingFood, repository } = context;

  if (!childId) {
    throw new Error('請先選擇寶寶');
  }

  if (editingFood) {
    // 只送這次真的改到的欄位，而且是跟「打開表單當下那一版」比出來的：整筆
    // 寫回去會把另一位照顧者同時改的欄位一起蓋掉，被清空的欄位則要寫成
    // null，省略它等於不碰，家長刪掉的備註就會原封不動留在資料庫裡。
    await repository.updateFoodTrial(
      childId,
      editingFood.id,
      foodTrialChanges(editingFood, foodData),
    );
  } else {
    await repository.addFoodTrial(childId, foodData);
  }
}

async function handleDeleteFood(context: FoodActionContext, foodId: string) {
  const { childId, repository, toast } = context;

  if (!childId) {
    return;
  }

  try {
    await repository.deleteFoodTrial(childId, foodId);
  } catch (error) {
    console.error('刪除食物記錄失敗:', error);

    toast.show(
      error instanceof Error ? error.message : '刪除失敗，請稍後再試',
    );
  }
}

async function handleAddTrialDate(
  context: FoodActionContext,
  foodId: string,
) {
  const { childId, foodProgress, repository, toast } = context;

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
    await repository.updateFoodTrial(childId, foodId, {
      trialDates: { [today]: true },
    });
  } catch (error) {
    console.error('新增嘗試日期失敗:', error);

    toast.show(
      error instanceof Error ? error.message : '新增失敗，請稍後再試',
    );
  }
}
