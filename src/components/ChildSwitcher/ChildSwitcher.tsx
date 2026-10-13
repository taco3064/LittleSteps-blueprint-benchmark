import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useOptionalChildStore } from '~app/hooks/useChildStoreContext';
import { isPregnancyProfile } from '~app/domain/pregnancy';
import { SERVICE_THEME, type ServiceId } from '~app/domain/serviceTheme';
import { collapse } from '~app/domain/motion';

interface ChildSwitcherProps {
  /** Which service's palette to wear. */
  service: ServiceId;
  /** Layout classes for the wrapper. The switcher owns no outer spacing. */
  className?: string;
}

/**
 * Names the child a screen is about, and switches child in two taps.
 *
 * Switching used to exist in exactly one place, the account sheet, so on every
 * screen that is about one child the sequence was: tap the account button,
 * wait for the sheet, tap the child, watch the sheet close. Three taps and an
 * animation, a dozen times a day for a two-child household. And none of those
 * screens said whose record was open, so a feed could be typed onto the wrong
 * child and the clinic summary and growth chart would inherit the mistake.
 *
 * Two deliberate silences:
 *
 * - An account with nothing else to switch to renders nothing at all. A
 *   control with one option is noise, and the account sheet already names the
 *   child.
 * - Pregnancy profiles are never offered. They are child profiles, but the
 *   screens carrying this switcher all record a born baby and PregnancyGate
 *   replaces them with an explanation when the selected profile is a
 *   pregnancy — so offering one here would swap the page for that gate and
 *   take the switcher away with it. The account sheet keeps the full list,
 *   which is where the whole roster, adding a child and joining by code
 *   belong.
 *
 * The panel expands in flow rather than floating: it is a disclosure like the
 * app's other accordions, so there is no overlay to stack, clip or trap focus
 * inside.
 */
export default function ChildSwitcher({ service, className = '' }: ChildSwitcherProps) {
  const store = useOptionalChildStore();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /**
   * Closing hands focus back to the toggle. Both ways out of the panel
   * destroy the element the keyboard is standing on — Escape may be pressed
   * while an option has focus, and choosing a child unmounts the button that
   * was just activated — so without this, focus falls to the body and a
   * keyboard user has to tab in from the top of the page again.
   */
  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const current = store?.currentChild;

  const others = (store?.childProfiles ?? []).filter(
    (child) => child.id !== current?.id && !isPregnancyProfile(child),
  );

  // No store is how the page unit tests mount these screens, and how a shell
  // rendered outside the provider behaves. Same answer as one child: nothing.
  if (!store || !current || others.length === 0) {
    return null;
  }

  const theme = SERVICE_THEME[service];

  const switchTo = (id: string) => {
    close();
    // The store reports its own failures, and the name follows the database,
    // so a switch that does not land leaves the current child on screen.
    void store.setCurrentChild(id);
  };

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
