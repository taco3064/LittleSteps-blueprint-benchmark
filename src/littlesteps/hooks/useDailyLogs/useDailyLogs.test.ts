import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDailyLogs } from './useDailyLogs';
import type { DailyLog } from '~app/family/domain/familyRecords';

const state = vi.hoisted(() => ({
  data: null as Record<string, DailyLog> | null,
  loading: false,
  error: false,
}));

vi.mock('~app/family/hooks/useFirebaseCollection', () => ({
  useFirebaseCollection: () => state,
}));

beforeEach(() => {
  state.data = null;
  state.loading = false;
  state.error = false;
});

describe('daily log collection adaptation', () => {
  it('returns no records for an absent snapshot and forwards loading/error', () => {
    state.loading = true;
    state.error = true;
    const { result } = renderHook(() => useDailyLogs(null, null));

    expect(result.current).toEqual({ logs: [], loading: true, error: true });
  });

  it('preserves every record and source ordering', () => {
    const first = {
      id: 'first',
      type: 'diaper',
      timestamp: '2026-01-01',
      childId: 'child',
      createdAt: '2026-01-01',
      data: { type: 'pee' },
    } as DailyLog;

    const second = {
      id: 'second',
      type: 'diaper',
      timestamp: '2026-01-02',
      childId: 'child',
      createdAt: '2026-01-02',
      data: { type: 'pee' },
    } as DailyLog;

    state.data = { first, second };
    const { result, rerender } = renderHook(() => useDailyLogs('child', null));
    const original = result.current.logs;

    expect(original).toEqual([first, second]);
    rerender();
    expect(result.current.logs).toBe(original);
    state.data = { second };
    rerender();
    expect(result.current.logs).toEqual([second]);
    expect(result.current.logs).not.toBe(original);
  });

  it('clears the previous collection when the snapshot becomes absent', () => {
    state.data = { first: { id: 'first' } as DailyLog };
    const { result, rerender } = renderHook(() => useDailyLogs('child', null));

    expect(result.current.logs).toHaveLength(1);
    state.data = null;
    rerender();
    expect(result.current.logs).toEqual([]);
  });
});
