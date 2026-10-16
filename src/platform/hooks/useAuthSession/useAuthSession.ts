import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useToast } from '../useToast';
import {
  createAuthActions,
  subscribeAuth,
  handleRedirectResult,
} from '~app/platform/services/auth';

export function useAuthSession(onLeave: () => void) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void handleRedirectResult(toast);

    return subscribeAuth((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading, ...createAuthActions(toast, onLeave) };
}
