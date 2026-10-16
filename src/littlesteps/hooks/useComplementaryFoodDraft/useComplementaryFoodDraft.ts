import { useState } from 'react';
import { FoodTrialRecord } from '~app/family/domain/familyRecords';
import type { TrackingTab, ViewMode } from '~app/littlesteps/domain/foodTypes';

export function useComplementaryFoodDraft() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');

  const [trackingTab, setTrackingTab] = useState<TrackingTab>('foods');

  const [showAllergyTest, setShowAllergyTest] = useState(false);

  const [showFingerFood, setShowFingerFood] = useState(false);

  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const [showFoodModal, setShowFoodModal] = useState(false);

  const [editingFood, setEditingFood] = useState<FoodTrialRecord | null>(null);

  return {
    viewMode, setViewMode, trackingTab, setTrackingTab, showAllergyTest,
    setShowAllergyTest, showFingerFood, setShowFingerFood, expandedStage,
    setExpandedStage, showFoodModal, setShowFoodModal, editingFood, setEditingFood,
  };
}
