import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { hoverLift, tap } from '~app/domain/motion';
import { pressable } from '~app/domain/pressable';

interface DashboardCardProps {
  title: string;
  /** One line under the title, where the title alone doesn't say what the card holds. */
  subtitle?: string;
  children: ReactNode;
  onClick?: () => void;
  /** Faint service tint. The panel is plain white without one. */
  bgColor?: string;
}

export default function DashboardCard({
  title,
  subtitle,
  children,
  onClick,
  bgColor = '',
}: DashboardCardProps) {
  const CardWrapper = onClick ? motion.div : 'div';

  // 整張卡片就是那顆按鈕，所以鍵盤路徑也得自己補上——原本只有 onClick，
  // 六張儀表板卡片對 Tab 與讀螢幕軟體等於不存在。
  const interactive = onClick
    ? { ...pressable(onClick), whileHover: hoverLift, whileTap: tap }
    : {};

  return (
    <CardWrapper
      className={`${onClick ? 'panel-tap' : 'panel'} ${bgColor}`}
      {...interactive}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>}
        </div>
        {/*
          The whole card is the tap target. Each summary card used to nest its own
          "→" button in here with no handler of its own; this is the one affordance.
        */}
        {onClick && (
          <ChevronRight
            className="w-5 h-5 text-ink-faint shrink-0"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </CardWrapper>
  );
}
