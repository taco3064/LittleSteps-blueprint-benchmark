import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import type { ReactNode } from 'react';
import { formatWeekRange } from '~app/littleguard/domain/radar';
import type { useRadarState } from '~app/littleguard/hooks/useRadarState';
import AppBar from '~app/platform/components/AppBar';
import { RadarBoardView } from '../RadarBoardView';
import { RadarDrawer } from '../RadarDrawer';
import { RadarFailure } from '../RadarFailure';

const NIDSS = 'https://nidss.cdc.gov.tw/';

export function RadarView({
  data,
  failed,
  open,
  setOpen,
  county,
  bands,
  age,
  scrollerRef,
  selectedRef,
  freshness,
  cells,
  board,
  chooseAge,
  headerActions,
  countyPicker,
  onOpenStatistics,
}: ReturnType<typeof useRadarState> & {
  headerActions: ReactNode;
  countyPicker: ReactNode;
  onOpenStatistics: () => void;
}) {
  const theme = SERVICE_THEME.littleguard;

  if (failed || (data && !cells)) {
    return (
      <RadarFailure
        theme={theme}
        headerActions={headerActions}
        onOpenStatistics={onOpenStatistics}
      />
    );
  }

  return (
    <div className={`screen ${theme.pageBg}`}>
      <AppBar
        theme={theme}
        title={theme.name}
        subtitle={theme.role}
        actions={headerActions}
      />
      <main className="screen-body space-y-4">
        <p className="text-sm text-ink-muted">
          {data

            ? `${formatWeekRange(data.weekStart, data.weekEnd)} · 疾管署健保門診就診統計`

            : '載入中'}
        </p>

        {freshness === 'stale' && data && (
          <p className={`panel text-sm ${theme.body}`}>
            這份資料有點舊了，最新一週是
            {' '}
            {formatWeekRange(data.weekStart, data.weekEnd)}
            。
          </p>
        )}
        {freshness === 'expired' && (
          <p className={`panel text-sm ${theme.body}`}>
            這份資料超過一個月沒更新，最新情況請看
            {' '}
            <a href={NIDSS} className={theme.ink} target="_blank" rel="noreferrer">
              疾管署
            </a>
            。
          </p>
        )}

        {data && cells && (
          <RadarBoardView
            theme={theme}
            data={data}
            setOpen={setOpen}
            bands={bands}
            age={age}
            scrollerRef={scrollerRef}
            selectedRef={selectedRef}
            freshness={freshness}
            board={board}
            countyPicker={countyPicker}
            chooseAge={chooseAge}
          />
        )}
      </main>
      <RadarDrawer
        data={data}
        open={open}
        setOpen={setOpen}
        county={county}
        age={age}
        freshness={freshness}
        cells={cells}
        board={board}
      />
    </div>
  );
}
