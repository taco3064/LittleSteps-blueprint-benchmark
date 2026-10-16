import type { User } from 'firebase/auth';
import type {
  ChildProfile,
  DevelopmentCheckProgress,
  MilestoneProgress,
  ToothProgress,
  VaccineProgress,
} from '~app/family/domain/familyRecords';

import { useToast } from '~app/platform/hooks/useToast';

import { createChildRecords } from '~app/family/services/child_records';

export interface ChildActionContext {
  user: User | null;
  toast: ReturnType<typeof useToast>;
  firebaseChildren: ReturnType<typeof createChildRecords>;
  currentChild: ChildProfile | undefined;
  currentChildMilestoneProgress: MilestoneProgress;
  currentChildVaccineProgress: VaccineProgress;
  childCount: number;
  childProfiles: ChildProfile[];
  currentChildDevelopmentProgress: DevelopmentCheckProgress;
  currentChildToothProgress: ToothProgress;
  pregnancyChild: ChildProfile | undefined;
}
