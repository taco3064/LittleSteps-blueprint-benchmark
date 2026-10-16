import { Search, X } from 'lucide-react';

export function RoomQuery({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        className={
          'absolute left-4 top-1/2 -translate-y-1/2 w-4 ' + 'h-4 text-ink-faint'
        }
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜尋場所、地址或區域"
        aria-label="搜尋哺乳室"
        className={
          'w-full min-h-tap pl-11 pr-14 py-3 bg-white rounded-2xl '
          + 'shadow-soft text-sm text-ink placeholder-ink-faint [&::'
          + '-webkit-search-cancel-button]:appearance-none'
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
