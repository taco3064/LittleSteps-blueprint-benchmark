import DiseaseDrawer from '../DiseaseDrawer';

import type { useRadarState } from '~app/littleguard/hooks/useRadarState';

export function RadarDrawer({
  data,
  open,
  setOpen,
  county,
  age,
  freshness,
  cells,
  board,
}: Pick<
  ReturnType<typeof useRadarState>,
  'data' | 'open' | 'setOpen' | 'county' | 'age' | 'freshness' | 'cells' | 'board'
>) {
  if (!data || !cells || !open) {
    return null;
  }

  return (
    <DiseaseDrawer
      disease={open}
      cell={cells[open]}
      parts={board.find((row) => row.disease === open)?.parts}
      data={data}
      county={county}
      age={age}
      showStatus={freshness !== 'expired'}
      onClose={() => setOpen(null)}
    />
  );
}
