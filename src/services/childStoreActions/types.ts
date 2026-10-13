import type { User } from '~app/domain/authUser';
import type { ChildStore } from '~app/domain/childStore';
import type { createChildRepository } from '../childRepository';
export type ActionContext = Pick<
  ChildStore,
  | 'currentChild'
  | 'currentChildMilestoneProgress'
  | 'currentChildVaccineProgress'
  | 'currentChildDevelopmentProgress'
  | 'currentChildToothProgress'
  | 'childProfiles'
  | 'pregnancyChild'
> & {
  user: User | null;
  childCount: number;
  firebaseChildren: ReturnType<typeof createChildRepository>;
  toast: { show(message: string): void };
};
