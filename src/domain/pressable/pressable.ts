import type { KeyboardEvent } from 'react';

/**
 * Makes a non-button element behave like a button for a keyboard.
 *
 * Several expandable rows are `motion.div`s with an `onClick` — the wiki
 * article card, the sleep-training method accordion, the food stage accordion,
 * the food record rows. A mouse works; a keyboard does not reach them at all,
 * which on the wiki meant all 85 articles across the three knowledge bases
 * could be seen but never opened without a pointer.
 *
 * They stay `div`s rather than becoming `<button>`s because each contains
 * headings, lists and its own nested buttons, and a `<button>` may not contain
 * interactive or heading content.
 *
 * Space is prevented from scrolling the page, which is what a real button does.
 * Modal backdrops deliberately do NOT use this: they are a redundant
 * convenience for a dismiss that every modal also exposes as a focusable close
 * button, and making a full-screen overlay tabbable would put a meaningless
 * stop in front of the dialog.
 */
export function pressable(onPress: () => void, expanded?: boolean) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    'aria-expanded': expanded,
    onClick: onPress,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      // Only handle the row's own key press, not one bubbling up from a
      // nested control such as an edit or delete button.
      if (event.target !== event.currentTarget) {
        return;
      }

      event.preventDefault();
      onPress();
    },
  };
}
