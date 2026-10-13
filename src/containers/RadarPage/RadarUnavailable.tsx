import EmptyState from '~app/components/EmptyState';

import { RadarLayout } from './RadarLayout';
import type { RadarModel } from './useRadarModel';

const NIDSS = 'https://nidss.cdc.gov.tw/';

export function RadarUnavailable({ model }: { model: RadarModel }) {
  const { theme } = model;

  return (
    <RadarLayout theme={theme}>
      <EmptyState
        theme={theme}
        title="現在抓不到資料"
        description="可以先看疾管署的傳染病統計查詢系統。"
        action={{
          label: '前往疾管署',
          onClick: () => window.open(NIDSS, '_blank', 'noreferrer'),
        }}
      />
    </RadarLayout>
  );
}
