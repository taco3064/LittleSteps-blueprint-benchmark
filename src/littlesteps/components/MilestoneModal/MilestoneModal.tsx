import { useEffect } from 'react';
import { Milestone } from '~app/knowledge/domain/referenceModels';
import { MilestoneModalPresentation } from './MilestoneModalPresentation';

interface MilestoneModalProps {
  milestone: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
  isCompleted: boolean;
  achievedDate?: string;
  onToggle: () => void;
  onShare: () => Promise<void>;
}

export default function MilestoneModal({
  milestone, isOpen, onClose, isCompleted, achievedDate, onToggle, onShare,
}: MilestoneModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!milestone) {
    return null;
  }

  return (
    <MilestoneModalPresentation
      isOpen={isOpen}
      onClose={onClose}
      milestone={milestone}
      isCompleted={isCompleted}
      achievedDate={achievedDate}
      onToggle={onToggle}
      handleShare={onShare}
    />
  );
}
