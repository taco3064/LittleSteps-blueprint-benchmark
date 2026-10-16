import type { MrtStation } from '~app/babyoasis/domain/mrtStations';
import { CATEGORY_CHIPS, CATEGORY_LABEL } from '~app/babyoasis/domain/roomCategory';
import { type RoomFilters } from '~app/babyoasis/domain/roomFilters';

export function RoomFilterChips({
  filters,
  station,
  setAreaOpen,
  setStationOpen,
  chipClass,
  onFiltersChange,
}: {
  filters: RoomFilters;
  station: MrtStation | null;
  setAreaOpen: (value: boolean) => void;
  setStationOpen: (value: boolean) => void;
  chipClass: (value: boolean) => string;
  onFiltersChange: (value: RoomFilters) => void;
}) {
  const { city, district, category, excludeInternal } = filters;

  return (
    <div
      data-testid="scroll-row-oasis-filters"
      className="row-bleed flex gap-2 py-1"
    >
      <button
        type="button"
        onClick={() => setAreaOpen(true)}
        aria-haspopup="dialog"
        className={chipClass(city !== null)}
      >
        {city === null

          ? '全部縣市'

          : district === null

            ? city

            : `${city} ${district}`}
      </button>
      {/* 捷運站不是篩選條件而是定位點，但它跟篩選籤一樣是「怎麼收窄」的操作，
            家長會在同一列找它。 */}
      <button
        type="button"
        onClick={() => setStationOpen(true)}
        aria-haspopup="dialog"
        className={chipClass(station !== null)}
      >
        {station === null ? '捷運站' : `捷運${station.name}站`}
      </button>
      {CATEGORY_CHIPS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() =>
            onFiltersChange({ ...filters, category: category === id ? null : id })}
          aria-pressed={category === id}
          className={chipClass(category === id)}
        >
          {CATEGORY_LABEL[id]}
        </button>
      ))}
      <button
        type="button"
        onClick={() =>
          onFiltersChange({ ...filters, excludeInternal: !excludeInternal })}
        aria-pressed={excludeInternal}
        className={chipClass(excludeInternal)}
      >
        排除內部場所
      </button>
    </div>
  );
}
