import { useEffect, useState } from 'react';
import {
  countOtherWikiMatches,
  searchOtherWikis,
  type CrossWikiHit,
} from '~app/portal/domain/crossWikiSearch';
import type { ServiceId } from '~app/portal/domain/serviceCatalogue';

export function useCrossWikiResults(query: string, service: ServiceId) {
  const [hits, setHits] = useState<CrossWikiHit[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const keyword = query.trim();

    if (keyword === '') {
      setHits([]);
      setTotal(0);

      return;
    }

    // 資料是動態載入的，回來時使用者可能已經改了關鍵字或離開了。
    let current = true;

    void (async () => {
      const [found, count] = await Promise.all([
        searchOtherWikis(keyword, service),
        countOtherWikiMatches(keyword, service),
      ]);

      if (!current) {
        return;
      }

      setHits(found);
      setTotal(count);
    })();

    return () => {
      current = false;
    };
  }, [query, service]);

  return { hits, total };
}
