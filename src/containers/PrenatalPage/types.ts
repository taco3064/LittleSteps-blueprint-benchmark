import type {
  ChildProfile,
  PrenatalCheckupProgress,
} from '~app/domain/records';

export interface PrenatalPageProps {
  currentChild?: ChildProfile | null;
  progress: PrenatalCheckupProgress;
  onComplete: (
    templateId: string,
    record: { completedDate: string; clinicName?: string; notes?: string },
  ) => Promise<void>;
  onUndo: (templateId: string) => Promise<void>;
}
