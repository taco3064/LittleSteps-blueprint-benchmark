import { useEffect, useState } from 'react';
import type { Venue } from '~app/domain/records';
import { fetchFamilyCentres } from '~app/services/reference_data';

export function useFamilyCentres() {
  const [centres, setCentres] = useState<Venue[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  /* 名冊還在路上時，畫面不能先講「共 0 處 / 找不到符合的場地」——那是在回答
     一個還沒問完的問題。 */
  const [loading, setLoading] = useState(true);

  // 名冊約 118 KB，和哺乳室資料一樣放靜態 JSON，不進 JS bundle。
  useEffect(() => {
    let active = true;

    fetchFamilyCentres()
      .then((rows) => {
        if (active) {
          setCentres(rows);
        }
      })
      .catch((error) => {
        console.error('親子館資料載入失敗:', error);

        if (active) {
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { centres, loadFailed, loading };
}
