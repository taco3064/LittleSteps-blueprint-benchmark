import {
  formatWeekRange,
  summariseBoard,
} from '~app/domain/radar';
import CountyPicker from '../CountyPicker';
import { RadarDetails } from './RadarDetails';

import { RadarAgePicker } from './RadarAgePicker';
import { RadarBoard } from './RadarBoard';
import { RadarExplanation } from './RadarExplanation';
import { RadarLayout } from './RadarLayout';
import { RadarUnavailable } from './RadarUnavailable';
import { useRadarModel } from './useRadarModel';

const NIDSS = 'https://nidss.cdc.gov.tw/';

export default function RadarPage() {
  const model = useRadarModel();

  const { theme,
    data,
    failed,
    counties,
    county,
    freshness,
    cells,
    board,
    chooseCounty } = model;

  if (failed || (data && !cells)) {
    return (
      <RadarUnavailable model={model} />
    );
  }

  return (
    <RadarLayout theme={theme} spacious footer={<RadarDetails model={model} />}>
      <p className="text-sm text-ink-muted">
        {data
          ? `${formatWeekRange(data.weekStart, data.weekEnd)} · 疾管署健保門診就診統計`
          : '載入中'}
      </p>

      {freshness === 'stale' && data && (
        <p className={`panel text-sm ${theme.body}`}>
          {'這份資料有點舊了，最新一週是 '}
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
        <>
          {/* 一頁裡唯一的說明書。圖示會落在標題旁邊當裝飾，所以這裡不放。 */}
          <RadarExplanation />

          <CountyPicker
            counties={counties}
            selected={county}
            onSelect={chooseCounty}
          />

          <RadarAgePicker model={model} />

          {/* 每週打開的人要的是一句話。過期的資料撐不起這句話，就不給。 */}
          {freshness !== 'expired' && (
            <p className="panel text-ink font-medium">{summariseBoard(board)}</p>
          )}

          <RadarBoard model={model} />

          <p className="text-sm text-ink-faint">
            右邊的人次是這一週該縣市、該年齡層的健保門診就診次數。
          </p>
        </>
      )}
    </RadarLayout>
  );
}
