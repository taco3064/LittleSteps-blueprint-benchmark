import { createContext } from 'react';
import type { User } from '~app/domain/authUser';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * 刪掉 Firebase Auth 使用者本身，並回報有沒有真的刪掉。資料端要先刪乾淨
   * （見 useChildStore 的 deleteAccountData），這一步一走，這個客戶端就沒有
   * 身分再回頭清資料了。回 false 時帳號還在，呼叫端該把入口留著讓家長再試。
   */
  deleteAccount: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
