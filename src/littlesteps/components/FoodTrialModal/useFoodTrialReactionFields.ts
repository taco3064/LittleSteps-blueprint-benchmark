import { useState } from 'react';
import {
  AllergyReactionType,
  AllergySeverity,
} from '~app/family/domain/familyRecords';

export function useFoodTrialReactionFields() {
  // New allergy reaction form
  const [newReactionType, setNewReactionType]
    = useState<AllergyReactionType>('rash');

  const [newReactionSeverity, setNewReactionSeverity]
    = useState<AllergySeverity>('mild');

  const [newReactionDescription, setNewReactionDescription] = useState('');

  const [newReactionDate, setNewReactionDate] = useState('');

  const [reactionError, setReactionError] = useState<string | null>(null);

  return {
    newReactionType, setNewReactionType, newReactionSeverity, setNewReactionSeverity,
    newReactionDescription, setNewReactionDescription, newReactionDate,
    setNewReactionDate, reactionError, setReactionError,
  };
}
