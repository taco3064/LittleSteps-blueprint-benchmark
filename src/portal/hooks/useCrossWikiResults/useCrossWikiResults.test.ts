import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  countOtherWikiMatches,
  searchOtherWikis,
  type CrossWikiHit,
} from '~app/portal/domain/crossWikiSearch';
import { useCrossWikiResults } from './useCrossWikiResults';

vi.mock('~app/portal/domain/crossWikiSearch', () => ({
  countOtherWikiMatches: vi.fn(),
  searchOtherWikis: vi.fn(),
}));

function pending<T>() {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((done) => {
    resolve = done;
  });

  return { promise, resolve };
}

beforeEach(() => vi.clearAllMocks());

describe('cross-wiki search ownership', () => {
  it('keeps the latest query when older loading finishes last', async () => {
    const oldHits = pending<CrossWikiHit[]>();
    const oldCount = pending<number>();

    vi.mocked(searchOtherWikis).mockReturnValueOnce(oldHits.promise)
      .mockResolvedValueOnce([]);

    vi.mocked(countOtherWikiMatches).mockReturnValueOnce(oldCount.promise)
      .mockResolvedValueOnce(2);

    const { result, rerender } = renderHook(
      ({ query }) => useCrossWikiResults(query, 'littlesteps'),
      { initialProps: { query: '咳嗽' } },
    );

    rerender({ query: '發燒' });
    await waitFor(() => expect(result.current.total).toBe(2));

    await act(async () => {
      oldHits.resolve([]);
      oldCount.resolve(99);
    });

    expect(result.current.total).toBe(2);
  });

  it('clears results for whitespace without another search', async () => {
    vi.mocked(searchOtherWikis).mockResolvedValue([]);
    vi.mocked(countOtherWikiMatches).mockResolvedValue(4);

    const { result, rerender } = renderHook(
      ({ query }) => useCrossWikiResults(query, 'littlesteps'),
      { initialProps: { query: ' 發燒 ' } },
    );

    await waitFor(() => expect(result.current.total).toBe(4));
    expect(searchOtherWikis).toHaveBeenCalledWith('發燒', 'littlesteps');
    rerender({ query: '  ' });
    expect(result.current).toEqual({ hits: [], total: 0 });
    expect(searchOtherWikis).toHaveBeenCalledTimes(1);
  });
});
