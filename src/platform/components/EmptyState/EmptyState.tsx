import type { LucideIcon } from 'lucide-react';
import type { PresentationTheme } from '~app/platform/domain/presentationTheme';

/**
 * "Nothing here yet", said once.
 *
 * There were fourteen of these in the sub-apps plus eleven more in LittleSteps,
 * and between them they used ten different 64px grey icons, three different
 * layouts, and two different ideas about whether the block should be centred in
 * the viewport or top-anchored.
 *
 * No icon by default. A big muted glyph above a sentence is the house style of
 * every generated template, it says nothing the sentence doesn't, and on a
 * phone it pushes the one useful thing — the action — below the fold. `icon` is
 * kept for the moments that genuinely earn a picture: a birth, a birthday, a
 * graduation. Those are warm; a grey clock over "no records yet" is not.
 */

interface EmptyStateProps {
  theme: PresentationTheme;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Only for moments worth congratulating. Left out, nothing renders. */
  icon?: LucideIcon;
}

export default function EmptyState({
  theme,
  title,
  description,
  action,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className="panel text-center">
      {Icon && (
        <Icon className={`w-8 h-8 mx-auto mb-3 ${theme.ink}`} aria-hidden="true" />
      )}
      <h2 className={`text-base font-bold mb-1.5 ${theme.body}`}>{title}</h2>
      {description && (
        <p className={`text-sm leading-relaxed whitespace-pre-line ${theme.muted}`}>
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`btn-primary mt-5 ${theme.fill} ${theme.fillText}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
