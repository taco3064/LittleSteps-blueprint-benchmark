import { useState } from 'react';
import { splitOverdueByProfileStart } from '~app/domain/profileHistory';
import { useAuth } from '../useAuth';
import { useCareTasks } from '../useCareTasks';
import { useChildStoreContext } from '../useChildStoreContext';
import { useDailyLogs } from '../useDailyLogs';
import { useDiary } from '../useDiary';
import { useLoadStalled } from '../useLoadStalled';
import { usePageNavigation } from '../usePageNavigation';

export function useApplicationState() {
  const auth = useAuth();
  const store = useChildStoreContext();
  const navigation = usePageNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use the resolved child: a shared child's deletion can clear the selected ID.
  const { logs: dailyLogs } = useDailyLogs(
    store.currentChild?.id ?? null,
    auth.user,
  );

  const { tasks: careTasks } = useCareTasks(store.currentChild);

  const { entries: diaryEntries } = useDiary(
    store.currentChild?.id ?? null,
    auth.user,
  );

  const reminderBadge
    = splitOverdueByProfileStart(careTasks, store.currentChild?.createdAt).overdue
      .length + careTasks.filter((task) => task.status === 'due').length;

  const dataPending
    = auth.loading || (auth.user !== null && store.childrenLoading);

  const loadStalled = useLoadStalled(dataPending);

  return {
    ...auth,
    ...store,
    ...navigation,
    sidebarOpen,
    setSidebarOpen,
    dailyLogs,
    careTasks,
    diaryEntries,
    reminderBadge,
    dataPending,
    loadStalled,
  };
}

export type ApplicationState = ReturnType<typeof useApplicationState>;
