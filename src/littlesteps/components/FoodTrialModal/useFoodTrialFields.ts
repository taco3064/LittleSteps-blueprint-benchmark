import { useState } from 'react';
import { AllergyReaction, FoodPreference } from '~app/family/domain/familyRecords';

export function useFoodTrialFields() {
  const [foodName, setFoodName] = useState('');

  const [category, setCategory] = useState('');

  const [firstTriedDate, setFirstTriedDate] = useState('');

  const [hasAllergy, setHasAllergy] = useState(false);

  const [allergyReactions, setAllergyReactions] = useState<AllergyReaction[]>([]);

  const [preference, setPreference] = useState<FoodPreference | undefined>(
    undefined,
  );

  const [notes, setNotes] = useState('');

  const [trialDates, setTrialDates] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  return {
    foodName, setFoodName, category, setCategory, firstTriedDate, setFirstTriedDate,
    hasAllergy, setHasAllergy, allergyReactions, setAllergyReactions, preference,
    setPreference, notes, setNotes, trialDates, setTrialDates, saving, setSaving,
    error, setError,
  };
}
