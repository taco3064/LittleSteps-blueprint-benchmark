import { LayoutGrid } from 'lucide-react';
import { goTo } from '~app/domain/navigate';

interface AppHomeButtonProps {
  /** Tailwind classes for the button surface; defaults suit a white header. */
  className?: string;
}

/**
 * Returns to the app entry point at `#/`, where every service has a card.
 *
 * Navigation here has two levels: each service has its own home
 * (`#/littlesteps`, `#/littleexplorer`, …) reached by that service's own
 * chrome, and above them sits the entry point listing all services. This
 * button is the second level only — a service's own home button must not be
 * replaced by it.
 *
 * Uses a grid icon rather than a house so it reads as "all services" and stays
 * visually distinct from a service's own home button sitting beside it.
 *
 * Navigates by writing location.hash, so it needs no callback prop — App.tsx
 * already listens for hashchange.
 */
export default function AppHomeButton({
  className = 'bg-ink/5 hover:bg-ink/10 text-ink-muted',
}: AppHomeButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        goTo('home');
      }}
      title="所有服務"
      aria-label="所有服務"
      className={`w-tap h-tap rounded-full flex items-center justify-center transition-colors shrink-0 ${className}`}
    >
      <LayoutGrid className="w-5 h-5" />
    </button>
  );
}
