import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { PresentationTheme } from '~app/platform/domain/presentationTheme';

/**
 * The one page header.
 *
 * There were three, and they disagreed about everything that matters: the
 * LittleSteps bar was white with a hamburger, LittleBloom's was a solid
 * dusty-rose band with white text (2.16:1 — the title was hard to read),
 * LittleExplorer's was white with a gradient icon badge that never changed
 * across its four tabs. Container widths were `max-w-3xl` and `max-w-4xl` for
 * no reason anyone wrote down.
 *
 * Structure is now identical everywhere and a service's personality comes from
 * its `ServiceTheme` — the title ink and the page background underneath. A
 * white bar keeps the coloured content below it as the thing you look at, and
 * costs a phone ~20px less vertical space than a tinted band.
 *
 * The identity icon that used to sit on the left of every single screen is
 * gone: the wordmark already says which app you are in, and on a 375px screen
 * that badge was competing with the title for the only row that matters.
 */

interface AppBarProps {
  theme: PresentationTheme;
  title: string;
  subtitle?: string;
  /** Renders a back button pointing at this page. */
  onBack?: () => void;
  /** Accessible label for the back button; defaults to a generic one. */
  backLabel?: string;
  /** Replaces the back button — used by LittleSteps for its menu button. */
  leading?: ReactNode;
  /** Trailing controls, right-aligned. */
  actions?: ReactNode;
  /** Match the content column below. */
  width?: 'body' | 'wide';
}

export default function AppBar({
  theme,
  title,
  subtitle,
  onBack,
  backLabel,
  leading,
  actions,
  width = 'body',
}: AppBarProps) {
  const column = width === 'wide' ? 'max-w-4xl' : 'max-w-2xl';

  return (
    <header
      className={
        'sticky top-0 z-30 bg-white/90 backdrop-blur-sm ' + 'border-b border-ink/5'
      }
    >
      {/* Fixed 4rem so anything that has to stick *below* the bar can say
          `top-16` instead of guessing a pixel value — DiaryPage's month
          divider used to hardcode `top-[72px]` against the old header. */}
      <div className={`${column} mx-auto px-4 h-16 flex items-center gap-2`}>
        {leading
          ?? (onBack && (
            <button
              type="button"
              onClick={() => {
                onBack();
              }}
              aria-label={backLabel ?? `返回${theme.name}首頁`}
              className="btn-icon -ml-1.5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ))}

        {/* min-w-0 + truncate: a flex item will not shrink below its content
            width, so a long title pushes the trailing buttons off a narrow
            screen instead of ellipsing. */}
        <div className="min-w-0 flex-1">
          <h1 className={`text-lg font-bold truncate ${theme.ink}`}>{title}</h1>
          {subtitle && <p className={`text-xs truncate ${theme.muted}`}>{subtitle}</p>}
        </div>

        {actions}
      </div>
    </header>
  );
}
