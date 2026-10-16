export function createHandleQuickLog({
  handleSleepQuickLog, openLogForm,
}: {
  handleSleepQuickLog: () => Promise<void>;
  openLogForm: (type: 'feeding' | 'sleep' | 'diaper') => void;
}) {
  return (type: 'feeding' | 'sleep' | 'diaper') => {
    if (type === 'sleep') {
      void handleSleepQuickLog();

      return;
    }

    openLogForm(type);
  };
}
