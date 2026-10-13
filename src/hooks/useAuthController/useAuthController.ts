import { useEffect, useRef, useState } from 'react';
import type { User } from '~app/domain/authUser';
import {
  createAuthActions,
  finishRedirect,
  observeAuth,
} from '~app/services/authSession';
import { useToast } from '../useToast';

export function useAuthController() {
  const toast = useToast();
  const toastRef = useRef(toast);

  toastRef.current = toast;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void finishRedirect({ show: (message) => toastRef.current.show(message) });

    return observeAuth((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading, ...createAuthActions(toast) };
}
