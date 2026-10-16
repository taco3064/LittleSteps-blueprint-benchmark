import { useCallback } from 'react';
import { goTo } from '~app/portal/services/navigate';

export function useNavigation() {
  return useCallback(goTo, []);
}
