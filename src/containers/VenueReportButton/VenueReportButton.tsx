import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useOptionalAuth } from '~app/hooks/useAuth';
import { createChildRepository } from '~app/services/childRepository';
import { useToast } from '~app/hooks/useToast';
import { tap } from '~app/domain/motion';
import FeedbackModal from '~app/components/FeedbackModal';
import type { VenueReportTarget } from '~app/domain/venueReport';

interface VenueReportButtonProps {
  target: VenueReportTarget;
  /** A card footer and a bottom sheet want different spacing and type size. */
  className?: string;
  /**
   * Told whenever the form opens or closes.
   *
   * A dialog that hosts this button needs to know: both its Escape handler
   * and the form's are document-level listeners, so one keypress reaches both
   * and would dismiss the host as well as the form. The host suppresses its
   * own Escape while this is open. Surfaces with nothing underneath - the
   * family-centre card - can ignore it.
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * The report action, sitting next to the data it disputes rather than in a
 * corner of the screen.
 *
 * The global feedback button collects "something about LittleSteps is odd".
 * A public roster breaks far more specifically than that: this room is gone,
 * the door is locked, the hours are wrong. A report like that has to start
 * from the record the parent is looking at, or they end up copying the name
 * and the address out of the screen they just left.
 *
 * Visible, and tappable, while signed out. The rules require `auth != null`
 * to write a feedback record, but that governs what happens after the tap —
 * it is not a reason to hide the entry point, and hiding it is exactly why a
 * parent standing at a locked door currently has nowhere to go.
 *
 * `useOptionalAuth` rather than the strict hook: this button hangs off the
 * family-centre card and the nursing-room sheet, and both of those are mounted
 * on their own in unit tests, where there is no `AuthProvider`. No context
 * means signed out — which is the state this button most needs to explain.
 */
export default function VenueReportButton({
  target,
  className,
  onOpenChange,
}: VenueReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  /*
    Whether the form has ever been opened from this button.

    The family-centre list renders 30 cards, so an unconditional portal put 30
    empty positioned nodes on `body` and mounted 30 `FeedbackModal` instances
    behind them on every list render - for a form a parent opens at most once.
    Latching on first open instead of guarding on `isOpen` costs one boolean
    and keeps the closing animation: `ModalFrame` runs its exit inside its own
    `AnimatePresence`, which needs the subtree to still be mounted while
    `isOpen` goes false. Guarding on `isOpen` unmounts it in the same frame and
    the sheet vanishes instead of sliding away - the exact mistake documented
    on `RoomDetailSheet`.
  */
  const [hasOpened, setHasOpened] = useState(false);
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const { submitFeedback } = createChildRepository(user?.uid ?? null);
  const toast = useToast();

  const handleSubmit = async (
    title: string,
    content: string,
    shareContact: boolean,
  ) => {
    if (!user) {
      throw new Error('請先登入');
    }

    await submitFeedback({
      title,
      content,
      userId: user.uid,
      /*
        Omitted entirely unless the parent ticked the reply box, rather than
        sent as ''. The rules treat both fields as optional, but '' is a string
        they accept and store, so a blank one is still a record of an account
        that was never asked. A ticked box on an account that has no email or
        no display name sends nothing for the missing one either: the blank and
        the placeholder name this used to substitute are both unrepliable, and
        an inbox column that looks filled in is worse than an empty one.
        `userId` is what ties the report to an account; these two exist only so
        a reply can be written.
      */
      ...(shareContact && user.email ? { userEmail: user.email } : {}),
      ...(shareContact && user.displayName ? { userName: user.displayName } : {}),
    });

    toast.show('收到了，謝謝你。我們會逐筆確認再改資料。', 'success');
  };

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
                signIn: user ? null : () => void auth?.signInWithGoogle(),
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
