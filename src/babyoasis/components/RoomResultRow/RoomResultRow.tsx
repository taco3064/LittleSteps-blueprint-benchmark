import { MapPin } from 'lucide-react';
import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { ACCESS_LABEL, type RoomAccess } from '~app/babyoasis/domain/roomCategory';
import type { ServiceTheme } from '~app/portal/components/ServiceTheme';

const ACCESS_TAG_CLASS: Record<Exclude<RoomAccess, 'open'>, string> = {
  internal: 'bg-butter-light text-butter-dark',
  staff_help: 'bg-ink/5 text-ink-muted',
};

export function RoomResultRow({
  room,
  theme,
  setQuery,
  onSelect,
  access,
}: {
  room: NursingRoom;
  theme: ServiceTheme;
  setQuery: (value: string) => void;
  onSelect: (room: NursingRoom) => void;
  access: RoomAccess;
}) {
  return (
    <li key={room.id}>
      <button
        type="button"
        onClick={() => {
          // 選定後清掉關鍵字，結果清單才會收起來。留著的話家長關掉
          // 詳情面板，看到的是清單依舊蓋住地圖與剛飛過去的那個點。
          setQuery('');
          onSelect(room);
        }}
        className={
          'w-full flex items-center gap-3 p-3 rounded-2xl hover:bg'
          + '-ink/5 active:bg-ink/10 transition-colors text-left'
        }
      >
        <MapPin className={`w-4 h-4 shrink-0 ${theme.ink}`} />
        <div className="min-w-0 flex-1">
          {/* 名稱自己截斷，標籤留在旁邊不被截掉：整行 truncate 的
                            話，「大葉高島屋百貨股份有限公司」這種長名字會把後面
                            的標籤一起吃掉——而需要標籤的正是這些長名字。 */}
          <p className="flex items-center gap-2">
            <span className="font-medium text-ink truncate">{room.name}</span>
            {/* 最多一個標籤，哪一個由 accessOf 決定：兩個一起成立
                              時的取捨寫在它那裡，不在這裡重推一次。 */}
            {access !== 'open' && (
              <span className={`tag shrink-0 ${ACCESS_TAG_CLASS[access]}`}>
                {ACCESS_LABEL[access]}
              </span>
            )}
          </p>
          {/* 地址本身就以縣市區起頭，比再拼一次縣市有用；同名的分館
                            （例如天母兩館）只有樓層分得開，有就一起寫上。 */}
          <p className="text-sm text-ink-muted truncate">
            {room.address}
            {room.floor ? `｜${room.floor}` : ''}
          </p>
        </div>
      </button>
    </li>
  );
}
