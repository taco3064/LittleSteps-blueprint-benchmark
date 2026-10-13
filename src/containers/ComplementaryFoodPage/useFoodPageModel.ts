import { useState } from 'react';
import type { User } from '~app/domain/authUser';
import type { ChildProfile, FoodTrialRecord } from '~app/domain/records';
import type { TrackingTab, ViewMode } from '~app/domain/types';
import { useToast } from '~app/hooks/useToast';
import { useFoodTracking } from '~app/hooks/useFoodTracking';
import { createChildRepository } from '~app/services/childRepository';
import { createFoodActions } from './foodTrackingActions';
export interface ComplementaryFoodPageProps {
  currentChild?: ChildProfile | null;
  user: User | null;
}

export function useFoodPageModel({
  currentChild,
  user,
}: ComplementaryFoodPageProps) {
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [trackingTab, setTrackingTab] = useState<TrackingTab>('foods');
  const [showAllergyTest, setShowAllergyTest] = useState(false);
  const [showFingerFood, setShowFingerFood] = useState(false);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [showFoodModal, setShowFoodModal] = useState(false);

  const [editingFood, setEditingFood] = useState<FoodTrialRecord | null>(
    null,
  );

  const childId = currentChild?.id || null;

  const { foodProgress, foodTrials, stats, error } = useFoodTracking(
    childId,
    user,
  );

  const repository = createChildRepository(user?.uid || null);

  const actions = createFoodActions({
    childId,
    editingFood,
    foodProgress,
    repository,
    toast,
    setEditingFood,
    setShowFoodModal,
  });

  const openTracking = (tab: TrackingTab) => {
    setTrackingTab(tab);
    setViewMode('my-tracking');
  };

  return {
    viewMode,
    setViewMode,
    trackingTab,
    setTrackingTab,
    showAllergyTest,
    setShowAllergyTest,
    showFingerFood,
    setShowFingerFood,
    expandedStage,
    setExpandedStage,
    showFoodModal,
    setShowFoodModal,
    editingFood,
    setEditingFood,
    foodTrials,
    stats,
    error,
    openTracking,
    actions,
  };
}
