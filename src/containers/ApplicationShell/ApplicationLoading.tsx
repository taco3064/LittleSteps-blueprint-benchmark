import EmptyState from '~app/components/EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import type { ApplicationState } from '~app/hooks/useApplicationState';

export function ApplicationLoading({ state }: { state: ApplicationState }) {
  const { dataPending, loadStalled } = state;

  if (dataPending) {
    if (loadStalled) {
      return (
        <div className="min-h-dscreen bg-warm-white flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <EmptyState
              theme={SERVICE_THEME.littlesteps}
              title="連不上伺服器"
              description="目前似乎沒有網路連線。寶寶的資料存在雲端，連上網路後就會出現。"
              action={{
                label: '重新載入',
                onClick: () => window.location.reload(),
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-dscreen flex items-center justify-center bg-warm-white">
        <div
          className="w-40 h-1 rounded-full bg-primary-light overflow-hidden"
          role="status"
        >
          <div className={
            'h-full w-1/3 rounded-full bg-primary-dark '
            + 'animate-[loading_1.2s_ease-in-out_infinite]'
          }
          />
          <span className="sr-only">載入中</span>
        </div>
      </div>
    );
  }

  return null;
}
