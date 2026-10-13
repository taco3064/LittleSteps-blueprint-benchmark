import { onValue, ref } from 'firebase/database';
import { database } from '../firebase';

/** Subscribe to an authenticated child-record collection and expose only its data. */
export function subscribeChildCollection(
  collectionPath: string,
  onData: (data: unknown) => void,
  onError: (error: Error) => void,
) {
  return onValue(
    ref(database, collectionPath),
    (snapshot) => onData(snapshot.val()),
    onError,
  );
}
