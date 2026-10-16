import { createContext } from 'react';
import type { AuthContextType } from '~app/platform/domain/auth';
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthContextProvider = AuthContext.Provider;
