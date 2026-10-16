import { logEvent } from '~app/platform/services/firebase';
export const logMilestoneToggle = (achieved: boolean) =>
  logEvent('milestone_toggle', { achieved });
export const logVaccineToggle = (administered: boolean) =>
  logEvent('vaccine_toggle', { administered });
export const logChildProfileAction = (
  action: 'create' | 'update' | 'delete' | 'switch',
) => logEvent('child_profile_action', { action });
