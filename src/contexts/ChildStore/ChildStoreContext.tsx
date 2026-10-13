import { createContext } from 'react';
import type { ChildStore } from '~app/domain/childStore';
export const ChildStoreContext = createContext<ChildStore | null>(null);
