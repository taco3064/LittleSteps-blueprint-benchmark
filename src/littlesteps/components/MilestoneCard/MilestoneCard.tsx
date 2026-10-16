import { Check, ChevronRight } from 'lucide-react';
import { formatDate } from '~app/platform/domain/calendar';
import { Milestone } from '~app/knowledge/domain/referenceModels';

interface MilestoneCardProps {
  milestone: Milestone;
  isCompleted: boolean;
  achievedDate?: string;
  onToggle: () => void;
  onClick: () => void;
}

export default function MilestoneCard({
  milestone, isCompleted, achievedDate, onToggle, onClick,
}: MilestoneCardProps) {
  return (
    <div className="card flex gap-3 items-start">
      {/*
        The visual mark stays 24px; the button around it is a full 44px so it can
        actually be hit. The negative margin keeps the row's rhythm unchanged.
      */}
      <button
        onClick={onToggle}
        aria-label={isCompleted ? '取消完成' : '標記完成'}
        className="btn-icon -m-2.5 shrink-0"
      >
        <span
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${isCompleted ? 'bg-primary-dark border-primary-dark' : 'border-ink/25'}
          `}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </span>
      </button>

      <button
        onClick={onClick}
        className="flex-1 min-w-0 flex items-start gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className={`mb-1 ${isCompleted ? 'line-through opacity-60' : ''}`}>
            {milestone.title}
          </h3>
          {isCompleted && achievedDate && (
            <p className="text-xs text-ink-faint mt-0.5">
              完成日期:
              {' '}
              {formatDate(achievedDate)}
            </p>
          )}
          <p className="text-sm text-ink-muted line-clamp-2">{milestone.summary}</p>
        </div>
        <ChevronRight
          className="w-5 h-5 text-ink-faint shrink-0 mt-0.5"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
