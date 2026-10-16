import { useEffect, useRef, useState } from 'react';

import { useOptionalChildStore } from '../useChildStoreContext';
import { isPregnancyProfile } from '~app/family/domain/pregnancy';

export interface ChildSwitcherProps {
  /** Which service's palette to wear. */
  theme: { tint: string; ink: string };
  /** Layout classes for the wrapper. The switcher owns no outer spacing. */
  className?: string;
}

export function useChildSwitcher({ theme, className = '' }: ChildSwitcherProps) {
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

  const switchTo = (id: string) => {
    close();
    // The store reports its own failures, and the name follows the database,
    // so a switch that does not land leaves the current child on screen.
    void store.setCurrentChild(id);
  };

  return { className, open, setOpen, toggleRef, current, others, theme, switchTo };
}
