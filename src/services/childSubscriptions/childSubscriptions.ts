import { onValue, ref, remove, set } from 'firebase/database';
import type { ChildProfile } from '~app/domain/records';
import { database } from '../firebase';

interface UserChildrenProfile {
  currentChildId?: string;
  childrenIds?: Record<string, boolean>;
}

export function subscribeUserChildren(
  userId: string,
  onData: (profile: UserChildrenProfile | null) => void,
  onError: (error: Error) => void,
) {
  return onValue(
    ref(database, `users/${userId}`),
    (snapshot) => onData(snapshot.val()),
    onError,
  );
}

export function subscribeChildProfile(
  childId: string,
  onData: (profile: ChildProfile | null) => void,
  onError: (error: Error) => void,
) {
  return onValue(
    ref(database, `children/${childId}`),
    (snapshot) => {
      onData(snapshot.exists() ? (snapshot.val() as ChildProfile) : null);
    },
    onError,
  );
}

export function restoreChildIndex(childId: string) {
  return set(ref(database, `childIndex/${childId}`), true);
}

export function pruneChildReference(userId: string, childId: string) {
  return remove(ref(database, `users/${userId}/childrenIds/${childId}`));
}

export function clearSelectedChild(userId: string) {
  return remove(ref(database, `users/${userId}/currentChildId`));
}
