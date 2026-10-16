import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { type Located } from '~app/babyoasis/domain/spatialIndex';
import { useSheetDialog } from '~app/babyoasis/hooks/useSheetDialog';
import { sheet } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

const NEARBY_SHEET_TITLE_ID = 'babyoasis-nearby-sheet-title';

/**
 * 鄰近清單，和詳情面板一樣是對話框：Escape 關得掉、焦點會進來。
 *
 * 標題與「一筆都沒有」的那句話由呼叫端給：同一份清單有兩個原點——「我現在的
 * 位置」與「我要去的那一站」，而 10 公里與 800 公尺講成同一句話會騙人。
 */
export const NearbyRoomsSheet = ({
  nearby,
  title,
  emptyText,
  onSelect,
  onClose,
}: {
  nearby: readonly Located<NursingRoom>[];
  title: string;
  emptyText: string;
  onSelect: (room: NursingRoom) => void;
  onClose: () => void;
}) => {
  const theme = SERVICE_THEME.babyoasis;
  const dialogRef = useSheetDialog(onClose);

  return (
    <motion.div
      {...sheet}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={NEARBY_SHEET_TITLE_ID}
      tabIndex={-1}
      className={
        'fixed bottom-0 left-0 right-0 z-[1500] bg-white rounded'
        + '-t-3xl shadow-soft-lg max-h-[45vh] overflow-y-auto '
        + 'focus:outline-none'
      }
    >
      <div
        className={
          'sticky top-0 flex items-center justify-betwee'
          + 'n bg-white px-4 pt-4 pb-2'
        }
      >
        <h2 id={NEARBY_SHEET_TITLE_ID}>{title}</h2>
        <button
          onClick={onClose}
          className="btn-icon bg-ink/5 hover:bg-ink/10"
          aria-label="關閉附近清單"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {nearby.length === 0
        ? (
            <p className="px-4 pb-6 text-sm text-ink-muted">{emptyText}</p>
          )
        : (
            <ul className="px-2 pb-6">
              {nearby.map(({ item, distanceKm }) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSelect(item)}
                    className={
                      'w-full flex items-center gap-3 p-3 rounded-2xl hover:bg'
                      + '-ink/5 active:bg-ink/10 transition-colors text-left'
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink truncate">{item.name}</p>
                      <p className="text-sm text-ink-muted truncate">{item.address}</p>
                    </div>
                    <span
                      className={`text-sm font-semibold whitespace-nowrap ${theme.ink}`}
                    >
                      {distanceKm < 1

                        ? `${Math.round(distanceKm * 1000)} 公尺`

                        : `${distanceKm.toFixed(1)} 公里`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
    </motion.div>
  );
};
