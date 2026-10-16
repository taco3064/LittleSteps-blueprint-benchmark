import { useMemo } from 'react';
import { createSubmitFeedback } from '~app/feedback/services/submit_feedback';

export function useFeedback(userId: string | null) {
  return useMemo(
    () => ({ submitFeedback: createSubmitFeedback(userId) }),
    [userId],
  );
}
