import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { VenueReportTarget } from '~app/feedback/domain/venueReport';
import { tap } from '~app/platform/components/Motion';
import type { User } from 'firebase/auth';
import FeedbackModal from '../FeedbackModal';

export default function VenueReportButtonView0Part1({
  setHasOpened,
  setIsOpen,
  onOpenChange,
  target,
  className,
  hasOpened,
  isOpen,
  handleSubmit,
  user,
  onSignIn,
}: {
  setHasOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenChange: ((open: boolean) => void) | undefined;
  target: VenueReportTarget;
  className: string | undefined;
  hasOpened: boolean;
  isOpen: boolean;
  handleSubmit: (
    title: string,
    content: string,
    shareContact: boolean,
  ) => Promise<void>;
  user: User | null;
  onSignIn: () => void;
}) {
  return (
    <>
      <motion.button
        type="button"
        whileTap={tap}
        onClick={() => {
          setHasOpened(true);
          setIsOpen(true);
          onOpenChange?.(true);
        }}
        // Thirty cards in one list carry this same button. Announced as nothing
        // but "這裡的資訊不對？", a screen reader user cannot tell which venue
        // they are about to report.
        aria-label={`這裡的資訊不對？回報 ${target.name}`}
        className={`btn-ghost ${className ?? ''}`}
      >
        這裡的資訊不對？
      </motion.button>

      {/* Portalled to `body`, the same way `AccountButton` portals the account
          sheet, and for the same two reasons.

          Positioning: the nursing-room detail sheet is a framer-motion bottom
          sheet, so it carries a transform and clips its overflow. A
          `position: fixed` modal rendered inside it is measured against that
          sheet instead of the viewport, and clipped to its 70vh box — the
          backdrop dimmed only the sheet, and a taller form would have been cut
          off at the top.

          Layer: BabyOasis stacks its own overlays at z-[1500] and z-[2000] to
          clear Leaflet's panes, so once portalled the default z-50 renders
          underneath the map. z-[2500] is the layer the account sheet already
          uses for exactly this; the toast stays above at z-[3000] so the
          confirmation is still readable. */}
      {hasOpened
        && createPortal(
          <div className="relative z-[2500]">
            <FeedbackModal
              isOpen={isOpen}
              onClose={() => {
                setIsOpen(false);
                onOpenChange?.(false);
              }}
              onSubmit={handleSubmit}
              userName={user?.displayName || '用戶'}
              venue={{
                target,
                signIn: user ? null : onSignIn,
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
