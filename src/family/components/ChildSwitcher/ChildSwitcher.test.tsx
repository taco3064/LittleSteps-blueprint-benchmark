import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChildProfile } from '../../domain/familyRecords/index';
import { ChildStoreProvider, ChildSwitcher as ChildSwitcher } from '../../index';

/**
 * Switching child used to exist only in the account sheet — three taps and a
 * sheet animation — and no screen that records data said whose record was
 * open. This suite pins both halves of the fix: two taps to switch, and total
 * silence for an account with nothing to switch to.
 */

const mocks = vi.hoisted(() => ({
  setCurrentChild: vi.fn().mockResolvedValue(undefined),
  state: { profiles: [] as ChildProfile[], currentChildId: null as string | null },
}));

vi.mock('../../hooks/useChildStore/useChildStore', () => ({
  useChildStore: () => ({
    childProfiles: mocks.state.profiles,
    currentChildId: mocks.state.currentChildId,
    currentChild:
      mocks.state.profiles.find((child) => child.id === mocks.state.currentChildId)
      ?? mocks.state.profiles[0],
    setCurrentChild: mocks.setCurrentChild,
  }),
}));

// ChildStoreProvider is the only thing in this tree that reads auth, and it
// only reads `user`, so the module is replaced outright rather than spread.
vi.mock('../../../platform/hooks/useAuth/index', () => {
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

const profile = (
  over: Pick<ChildProfile, 'id' | 'name'> & Partial<ChildProfile>,
): ChildProfile => ({
  birthday: '2026-02-01',
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2026-02-01T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
  ...over,
});

const bean = profile({ id: 'c1', name: '小豆' });
const tree = profile({ id: 'c2', name: '小樹' });

const unborn = profile({
  id: 'c3',
  name: '小芽',
  birthday: '2026-11-01',
  isPregnancy: true,
});

const renderSwitcher = (profiles: ChildProfile[], currentChildId: string) => {
  mocks.state.profiles = profiles;
  mocks.state.currentChildId = currentChildId;

  const user = userEvent.setup();

  const { container } = render(
    <ChildStoreProvider>
      <ChildSwitcher theme={{ tint: 'bg-primary-soft', ink: 'text-primary-dark' }} />
    </ChildStoreProvider>,
  );

  return { user, container };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('an account with nothing to switch to', () => {
  it('renders no control at all for a single child', () => {
    const { container } = renderSwitcher([bean], 'c1');

    expect(container).toBeEmptyDOMElement();
  });

  it('renders no control when the only other profile is a pregnancy', () => {
    // PregnancyGate replaces these screens with an explanation when the
    // selected profile is a pregnancy, taking the switcher away with it — so
    // offering one here would be a tap into a dead end.
    const { container } = renderSwitcher([bean, unborn], 'c1');

    expect(container).toBeEmptyDOMElement();
  });
});

describe('an account with two children', () => {
  it('names the current child and switches in two taps', async () => {
    const { user } = renderSwitcher([bean, tree], 'c1');

    // The name is on screen before anything is tapped: that is the half of
    // the fix that stops a feed being typed onto the wrong record.
    const toggle = screen.getByRole('button', { name: '寶寶 小豆' });

    expect(screen.queryByRole('button', { name: '小樹' })).toBeNull();

    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: '小樹' }));

    expect(mocks.setCurrentChild).toHaveBeenCalledWith('c2');
    // The button that was activated is now unmounted; without handing focus
    // back, a keyboard user is dropped on the body.
    expect(toggle).toHaveFocus();
  });

  it('closes on Escape without switching', async () => {
    const { user } = renderSwitcher([bean, tree], 'c1');

    await user.click(screen.getByRole('button', { name: '寶寶 小豆' }));
    // Tab into the panel first: Escape pressed from the toggle would leave
    // focus there anyway, so it would not prove focus is handed back.
    await user.tab();
    expect(screen.getByRole('button', { name: '小樹' })).toHaveFocus();

    await user.keyboard('{Escape}');

    const toggle = screen.getByRole('button', { name: '寶寶 小豆' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
    expect(mocks.setCurrentChild).not.toHaveBeenCalled();
  });
});
