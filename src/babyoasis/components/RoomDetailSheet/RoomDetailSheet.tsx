import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { useSheetDialog } from '~app/babyoasis/hooks/useSheetDialog';
import { sheet } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { RoomFacilities } from '../RoomFacilities';

/** 兩張面板各自的標題 id，給 aria-labelledby 指。 */
const ROOM_SHEET_TITLE_ID = 'babyoasis-room-sheet-title';

/**
 * 交給 useSheetDialog 當「這次 Escape 不關我」用的關閉函式。
 *
 * 放在模組層而不是元件裡：useSheetDialog 的監聽器跟著 onClose 的身分重掛，
 * 每次 render 生一顆新的 arrow 會讓它每次 render 都拆掉再裝一次。
 */
const IGNORE_ESCAPE = () => {};

// Bottom sheet for selected room
interface RoomDetailSheetProps {
  room: NursingRoom;
  onClose: () => void;
}

/**
 * `AnimatePresence` lives at the call site, not in here. It used to sit inside
 * this component above an early `return null`, so the whole subtree unmounted
 * the instant `room` cleared and the exit animation never ran.
 */
export const RoomDetailSheet = ({
  room,
  onClose,
  renderReport,
}: RoomDetailSheetProps & {
  renderReport: (
    room: NursingRoom,
    onOpenChange: (open: boolean) => void,
  ) => ReactNode;
}) => {
  const theme = SERVICE_THEME.babyoasis;

  /*
    回報表單開著的時候，Escape 只該關那張表單。

    這張面板與 ModalFrame 的 Escape 監聽器都掛在 document 上，同一次按鍵兩
    邊都收得到——不讓路的話按一次 Escape 會把面板也關掉，家長回到地圖時連
    自己剛剛在看哪一筆都沒了。讓外層退開，而不是讓內層去搶事件：closeDisabled
    期間該不該關，是 ModalFrame 自己的規則，不該在這裡複製一份。
  */
  const [reporting, setReporting] = useState(false);
  const dialogRef = useSheetDialog(reporting ? IGNORE_ESCAPE : onClose);

  // 來源未提供設施細目時 facilities 是 undefined，與「十項設施都沒有」意義不同，
  // 必須分開呈現，否則會把資料闕漏講成場所簡陋。
  const availableFacilities = Object.entries(room.facilities ?? {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  return (
    <motion.div
      {...sheet}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ROOM_SHEET_TITLE_ID}
      tabIndex={-1}
      className={
        'fixed bottom-0 left-0 right-0 z-[2000] bg-white rounded'
        + '-t-3xl shadow-soft-lg max-h-[70vh] overflow-y-auto '
        + 'focus:outline-none'
      }
    >
      <button
        onClick={onClose}
        aria-label="關閉"
        className={'btn-icon absolute top-3 right-3 bg-ink/5 hove' + 'r:bg-ink/10'}
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-5 pb-8">
        {/* 沒有 text-* 覆寫：h2 的級距由 index.css 的 @layer base 給（text-lg）。
            這裡原本寫 text-xl（20px），比它上面那顆 AppBar 的 h1（text-lg，18px）
            還大——巢狀在底下的標題不能比外層的大。附近清單那張 sheet 的標題本來
            就是預設級距，兩張面板現在也一致了。 */}
        <h2 id={ROOM_SHEET_TITLE_ID} className="text-ink mb-4 pr-12">
          {room.name}
        </h2>

        {/* These three icons are the only thing distinguishing address from
            hours from phone, so they carry meaning and stay. */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${theme.ink}`} />
            <div>
              <p className="text-ink">{room.address}</p>
              {room.floor && <p className="text-sm text-ink-muted">{room.floor}</p>}
            </div>
          </div>

          {room.openingHours && (
            <div className="flex items-start gap-3">
              <Clock className={`w-5 h-5 mt-0.5 shrink-0 ${theme.ink}`} />
              <p className="text-ink">{room.openingHours}</p>
            </div>
          )}

          {room.phone && (
            <div className="flex items-start gap-3">
              <Phone className={`w-5 h-5 mt-0.5 shrink-0 ${theme.ink}`} />
              <a href={`tel:${room.phone}`} className={`underline ${theme.ink}`}>
                {room.phone}
              </a>
            </div>
          )}
        </div>

        <RoomFacilities
          room={room}
          theme={theme}
          availableFacilities={availableFacilities}
        />

        {room.remarks && (
          <div className="p-4 bg-secondary-soft rounded-xl">
            <p className="text-sm text-ink">{room.remarks}</p>
          </div>
        )}

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${room.latitude},${room.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-primary w-full mt-6 ${theme.fill} ${theme.fillText}`}
        >
          開始導航
        </a>

        {/* 這份名單來自國健署的公開地圖，沒有「還在不在」這一欄，門鎖著也不會
            有人回報給我們。站在門口的家長是唯一存在的事實來源，所以回報鍵就
            放在這一筆資料旁邊，未登入照樣看得到。 */}
        {renderReport(room, setReporting)}
      </div>
    </motion.div>
  );
};
