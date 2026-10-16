import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { UserRound } from 'lucide-react';

interface AccountButtonProps {
  /** 目前所在的服務：決定視窗的配色，以及要不要顯示寶寶切換器。 */
  user: { photoURL: string | null } | null;
  open: boolean;
  onOpen: () => void;
  sheet: ReactNode;
  /** Tailwind classes for the button surface; defaults suit a white header. */
  className?: string;
}

/**
 * 帳號與寶寶的入口，每個服務的 AppBar 都放同一顆。
 *
 * 在此之前登入登出與切換寶寶只存在於 LittleSteps 的側邊抽屜裡，而那個抽屜
 * 只在 LittleSteps 的路由下渲染。結果是：人在 LittleBloom、LittleExplorer、
 * LittleOuting 或 BabyOasis 時無法登出，也無法換一個孩子——即使前兩者整頁
 * 都在顯示那個孩子的資料。那不是刻意的設計，是抽屜剛好長在其中一個服務裡。
 *
 * 導覽維持各服務原本的形狀（13 頁用抽屜、4 頁用底部分頁、單頁不需要），
 * 因為那是頁數決定的；帳號則與頁數無關，到哪裡都該碰得到。
 */
export default function AccountButton({
  user,
  open,
  onOpen,
  sheet,
  className = 'bg-ink/5 hover:bg-ink/10 text-ink-muted',
}: AccountButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        title="帳號與寶寶"
        aria-label="帳號與寶寶"
        className={`w-tap h-tap rounded-full flex items-center justify-center transition-colors shrink-0 overflow-hidden ${className}`}
      >
        {user?.photoURL
          ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )
          : (
              <UserRound className="w-5 h-5" />
            )}
      </button>

      {/* Portal 到 body：AppBar 有 backdrop-blur，而 backdrop-filter 會替
          子孫的 position: fixed 建立新的定位基準。不 portal 的話這張
          bottom sheet 會被關在 64px 高的頁首裡（實測 bottom=64、top=-201），
          而不是貼在畫面底部。

          外層的 z-[2500] 是必要的：BabyOasis 的地圖自己疊到 z-[2000]
          （場館詳情）與 z-[1500]（附近清單），portal 出去之後就和它們同一
          層級競爭，用預設的 z-50 會被地圖蓋掉——量得到但看不到。這一層也
          建立了 stacking context，所以 sheet 內部的 z-40／z-50 仍然照舊。 */}
      {createPortal(
        <div className="relative z-[2500]">
          <AnimatePresence>{open && sheet}</AnimatePresence>
        </div>,
        document.body,
      )}
    </>
  );
}
