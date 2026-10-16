import { Search } from 'lucide-react';

export function MrtSearch({
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
        placeholder="搜尋站名"
        aria-label="搜尋捷運站"
        className={
          'w-full min-h-tap pl-11 pr-4 py-3 bg-white rounded-2xl b'
          + 'order border-ink/10 text-sm text-ink placeholder-ink-fa'
          + 'int [&::-webkit-search-cancel-button]:appearance-none'
        }
      />
    </div>
  );
}
