import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { collapse } from '~app/platform/components/Motion';
import type { useChildSwitcher } from '~app/family/hooks/useChildSwitcher';

export interface ChildSwitcherProps {
  /** Which service's palette to wear. */
  theme: { tint: string; ink: string };
  /** Layout classes for the wrapper. The switcher owns no outer spacing. */
  className?: string;
}

export default function ChildSwitcherView({
  className,
  open,
  setOpen,
  toggleRef,
  current,
  others,
  theme,
  switchTo,
}: NonNullable<ReturnType<typeof useChildSwitcher>>) {
  return (
    <div className={className}>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        className={`chip max-w-full ${theme.tint}`}
      >
        <span className="text-xs shrink-0">寶寶</span>
        <span className="font-semibold text-ink truncate">{current.name}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${theme.ink} ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div {...collapse} className="overflow-hidden">
            <ul aria-label="切換寶寶" className="flex flex-col items-start gap-2 pt-2">
              {others.map((child) => (
                <li key={child.id} className="max-w-full">
                  <button
                    type="button"
                    onClick={() => switchTo(child.id)}
                    className="chip max-w-full"
                  >
                    <span className="truncate">{child.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
