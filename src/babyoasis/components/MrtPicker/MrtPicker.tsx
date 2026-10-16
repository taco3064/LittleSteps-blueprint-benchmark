import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MRT_STATIONS, type MrtStation } from '~app/babyoasis/domain/mrtStations';
import EmptyState from '~app/platform/components/EmptyState';
import ModalFrame from '~app/platform/components/ModalFrame';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { MrtSearch } from '../MrtSearch';
import { MrtSystems } from '../MrtSystems';

/**
 * 挑一個捷運站當定位點。
 *
 * 「我明天要去某一站」是家長最常有的行程形狀，而那不是定位鈕能回答的問題——
 * 手機的定位只知道你現在在哪。選了站之後，地圖與附近清單完全沿用定位那條路徑，
 * 只是把座標換成那一站的座標。
 *
 * 兩層而不是一份長清單：全台 260 站，高雄的家長不該先滾過 109 個臺北的站。
 * 系統籤先收窄，站名搜尋才是主要路徑——記得站名的人打兩個字就到了。
 *
 * 清單上不寫路線名，因為 OSM 對轉乘站給不出完整的路線（見 data/mrtStations.ts）。
 * 順序仍是路線順序，所以同一條線的站還是相鄰。
 */
interface MrtPickerProps {
  selected: MrtStation | null;
  onSelect: (station: MrtStation | null) => void;
  onClose: () => void;
}

const SYSTEMS = [...new Set(MRT_STATIONS.map((station) => station.system))];

export default function MrtPicker({ selected, onSelect, onClose }: MrtPickerProps) {
  const theme = SERVICE_THEME.babyoasis;
  const [system, setSystem] = useState<string | null>(selected?.system ?? null);
  const [query, setQuery] = useState('');
  const keyword = query.trim();

  // 只比對站名。OSM 給不出可靠的路線名（見 data/mrtStations.ts），所以清單上
  // 沒有路線可讀，也就沒有路線可搜。
  const matches = useMemo(
    () =>
      MRT_STATIONS.filter(
        (station) =>
          (system === null || station.system === system)
          && (keyword === '' || station.name.includes(keyword)),
      ),
    [system, keyword],
  );

  // 分組是為了讀，不是為了篩：選了系統籤之後只會剩一組，標題就沒必要重複。
  const groups = useMemo(() => {
    const order = SYSTEMS.filter((name) =>
      matches.some((station) => station.system === name),
    );

    return order.map((name) => ({
      system: name,
      stations: matches.filter((station) => station.system === name),
    }));
  }, [matches]);

  const chipClass = (isOn: boolean) =>
    `chip shrink-0 ${isOn ? `chip-on ${theme.fill} ${theme.fillText} border-transparent` : ''}`;

  return (
    <ModalFrame isOpen onClose={onClose} title="選擇捷運站">
      <div className="space-y-3">
        <MrtSearch query={query} setQuery={setQuery} />

        {/* 換行而不是橫向捲動：五套系統只佔兩行，而捲動會把高雄捷運藏在畫面外，
            高雄的家長不會知道有那顆籤。同 AreaPicker 的縣市籤。 */}
        <MrtSystems system={system} setSystem={setSystem} chipClass={chipClass} />

        {selected && (
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="btn-ghost w-full"
          >
            <X className="w-4 h-4" />
            不限捷運站
          </button>
        )}

        {groups.length === 0
          ? (
              <EmptyState
                theme={theme}
                title="找不到這一站"
                description="換個站名試試。"
              />
            )
          : (
              groups.map((group) => (
                <section key={group.system} className="space-y-1">
                  {system === null && (
                    <h3 className="text-sm font-medium text-ink-muted">
                      {group.system}
                    </h3>
                  )}
                  <ul>
                    {group.stations.map((station) => (
                      <li key={`${station.system}|${station.name}`}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(station);
                            onClose();
                          }}
                          aria-pressed={
                            selected?.name === station.name
                            && selected?.system === station.system
                          }
                          className={
                            'w-full min-h-tap flex items-center px-3 py-2 rounded-2x'
                            + 'l hover:bg-ink/5 active:bg-ink/10 transition-colors tex'
                            + 't-left'
                          }
                        >
                          <span className="font-medium text-ink">{station.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
      </div>
    </ModalFrame>
  );
}
