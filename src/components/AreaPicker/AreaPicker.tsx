import { useMemo } from 'react';
import type { NursingRoom } from '~app/domain/records';
import ModalFrame from '../ModalFrame';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

/**
 * County order the 國健署 uses and Taiwanese addresses read in: north to
 * south, the six municipalities first, the outlying islands last. Only the
 * order lives here — which counties exist comes from the data, so a county
 * with no room in it is never offered.
 */
const CITY_ORDER = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '澎湖縣',
  '金門縣',
  '連江縣',
];

interface AreaPickerProps {
  rooms: readonly NursingRoom[];
  city: string | null;
  district: string | null;
  onSelect: (city: string | null, district: string | null) => void;
  onClose: () => void;
}

/**
 * County, then district.
 *
 * A keyword answers "which branch of this store", not "where am I going
 * tomorrow". Two steps rather than one flat list, because 3,852 rooms sit in
 * 22 counties across more than 300 districts and a flat list is 300 chips.
 *
 * Picking a county keeps the sheet open so a parent can narrow further;
 * picking a district closes it, because that is the finest level there is and
 * a sheet left open only covers the map.
 */
export default function AreaPicker({
  rooms,
  city,
  district,
  onSelect,
  onClose,
}: AreaPickerProps) {
  const theme = SERVICE_THEME.babyoasis;

  const cities = useMemo(() => {
    const present = new Set(rooms.map((room) => room.city));

    return CITY_ORDER.filter((name) => present.has(name));
  }, [rooms]);

  // Only the selected county's districts, and each with its room count: a
  // parent can tell "42 rooms here" from "1 room here", and cannot tell that
  // from the district name alone.
  const districts = useMemo(() => {
    if (!city) {
      return [];
    }

    const counts = new Map<string, number>();

    rooms.forEach((room) => {
      if (room.city !== city || !room.district) {
        return;
      }

      counts.set(room.district, (counts.get(room.district) ?? 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-Hant'));
  }, [rooms, city]);

  // `.chip-on` is LittleSteps' coral; this service is 靖藍. Override the fill
  // only, the way LittleGuard's CountyPicker does.
  const chipClass = (isOn: boolean) =>
    `chip shrink-0 ${isOn ? `chip-on ${theme.fill} ${theme.fillText} border-transparent` : ''}`;

  return (
    <ModalFrame isOpen onClose={onClose} title="選擇區域">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelect(null, null)}
            aria-pressed={city === null}
            className={chipClass(city === null)}
          >
            全部縣市
          </button>
          {cities.map((name) => (
            <button
              key={name}
              type="button"
              // Switching county must clear the district: 士林區 does not
              // exist in 高雄市.
              onClick={() => onSelect(name, null)}
              aria-pressed={city === name}
              className={chipClass(city === name)}
            >
              {name}
            </button>
          ))}
        </div>

        {city && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-ink-muted">鄉鎮市區</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSelect(city, null)}
                aria-pressed={district === null}
                className={chipClass(district === null)}
              >
                全部
              </button>
              {districts.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onSelect(city, name);
                    onClose();
                  }}
                  aria-pressed={district === name}
                  className={chipClass(district === name)}
                >
                  {name}
                  {' '}
                  {count}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </ModalFrame>
  );
}
