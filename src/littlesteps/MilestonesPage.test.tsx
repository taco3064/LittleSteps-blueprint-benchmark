import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChildStoreProvider } from '../family/index';
import { useChildStoreContext } from '../family/hooks/useChildStoreContext/index';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { ChildProfile } from '../family/domain/familyRecords/index';
import MilestonesPage from './MilestonesPage';

/**
 * The month range this page opens on is derived from the child's age, and the
 * page does not unmount when the parent switches child — App.tsx keys its
 * error boundary on the route, not on the child. Left alone, the derived
 * default is therefore whichever child was selected on mount, so a six-month
 * old's range stays on screen while a three-year-old's progress is ticked
 * against it.
 *
 * Re-deriving unconditionally is the wrong fix, so the two cases below are one
 * pair and neither is redundant. The derived default follows the newly
 * selected child, but a range the parent picked outranks it and survives the
 * switch. Dropping the "picked" flag makes the second case red; ignoring it
 * the other way, and never re-deriving, makes the first.
 */

const mocks = vi.hoisted(() => ({
  profiles: [] as ChildProfile[],
  startChildId: 'c1',
  rerender: () => {},
}));

/**
 * A stateful stand-in for the store, because the switch has to travel through
 * the store and back down into the page for the assertions to mean anything.
 */
vi.mock('../family/hooks/useChildStore/useChildStore', () => ({
  useChildStore: () => {
    const [currentChildId, setCurrentChildId] = useState(mocks.startChildId);
    // `version` exists only so a test can edit a profile in place and re-render,
    // which is how the birthday case below reaches the page.
    const [, bump] = useState(0);

    mocks.rerender = () => bump((n) => n + 1);

    return {
      childProfiles: mocks.profiles,
      currentChildId,
      currentChild: mocks.profiles.find((child) => child.id === currentChildId),
      setCurrentChild: async (id: string) => setCurrentChildId(id),
    };
  },
}));

vi.mock('~app/platform/hooks/useAuth', () => {
  const value = {
    user: {
      uid: 'u1',
      displayName: '測試家長',
      email: 'test@example.com',
      photoURL: null,
    },
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  };

  return { useAuth: () => value, useOptionalAuth: () => value };
});

/**
 * A child exactly `months` old today, so the test cannot age out.
 *
 * `setMonth(getMonth() - months)` is wrong nine days a year -- on the 29th to
 * the 31st the target month may be shorter and the overflow rolls forward
 * rather than clamping, landing a month young. This file's month ranges are
 * wide enough to absorb that, so it was never red here; the vaccine page's
 * finer groups are not, and both should mean the same thing by "exactly N
 * months old". Fixed in both rather than left as a trap for the next file
 * copied from one of them.
 *
 * `toLocalDateKey`, not `toISOString().slice(0, 10)`: the latter converts a
 * local midnight to UTC, which is the previous day everywhere west of UTC.
 */
const childAged = (
  months: number,
  over: Pick<ChildProfile, 'id' | 'name'> & Partial<ChildProfile>,
): ChildProfile => {
  const today = new Date();
  const birth = new Date(today.getFullYear(), today.getMonth() - months, 1);

  const lastDayOfBirthMonth = new Date(
    birth.getFullYear(),
    birth.getMonth() + 1,
    0,
  ).getDate();

  birth.setDate(Math.min(today.getDate(), lastDayOfBirthMonth));

  return {
    birthday: toLocalDateKey(birth),
    milestoneProgress: {},
    vaccineProgress: {},
    createdAt: new Date().toISOString(),
    createdBy: 'u1',
    members: { u1: true },
    ...over,
  };
};

/** Six months old: the filter derives 5-6. */
const bean = childAged(6, { id: 'c1', name: '小豆' });
/** Twelve months old: the filter derives 10-12. */
const tree = childAged(12, { id: 'c2', name: '小樹' });
/** Eight months old, born at 32 weeks: corrected age puts the filter at 5-6. */
const leaf = childAged(8, { id: 'c3', name: '小葉', gestationalAgeWeeks: 32 });

/** Mirrors how App.tsx wires the page: the store decides which child it is about. */
function MilestonesScreen() {
  const { currentChild } = useChildStoreContext();

  return (
    <MilestonesPage
      currentChild={currentChild}
      progress={{}}
      onToggleMilestone={() => {}}
    />
  );
}

const renderScreen = () => {
  const user = userEvent.setup();

  render(
    <ChildStoreProvider>
      <MilestonesScreen />
    </ChildStoreProvider>,
  );

  return user;
};

const rangeChip = (label: string) => screen.getByRole('button', { name: label });

/** Two taps: open the switcher, pick the other child. */
const switchTo = async (
  user: ReturnType<typeof userEvent.setup>,
  from: string,
  to: string,
) => {
  await user.click(screen.getByRole('button', { name: `寶寶 ${from}` }));
  await user.click(screen.getByRole('button', { name: to }));
};

beforeEach(() => {
  mocks.profiles = [bean, tree, leaf];
  mocks.startChildId = 'c1';
});

describe('switching child on the milestones page', () => {
  it('re-derives the month range while it is still the derived default', async () => {
    const user = renderScreen();

    expect(rangeChip('5-6 個月')).toHaveAttribute('aria-pressed', 'true');

    await switchTo(user, '小豆', '小樹');

    expect(
      await screen.findByRole('button', { name: '10-12 個月' }),
    ).toHaveAttribute('aria-pressed', 'true');

    expect(rangeChip('5-6 個月')).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps a range the parent picked, rather than re-deriving over it', async () => {
    const user = renderScreen();

    await user.click(rangeChip('0-2 個月'));
    expect(rangeChip('0-2 個月')).toHaveAttribute('aria-pressed', 'true');

    await switchTo(user, '小豆', '小樹');

    // The new child's derived range is 10-12; the parent's choice outranks it.
    expect(
      await screen.findByRole('button', { name: '寶寶 小樹' }),
    ).toBeInTheDocument();

    expect(rangeChip('0-2 個月')).toHaveAttribute('aria-pressed', 'true');
    expect(rangeChip('10-12 個月')).toHaveAttribute('aria-pressed', 'false');
  });

  it('un-pins the range when the parent taps the chip already pressed', async () => {
    // A tap that changes nothing on screen must not change what the page
    // follows. Tapping any *other* chip passes with or without the guard --
    // the case above already proves that pin survives a switch -- so this has
    // to be the chip that is already pressed.
    const user = renderScreen();

    await user.click(rangeChip('5-6 個月'));
    expect(rangeChip('5-6 個月')).toHaveAttribute('aria-pressed', 'true');

    await switchTo(user, '小豆', '小樹');

    expect(
      await screen.findByRole('button', { name: '10-12 個月' }),
    ).toHaveAttribute('aria-pressed', 'true');

    expect(rangeChip('5-6 個月')).toHaveAttribute('aria-pressed', 'false');
  });

  it('follows a birthday correction on the child already selected', async () => {
    // The derived default is recomputed from the child every render rather than
    // remembered against an id, so correcting a birthday that was entered wrong
    // moves the filter without needing a switch away and back.
    renderScreen();
    expect(rangeChip('5-6 個月')).toHaveAttribute('aria-pressed', 'true');

    mocks.profiles = [childAged(12, { id: 'c1', name: '小豆' }), tree, leaf];
    await act(async () => mocks.rerender());

    expect(rangeChip('10-12 個月')).toHaveAttribute('aria-pressed', 'true');
    expect(rangeChip('5-6 個月')).toHaveAttribute('aria-pressed', 'false');
  });

  it('derives the range from corrected age for a premature child', async () => {
    // Start on the twelve-month old, so landing on 5-6 can only be the
    // derivation talking rather than the range that was already on screen.
    mocks.startChildId = 'c2';
    const user = renderScreen();

    expect(rangeChip('10-12 個月')).toHaveAttribute('aria-pressed', 'true');

    await switchTo(user, '小樹', '小葉');

    // Eight months old, born at 32 weeks: 5-6, not the chronological 7-9.
    expect(await screen.findByRole('button', { name: '5-6 個月' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(rangeChip('7-9 個月')).toHaveAttribute('aria-pressed', 'false');
  });
});
