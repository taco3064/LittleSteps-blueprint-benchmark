import { useEffect } from 'react';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import {
  AllergyReaction,
  FoodTrialInput,
  FoodTrialRecord,
} from '~app/family/domain/familyRecords';
import { trialDateSet } from '~app/littlesteps/domain/foodTrialDates';
import { fillExistingFoodDraft } from './fillExistingFoodDraft';
import { fillNewFoodDraft } from './fillNewFoodDraft';
import { FoodTrialModalPresentation } from './FoodTrialModalPresentation';
import { useFoodTrialFields } from './useFoodTrialFields';
import { useFoodTrialReactionFields } from './useFoodTrialReactionFields';
interface createAddAllergyReactionProps {
  newReactionDate: string;
  setReactionError: React.Dispatch<React.SetStateAction<string | null>>;
  newReactionType: import('~app/family/domain/familyRecords').AllergyReactionType;
  newReactionSeverity: import('~app/family/domain/familyRecords').AllergySeverity;
  newReactionDescription: string;
  setAllergyReactions: React.Dispatch<
    React.SetStateAction<
      import('~app/family/domain/familyRecords').AllergyReaction[]
    >
  >;
  allergyReactions: import('~app/family/domain/familyRecords').AllergyReaction[];
  setNewReactionType: React.Dispatch<
    React.SetStateAction<
      import('~app/family/domain/familyRecords').AllergyReactionType
    >
  >;
  setNewReactionSeverity: React.Dispatch<
    React.SetStateAction<
      import('~app/family/domain/familyRecords').AllergySeverity
    >
  >;
  setNewReactionDescription: React.Dispatch<React.SetStateAction<string>>;
  setNewReactionDate: React.Dispatch<React.SetStateAction<string>>;
}
interface createFoodSubmitHandlerProps {
  foodName: string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  firstTriedDate: string;
  category: string;
  trialDates: string[];
  hasAllergy: boolean;
  allergyReactions: import('~app/family/domain/familyRecords').AllergyReaction[];
  preference: import('~app/family/domain/familyRecords').FoodPreference | undefined;
  notes: string;
  editingFood:
    import('~app/family/domain/familyRecords').FoodTrialRecord | null | undefined;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: (
    foodData: import('~app/family/domain/familyRecords').FoodTrialInput,
  ) => Promise<void>;
  onClose: () => void;
}

interface FoodTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (foodData: FoodTrialInput) => Promise<void>;
  editingFood?: FoodTrialRecord | null;
}

export default function FoodTrialModal({
  isOpen, onClose, onSave, editingFood,
}: FoodTrialModalProps) {
  const {
    foodName, setFoodName, category, setCategory, firstTriedDate, setFirstTriedDate,
    hasAllergy, setHasAllergy, allergyReactions, setAllergyReactions, preference,
    setPreference, notes, setNotes, trialDates, setTrialDates, saving, setSaving,
    error, setError,
  } = useFoodTrialFields();

  const {
    newReactionType, setNewReactionType, newReactionSeverity, setNewReactionSeverity,
    newReactionDescription, setNewReactionDescription, newReactionDate,
    setNewReactionDate, reactionError, setReactionError,
  } = useFoodTrialReactionFields();

  const today = toLocalDateKey();

  // Populate form when editing
  useEffect(() => {
    setError(null);
    setReactionError(null);
    setSaving(false);

    if (editingFood) {
      fillExistingFoodDraft({
        setFoodName, editingFood, setCategory, setFirstTriedDate, setHasAllergy,
        setAllergyReactions, setPreference, setNotes, setTrialDates,
      });
    } else {
      fillNewFoodDraft({
        setFoodName, setCategory, setFirstTriedDate, setHasAllergy,
        setAllergyReactions, setPreference, setNotes, setTrialDates,
      });
    }
  }, [editingFood, isOpen]);

  const handleSave = createFoodSubmitHandler({
    foodName, setError, firstTriedDate, category, trialDates, hasAllergy,
    allergyReactions, preference, notes, editingFood, setSaving, onSave, onClose,
  });

  const addAllergyReaction = createAddAllergyReaction({
    newReactionDate, setReactionError, newReactionType, newReactionSeverity,
    newReactionDescription, setAllergyReactions, allergyReactions,
    setNewReactionType, setNewReactionSeverity, setNewReactionDescription,
    setNewReactionDate,
  });

  const removeAllergyReaction = (index: number) => {
    setAllergyReactions(allergyReactions.filter((_, i) => i !== index));
  };

  const addTrialDate = () => {
    setTrialDates([...trialDates, today].sort());
  };

  const removeTrialDate = (date: string) => {
    setTrialDates(trialDates.filter((d) => d !== date));
  };

  return (
    <FoodTrialModalPresentation
      isOpen={isOpen}
      onClose={onClose}
      editingFood={editingFood}
      foodName={foodName}
      setFoodName={setFoodName}
      category={category}
      setCategory={setCategory}
      firstTriedDate={firstTriedDate}
      setFirstTriedDate={setFirstTriedDate}
      today={today}
      preference={preference}
      setPreference={setPreference}
      hasAllergy={hasAllergy}
      setHasAllergy={setHasAllergy}
      allergyReactions={allergyReactions}
      removeAllergyReaction={removeAllergyReaction}
      newReactionType={newReactionType}
      setNewReactionType={setNewReactionType}
      newReactionSeverity={newReactionSeverity}
      setNewReactionSeverity={setNewReactionSeverity}
      newReactionDate={newReactionDate}
      setNewReactionDate={setNewReactionDate}
      newReactionDescription={newReactionDescription}
      setNewReactionDescription={setNewReactionDescription}
      reactionError={reactionError}
      addAllergyReaction={addAllergyReaction}
      trialDates={trialDates}
      removeTrialDate={removeTrialDate}
      addTrialDate={addTrialDate}
      notes={notes}
      setNotes={setNotes}
      error={error}
      handleSave={handleSave}
      saving={saving}
    />
  );
}

function createFoodSubmitHandler({
  foodName, setError, firstTriedDate, category, trialDates, hasAllergy,
  allergyReactions, preference, notes, editingFood, setSaving, onSave, onClose,
}: createFoodSubmitHandlerProps) {
  return async () => {
    if (!foodName.trim()) {
      setError('請輸入食物名稱');

      return;
    }

    if (!firstTriedDate) {
      setError('請選擇首次嘗試日期');

      return;
    }

    const foodData: FoodTrialInput = {
      foodName: foodName.trim(),
      category: category.trim() || undefined,
      firstTriedDate,
      // 送出去的是日期集合；編輯時由上層對照存著的那一份算出要加減的 leaf。
      trialDates: trialDateSet(
        trialDates.length > 0 ? trialDates : [firstTriedDate],
      ),
      hasAllergy,
      allergyReactions: hasAllergy ? allergyReactions : undefined,
      preference,
      notes: notes.trim() || undefined,
      updatedAt: editingFood ? new Date().toISOString() : undefined,
    };

    setSaving(true);
    setError(null);

    try {
      // 寫入成功才關；失敗時整張表單留著，家長不用重打一次。
      await onSave(foodData);
      onClose();
    } catch (err) {
      console.error('保存食物記錄失敗:', err);
      setError(err instanceof Error ? err.message : '保存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };
}

function createAddAllergyReaction({
  newReactionDate, setReactionError, newReactionType, newReactionSeverity,
  newReactionDescription, setAllergyReactions, allergyReactions, setNewReactionType,
  setNewReactionSeverity, setNewReactionDescription, setNewReactionDate,
}: createAddAllergyReactionProps) {
  return () => {
    if (!newReactionDate) {
      setReactionError('請選擇過敏反應日期');

      return;
    }

    const newReaction: AllergyReaction = {
      type: newReactionType,
      severity: newReactionSeverity,
      description: newReactionDescription.trim() || undefined,
      date: newReactionDate,
    };

    setAllergyReactions([...allergyReactions, newReaction]);

    // Reset form
    setNewReactionType('rash');
    setNewReactionSeverity('mild');
    setNewReactionDescription('');
    setNewReactionDate('');
    setReactionError(null);
  };
}
