import type { ToastApi } from '~app/platform/domain/toast';

export function createReportWriteFailure({ toast }: { toast: ToastApi }) {
  return (error: unknown, fallback: string) => {
    console.error(fallback, error);
    toast.show(error instanceof Error ? error.message : fallback);
  };
}
