import type { ReactNode } from 'react';
import { AuthContext } from '~app/contexts/Auth';
import { useAuthController } from '~app/hooks/useAuthController';

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthController();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
