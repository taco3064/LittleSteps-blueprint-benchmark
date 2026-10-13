import { useState, useEffect } from 'react';
import type {
  FoodTrialInput,
  FoodTrialRecord,
  AllergyReaction,
  AllergyReactionType,
  AllergySeverity,
  FoodPreference,
} from '~app/domain/records';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import { trialDateSet, trialDatesOf } from '~app/domain/foodTrialDates';
export interface FoodTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (foodData: FoodTrialInput) => Promise<void>;
  editingFood?: FoodTrialRecord | null;
}

function initialFoodFields(editingFood?: FoodTrialRecord | null) {
  if (editingFood) {
    return {
      foodName: editingFood.foodName,
      category: editingFood.category || '',
      firstTriedDate: editingFood.firstTriedDate,
      hasAllergy: editingFood.hasAllergy,
      allergyReactions: editingFood.allergyReactions || [],
      preference: editingFood.preference,
      notes: editingFood.notes || '',
      trialDates: trialDatesOf(editingFood),
    };
  }

  return {
    foodName: '',
    category: '',
    firstTriedDate: toLocalDateKey(),
    hasAllergy: false,
    allergyReactions: [] as AllergyReaction[],
    preference: undefined as FoodPreference | undefined,
    notes: '',
    trialDates: [] as string[],
  };
}

function initialForm() {
  return {
    ...initialFoodFields(),
    saving: false,
    error: null as string | null,
    newReactionType: 'rash' as AllergyReactionType,
    newReactionSeverity: 'mild' as AllergySeverity,
    newReactionDescription: '',
    newReactionDate: '',
    reactionError: null as string | null,
  };
}

type FormState = ReturnType<typeof initialForm>;
type SetField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

function foodSave(form: FormState, props: FoodTrialModalProps, setField: SetField) {
  const {
    foodName,
    category,
    firstTriedDate,
    hasAllergy,
    allergyReactions,
    preference,
    notes,
    trialDates,
  } = form;

  const { editingFood, onSave, onClose } = props;

  return async () => {
    if (!foodName.trim()) {
      setField('error', '請輸入食物名稱');

      return;
    }

    if (!firstTriedDate) {
      setField('error', '請選擇首次嘗試日期');

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

    setField('saving', true);
    setField('error', null);

    try {
      // 寫入成功才關；失敗時整張表單留著，家長不用重打一次。
      await onSave(foodData);
      onClose();
    } catch (err) {
      console.error('保存食物記錄失敗:', err);
      setField('error', err instanceof Error ? err.message : '保存失敗，請稍後再試');
    } finally {
      setField('saving', false);
    }
  };
}

function reactionActions(form: FormState, setField: SetField) {
  const {
    allergyReactions,
    trialDates,
    newReactionType,
    newReactionSeverity,
    newReactionDescription,
    newReactionDate,
  } = form;

  const today = toLocalDateKey();

  const addAllergyReaction = () => {
    if (!newReactionDate) {
      setField('reactionError', '請選擇過敏反應日期');

      return;
    }

    const newReaction: AllergyReaction = {
      type: newReactionType,
      severity: newReactionSeverity,
      description: newReactionDescription.trim() || undefined,
      date: newReactionDate,
    };

    setField('allergyReactions', [...allergyReactions, newReaction]);

    // Reset form
    setField('newReactionType', 'rash');
    setField('newReactionSeverity', 'mild');
    setField('newReactionDescription', '');
    setField('newReactionDate', '');
    setField('reactionError', null);
  };

  const removeAllergyReaction = (index: number) => {
    setField(
      'allergyReactions',
      allergyReactions.filter((_, i) => i !== index),
    );
  };

  const addTrialDate = () => {
    setField('trialDates', [...trialDates, today].sort());
  };

  const removeTrialDate = (date: string) => {
    setField(
      'trialDates',
      trialDates.filter((d) => d !== date),
    );
  };

  return {
    addAllergyReaction,
    removeAllergyReaction,
    addTrialDate,
    removeTrialDate,
  };
}

export function useFoodTrialForm(props: FoodTrialModalProps) {
  const [form, setForm] = useState(initialForm);
  const { editingFood, isOpen } = props;

  const setField: SetField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    setForm((current) => ({
      ...current,
      ...initialFoodFields(editingFood),
      error: null,
      reactionError: null,
      saving: false,
    }));
  }, [editingFood, isOpen]);

  return {
    ...form,
    today: toLocalDateKey(),
    handleSave: foodSave(form, props, setField),
    ...reactionActions(form, setField),
    setFoodName: (value: FormState['foodName']) => setField('foodName', value),
    setCategory: (value: FormState['category']) => setField('category', value),
    setFirstTriedDate: (value: FormState['firstTriedDate']) =>
      setField('firstTriedDate', value),
    setHasAllergy: (value: FormState['hasAllergy']) => setField('hasAllergy', value),
    setPreference: (value: FormState['preference']) => setField('preference', value),
    setNotes: (value: FormState['notes']) => setField('notes', value),
    setNewReactionType: (value: FormState['newReactionType']) =>
      setField('newReactionType', value),
    setNewReactionSeverity: (value: FormState['newReactionSeverity']) =>
      setField('newReactionSeverity', value),
    setNewReactionDescription: (value: FormState['newReactionDescription']) =>
      setField('newReactionDescription', value),
    setNewReactionDate: (value: FormState['newReactionDate']) =>
      setField('newReactionDate', value),
  };
}

export type FoodTrialForm = ReturnType<typeof useFoodTrialForm>;
