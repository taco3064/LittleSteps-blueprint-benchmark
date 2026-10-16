import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import { motion } from 'framer-motion';

import { stagger } from '~app/platform/components/Motion';

import type { ReactNode } from 'react';

import DiseaseRow from '../DiseaseRow';

import { summariseBoard } from '~app/littleguard/domain/radar';

import type { useRadarState } from '~app/littleguard/hooks/useRadarState';

import { RadarAgeBands } from '../RadarAgeBands';

import { RadarExplanation } from '../RadarExplanation';

export function RadarBoardView({
  theme,
  data,
  setOpen,
  bands,
  age,
  scrollerRef,
  selectedRef,
  freshness,
  board,
  chooseAge,
  countyPicker,
}: Pick<
  (ReturnType<typeof useRadarState> & { theme: ServiceTheme }),
  | 'theme'
  | 'data'
  | 'setOpen'
  | 'bands'
  | 'age'
  | 'scrollerRef'
  | 'selectedRef'
  | 'freshness'
  | 'board'
  | 'chooseAge'
> & { countyPicker: ReactNode }) {
  if (!data) {
    return null;
  }

  return (
    <>
      {/* 一頁裡唯一的說明書。圖示會落在標題旁邊當裝飾，所以這裡不放。 */}
      <RadarExplanation />

      {countyPicker}

      <RadarAgeBands
        theme={theme}
        data={data}
        bands={bands}
        age={age}
        scrollerRef={scrollerRef}
        selectedRef={selectedRef}
        chooseAge={chooseAge}
      />

      {/* 每週打開的人要的是一句話。過期的資料撐不起這句話，就不給。 */}
      {freshness !== 'expired' && (
        <p className="panel text-ink font-medium">{summariseBoard(board)}</p>
      )}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {board.map((row) => (
          <DiseaseRow
            key={row.disease}
            disease={row.disease}
            cell={row.cell}
            parts={row.parts}
            showStatus={freshness !== 'expired'}
            onOpen={() => setOpen(row.disease)}
          />
        ))}
      </motion.div>

      <p className="text-sm text-ink-faint">
        右邊的人次是這一週該縣市、該年齡層的健保門診就診次數。
      </p>
    </>
  );
}
