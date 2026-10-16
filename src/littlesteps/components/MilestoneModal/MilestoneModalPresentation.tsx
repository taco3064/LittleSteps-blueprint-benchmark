import { AnimatePresence, motion } from 'framer-motion';

import { Milestone } from '~app/knowledge/domain/referenceModels';

import { Check, Share2, X } from 'lucide-react';

import { backdrop, sheet } from '~app/platform/components/Motion';

import { formatDate } from '~app/platform/domain/calendar';
interface MilestoneModalPresentation3Props {
  milestone: Milestone;
}

interface MilestoneModalPresentation2Props {
  milestone: Milestone;
  isCompleted: boolean;
  achievedDate: string | undefined;
  onClose: () => void;
  onToggle: () => void;
  handleShare: () => Promise<void>;
}

interface MilestoneModalPresentation1Props {
  onClose: () => void;
  milestone: Milestone;
  isCompleted: boolean;
  achievedDate: string | undefined;
  onToggle: () => void;
  handleShare: () => Promise<void>;
}

interface MilestoneModalPresentationProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone;
  isCompleted: boolean;
  achievedDate: string | undefined;
  onToggle: () => void;
  handleShare: () => Promise<void>;
}

export function MilestoneModalPresentation3({
  milestone,
}: MilestoneModalPresentation3Props) {
  return (
    <div className="px-4 py-6 space-y-6">
      <p className="leading-relaxed">{milestone.summary}</p>

      <div>
        <h3 className="mb-2">詳細說明</h3>
        <p className="text-ink-muted leading-relaxed">{milestone.details}</p>
      </div>

      {milestone.tips && milestone.tips.length > 0 && (
        <div>
          <h3 className="mb-3">練習小撇步</h3>
          <ul className="space-y-2">
            {milestone.tips.map((tip, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-primary-dark flex-shrink-0">•</span>
                <span className="text-ink-muted">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function MilestoneModalPresentation2({
  milestone, isCompleted, achievedDate, onClose, onToggle, handleShare,
}: MilestoneModalPresentation2Props) {
  return (
    <motion.div
      {...sheet}
      className={
        'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[85vh] '
        + 'overflow-y-auto'
      }
    >
      {/* Header */}
      <div
        className={
          'sticky top-0 bg-white border-b border-ink/10 px-4 py-3 flex '
          + 'items-center justify-between'
        }
      >
        <div className="flex-1 pr-4">
          <h2>{milestone.title}</h2>
          {isCompleted && achievedDate && (
            <p className="text-sm text-ink-faint mt-1">
              完成日期:
              {' '}
              {formatDate(achievedDate)}
            </p>
          )}
        </div>
        <button onClick={onClose} className="btn-icon" aria-label="關閉">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <MilestoneModalPresentation3 milestone={milestone} />

      {/* Actions */}
      <div
        className={
          'sticky bottom-0 bg-white border-t border-ink/10 px-4 py-4 flex ' + 'gap-3'
        }
      >
        <button
          onClick={onToggle}
          className={`flex-1 ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
        >
          <Check className="w-5 h-5" />
          {isCompleted ? '已完成' : '標記完成'}
        </button>
        <button onClick={handleShare} className="btn-secondary">
          <Share2 className="w-5 h-5" />
          分享
        </button>
      </div>
    </motion.div>
  );
}

export function MilestoneModalPresentation1({
  onClose, milestone, isCompleted, achievedDate, onToggle, handleShare,
}: MilestoneModalPresentation1Props) {
  return (
    <>
      <motion.div
        {...backdrop}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />

      <MilestoneModalPresentation2
        milestone={milestone}
        isCompleted={isCompleted}
        achievedDate={achievedDate}
        onClose={onClose}
        onToggle={onToggle}
        handleShare={handleShare}
      />
    </>
  );
}

export function MilestoneModalPresentation({
  isOpen, onClose, milestone, isCompleted, achievedDate, onToggle, handleShare,
}: MilestoneModalPresentationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <MilestoneModalPresentation1
          onClose={onClose}
          milestone={milestone}
          isCompleted={isCompleted}
          achievedDate={achievedDate}
          onToggle={onToggle}
          handleShare={handleShare}
        />
      )}
    </AnimatePresence>
  );
}
