import type { Transition, Variants } from 'framer-motion';

/**
 * The app's motion vocabulary, in one place.
 *
 * Six files hand-rolled near-identical `containerVariants`/`itemVariants`
 * pairs, one of them silently dropping the duration so its list revealed at a
 * different speed. Hover lift was written five ways (`y:-8 scale:1.02`,
 * `y:-4 scale:1.02`, `scale:1.05 y:-2`, `scale:1.02 y:-2`, `y:-2`), and the
 * per-item stagger delay used four different multipliers.
 *
 * Motion here is meant to be felt, not watched: entrances are short, offsets
 * are small, and nothing loops. `prefers-reduced-motion` is honoured globally
 * in `index.css`.
 */

/** Wrap a list or page section; children with `listItem` reveal in sequence. */
export const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

/** Child of `stagger`. 12px is enough to read as movement without lurching. */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Standalone entrance for a single block that has no stagger parent. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Bottom sheet. Already the most consistent pattern in the app; now named. */
export const sheet = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { type: 'spring', damping: 30, stiffness: 300 } as Transition,
};

/** Backdrop behind a sheet or drawer. */
export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Accordion body. */
export const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.22, ease: 'easeOut' } as Transition,
};

/**
 * Press feedback for anything tappable. One recipe, and no `whileHover` lift —
 * a 8px hover jump is a desktop mannerism that costs a mobile user nothing but
 * makes the same component behave differently across the app.
 */
export const tap = { scale: 0.98 };

/** Optional pointer affordance for large cards. Deliberately restrained. */
export const hoverLift = { y: -2 };
