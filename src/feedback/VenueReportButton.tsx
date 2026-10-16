import { useState } from 'react';
import VenueReportButtonView0Part1 from '~app/feedback/components/VenueReportButton';
import type { VenueReportTarget } from '~app/feedback/domain/venueReport';
import { useFeedback } from '~app/feedback/hooks/useFeedback';
import { useOptionalAuth } from '~app/platform/hooks/useAuth';
import { useToast } from '~app/platform/hooks/useToast';

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
  const { submitFeedback } = useFeedback(user?.uid ?? null);
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
      ...(shareContact && user.displayName
        ? { userName: user.displayName }
        : {}),
    });

    toast.show('收到了，謝謝你。我們會逐筆確認再改資料。', 'success');
  };

  return (
    <VenueReportButtonView0Part1
      setHasOpened={setHasOpened}
      setIsOpen={setIsOpen}
      onOpenChange={onOpenChange}
      target={target}
      className={className}
      hasOpened={hasOpened}
      isOpen={isOpen}
      handleSubmit={handleSubmit}
      user={user}
      onSignIn={() => void auth?.signInWithGoogle()}
    />
  );
}
