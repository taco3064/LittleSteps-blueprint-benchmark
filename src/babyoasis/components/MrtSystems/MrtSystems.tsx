import { MRT_STATIONS } from '~app/babyoasis/domain/mrtStations';
const SYSTEMS = [...new Set(MRT_STATIONS.map((station) => station.system))];

export function MrtSystems({
  system,
  setSystem,
  chipClass,
}: {
  system: string | null;
  setSystem: (value: string | null) => void;
  chipClass: (value: boolean) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setSystem(null)}
        aria-pressed={system === null}
        className={chipClass(system === null)}
      >
        全部系統
      </button>
      {SYSTEMS.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => setSystem(name)}
          aria-pressed={system === name}
          className={chipClass(system === name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
