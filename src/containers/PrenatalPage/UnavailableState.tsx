import { THEME } from './presentation';

import { Baby } from 'lucide-react';

import BloomShell from '../BloomShell';
import EmptyState from '~app/components/EmptyState';

import { goTo } from '~app/domain/navigate';

export function BornNotice() {
  return (
    <BloomShell title="產檢時程" backTo="littlebloom">
      <EmptyState
        theme={THEME}
        icon={Baby}
        title="寶寶已經出生了"
        description={
          '產檢時程已經走完，紀錄都保留著。\n寶寶的健兒門診與疫苗時程請到 LittleSteps 查看。'
        }
        action={{
          label: '前往 LittleSteps',
          onClick: () => {
            goTo('littlesteps');
          },
        }}
      />
    </BloomShell>
  );
}

export function MissingPregnancyNotice() {
  return (
    <BloomShell title="產檢時程" backTo="littlebloom">
      <EmptyState
        theme={THEME}
        title="還沒有孕期資料"
        description={
          '新增一個孕期檔案並填入預產期後，\n14 次公費產檢的時程會依末次月經自動排出來。'
        }
        action={{
          label: '回 LittleBloom 建立孕期檔案',
          onClick: () => {
            // 留在 LittleBloom 之內：新增孕期檔案的入口在本服務的首頁。
            goTo('littlebloom');
          },
        }}
      />
    </BloomShell>
  );
}
