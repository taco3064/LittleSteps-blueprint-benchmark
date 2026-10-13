import { Search, X } from 'lucide-react';

import type { OutingModel } from './useOutingModel';

export function OutingSearch({ model }: { model: OutingModel }) {
  const { view, query, setQuery } = model;

  return (
    <div className="relative">
      <Search className={
        'absolute left-4 top-1/2'
        + ' -translate-y-1/2 w-4 h-4 text-ink-faint'
      }
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={
          view === 'centre'
            ? '搜尋館名、地址或區域'
            : '搜尋餐廳、地址或區域'
        }
        aria-label={view === 'centre' ? '搜尋親子館' : '搜尋親子餐廳'}
        className={
          'w-full min-h-tap pl-11 pr-14 py-3 bg-white'
          + ' rounded-2xl shadow-soft text-sm text-ink placeholder-ink-faint'
          + ' [&::-webkit-search-cancel-button]:appearance-none'
        }
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="清除搜尋"
          className="btn-icon absolute right-1 top-1/2 -translate-y-1/2"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
