import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChildProfile, DailyLog } from '~app/domain/records';
import { ChildStoreProvider } from '~app/containers/ChildStoreProvider';
import { useChildStoreContext } from '~app/hooks/useChildStoreContext';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import DailyLogPage from '~app/containers/DailyLogPage';

/**
 * Mis-attribution is the risk that made #16 worth fixing: a parent who cannot
 * see which child the daily log is about types a feed onto the wrong record,
 * and the clinic summary and growth chart inherit the mistake.
 *
 * Putting the switcher on the page is what makes that risk testable, so the
 * assertions run as one sequence rather than three isolated checks. A switch
 * must leave the day in view alone, must bring the new child's logs with it,
 * and must be the child the next write lands on. Reloading the logs but
 * resetting the date, or keeping the date but writing through a stale child,
 * are both bugs this feature can introduce, and either one goes red here.
 */

const mocks = vi.hoisted(() => ({
  addDailyLog: vi.fn(),
  updateDailyLog: vi.fn(),
  deleteDailyLog: vi.fn(),
  logsByChild: {} as Record<string, DailyLog[]>,
  profiles: [] as ChildProfile[],
}));

vi.mock('~app/hooks/useDailyLogs', () => ({
  useDailyLogs: (childId: string | null) => ({
    logs: (childId && mocks.logsByChild[childId]) || [],
    loading: false,
    error: false,
  }),
}));

vi.mock('~app/services/childRepository', () => ({
  createChildRepository: () => ({
    addDailyLog: mocks.addDailyLog,
    updateDailyLog: mocks.updateDailyLog,
    deleteDailyLog: mocks.deleteDailyLog,
  }),
}));

/**
 * A stateful stand-in for the store. The whole point of the sequence is that a
 * tap on the header control travels through the store and back down into the
 * page, so a mock that merely records the call would prove nothing.
 */
vi.mock('~app/hooks/useChildStore', () => ({
  useChildStore: () => {
    const [currentChildId, setCurrentChildId] = useState('c1');

    return {
      childProfiles: mocks.profiles,
      currentChildId,
      currentChild: mocks.profiles.find((child) => child.id === currentChildId),
      setCurrentChild: async (id: string) => setCurrentChildId(id),
    };
  },
}));

vi.mock('~app/hooks/useAuth', () => {
  const value = {
    user: { uid: 'u1', displayName: '測試家長', email: 'test@example.com', photoURL: null },
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  };

  return { useAuth: () => value, useOptionalAuth: () => value };
});

const profile = (over: Pick<ChildProfile, 'id' | 'name'>): ChildProfile => ({
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

/** Yesterday at 10:00 local — a day the page has to be navigated to. */
const yesterday = (() => {
  const date = new Date();

  date.setDate(date.getDate() - 1);
  date.setHours(10, 0, 0, 0);

  return date;
})();

const treeFeed: DailyLog = {
  id: 'l1',
  childId: 'c2',
  type: 'feeding',
  timestamp: yesterday.toISOString(),
  data: { feedingType: 'formula', amount: 90 },
  createdAt: yesterday.toISOString(),
};

/** Mirrors how App.tsx wires the page: the store decides which child it is about. */
function DailyLogScreen() {
  const { currentChild } = useChildStoreContext();

  return <DailyLogPage currentChild={currentChild} user={null} />;
}

const renderScreen = () => {
  const user = userEvent.setup();

  render(
    <ChildStoreProvider>
      <DailyLogScreen />
    </ChildStoreProvider>,
  );

  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.addDailyLog.mockResolvedValue(undefined);
  mocks.profiles = [bean, tree];
  mocks.logsByChild = { c1: [], c2: [treeFeed] };
});

describe('switching child on the daily log', () => {
  it('keeps the day in view, brings the new child logs, and writes the next feed to that child', async () => {
    const user = renderScreen();

    expect(screen.getByRole('button', { name: '寶寶 小豆' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '前一天' }));
    const dayInView = toLocalDateKey(yesterday);

    expect(screen.getByText(dayInView)).toBeInTheDocument();
    expect(screen.getByText('這天沒有記錄')).toBeInTheDocument();

    // Two taps: open the switcher, pick the other child.
    await user.click(screen.getByRole('button', { name: '寶寶 小豆' }));
    await user.click(screen.getByRole('button', { name: '小樹' }));

    expect(await screen.findByText('配方奶 · 90ml')).toBeInTheDocument();
    expect(screen.getByText(dayInView)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '餵奶' }));
    await screen.findByRole('heading', { name: '新增餵奶記錄' });
    await user.type(screen.getByLabelText('奶量（ml）'), '120');
    await user.click(screen.getByRole('button', { name: '儲存' }));

    await waitFor(() => expect(mocks.addDailyLog).toHaveBeenCalledTimes(1));

    expect(mocks.addDailyLog).toHaveBeenCalledWith(
      'c2',
      expect.objectContaining({ childId: 'c2' }),
    );
  });

  it('gives a one-child account no control to switch with', () => {
    mocks.profiles = [bean];
    renderScreen();

    expect(screen.getByRole('button', { name: '餵奶' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /小豆/ })).toBeNull();
  });
});
