import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { accessOf } from '~app/babyoasis/domain/roomCategory';
import EmptyState from '~app/platform/components/EmptyState';
import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import { RoomResultRow } from '../RoomResultRow';
const MAX_RESULTS = 30;

type RoomResultsProps = {
  showList: boolean;
  matches: readonly NursingRoom[];
  hasFilter: boolean;
  theme: ServiceTheme;
  clearAll: () => void;
  setQuery: (value: string) => void;
  onSelect: (value: NursingRoom) => void;
};

export function RoomResults({
  showList,
  matches,
  hasFilter,
  theme,
  clearAll,
  setQuery,
  onSelect,
}: RoomResultsProps) {
  return (
    showList
    && (matches.length === 0
      ? (
          <div className="mt-2">
            {/* 條件篩掉的和關鍵字打錯的，要講不一樣的話：前者給得起一條退路。 */}
            {hasFilter
              ? (
                  <EmptyState
                    theme={theme}
                    title="這些條件下沒有哺乳室"
                    description="試著放寬條件，或換個關鍵字。"
                    action={{ label: '清除篩選', onClick: clearAll }}
                  />
                )
              : (
                  <EmptyState
                    theme={theme}
                    title="找不到符合的哺乳室"
                    description="換個關鍵字，或改用路名、區域名稱找找看。"
                  />
                )}
          </div>
        )
      : (
    /* 38vh 是刻意壓低的上限：底部的附近清單最高 45vh，定位鈕與地圖的
             資料來源標註也都在下緣，結果清單不能長到蓋住它們。 */
          <div
            className={
              'mt-2 bg-white rounded-2xl shadow-soft '
              + 'max-h-[38vh] overflow-y-auto'
            }
          >
            <p
              className={
                'sticky top-0 bg-white px-4 pt-3 pb-1 text-xs ' + 'text-ink-faint'
              }
            >
              共
              {' '}
              {matches.length}
              {' '}
              處
              {matches.length > MAX_RESULTS && `，先顯示 ${MAX_RESULTS} 處`}
            </p>
            <ul className="px-2 pb-2">
              {matches.slice(0, MAX_RESULTS).map((room) => {
                const access = accessOf(room);

                return (
                  <RoomResultRow
                    key={room.id}
                    room={room}
                    theme={theme}
                    setQuery={setQuery}
                    onSelect={onSelect}
                    access={access}
                  />
                );
              })}
              {matches.length > MAX_RESULTS && (
                <li className="px-3 py-2 text-sm text-ink-muted text-center">
                  還有
                  {' '}
                  {matches.length - MAX_RESULTS}
                  {' '}
                  處，再加上關鍵字或縮小區域。
                </li>
              )}
            </ul>
          </div>
        ))
  );
}
