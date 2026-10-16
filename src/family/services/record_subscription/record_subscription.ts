import { ref, onValue, remove, set, type DataSnapshot } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

export function subscribeRecord(
  path: string,
  next: (value: DataSnapshot) => void,
  failure: (error: Error) => void,
) {
  return onValue(ref(database, path), next, failure);
}

export function removeRecord(path: string) {
  return remove(ref(database, path));
}

export function writeRecord(path: string, value: unknown) {
  return set(ref(database, path), value);
}
