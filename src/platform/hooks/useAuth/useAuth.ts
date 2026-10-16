import { useContext } from 'react';
import { AuthContext } from '~app/platform/contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * 只想知道「現在有沒有人登入」的地方用這個。
 *
 * AccountButton 掛在每個服務的 AppBar 上，而那些 shell 會被單元測試單獨
 * 掛載，那時沒有 AuthProvider。頭像只是裝飾，缺了就畫預設圖示，不該讓
 * 整個 shell 掛掉。真正需要登入動作的 AccountSheet 仍然用嚴格版。
 */
export function useOptionalAuth() {
  return useContext(AuthContext);
}
