import DiseaseDrawer from '~app/components/DiseaseDrawer';
import type { RadarModel } from './useRadarModel';

export function RadarDetails({ model }: { model: RadarModel }) {
  const { open, cells, data, board, county, age, freshness, setOpen } = model;

  if (!open || !cells || !data) {
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
