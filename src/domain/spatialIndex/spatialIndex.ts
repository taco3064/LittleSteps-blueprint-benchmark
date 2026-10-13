/**
 * 哺集乳室的空間索引。
 *
 * 為什麼是均勻格線而不是 quadtree
 *   資料是全台約 3,900 個固定點，載入後不再增刪，且分布範圍侷限在台灣本島與
 *   離島這個小矩形內。以 0.02 度（約 2.2 公里）分格時共 1,104 格，中位數
 *   2 點、最多的一格 59 點——佔用低且相當平均。quadtree 的自適應細分是為
 *   了處理高度不均或動態插入的資料，在這裡買不到任何東西，卻要多付樹走訪與
 *   指標追逐的成本。均勻格線的格號可以直接由座標算出，是 O(1) 查表。
 *
 * 為什麼需要索引
 *   線性掃描取最近 20 筆需要對全部 3,852 筆各算一次距離、配置一個等長的暫存
 *   陣列，再整體排序，實測 0.57 ms。環狀展開通常只碰 9 到 25 格、約 50 到 200
 *   個點，且一旦已取得足夠筆數、且下一環的最短可能距離已超過目前第 k 名的
 *   距離就停止，不必排序整個資料集。
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Located<T> {
  item: T;
  /** 與查詢點的距離（公里） */
  distanceKm: number;
}

/** 格邊長（度）。0.02 度緯度約 2.22 公里，在台灣的緯度上經度約 2.02 公里。 */
const CELL_SIZE_DEGREES = 0.02;

/**
 * 每擴張一環，最短可能距離至少增加一格邊長。取台灣緯度範圍內較小的經度值
 * 作為保守下界，寧可多找一環也不要提早停止而漏掉更近的點。
 */
const MIN_KM_PER_RING = 2.0;

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Haversine 距離（公里）。 */
export function distanceBetween(from: GeoPoint, to: GeoPoint): number {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const a
    = Math.sin(deltaLat / 2) ** 2
      + Math.cos(toRadians(from.latitude))
      * Math.cos(toRadians(to.latitude))
      * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

const cellIndex = (value: number) => Math.floor(value / CELL_SIZE_DEGREES);
const cellKey = (latCell: number, lngCell: number) => `${latCell},${lngCell}`;

export interface SpatialIndex<T> {
  /** 依距離由近到遠取最多 limit 筆，可選擇限制最大距離。 */
  nearest(query: NearestQuery): Located<T>[];
  /** 取出落在指定經緯度範圍內的項目，不排序。 */
  withinBounds(bounds: GeoBounds): T[];
  readonly size: number;
}

export interface NearestQuery extends GeoPoint {
  limit: number;
  maxDistanceKm?: number;
}
export interface GeoBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}
interface CellBounds {
  minLatCell: number;
  maxLatCell: number;
  minLngCell: number;
  maxLngCell: number;
}

export function createSpatialIndex<T extends GeoPoint>(
  items: readonly T[],
): SpatialIndex<T> {
  const buckets = buildBuckets(items);
  const bounds = cellBounds(buckets);

  return {
    size: items.length,
    nearest: (query) => queryNearest(buckets, bounds, query),
    withinBounds: (region) => queryBounds(buckets, region),
  };
}

function buildBuckets<T extends GeoPoint>(items: readonly T[]) {
  // 索引在載入資料時建立一次；用 Map 是因為格號是執行期算出的稀疏鍵。
  const buckets = new Map<string, T[]>();

  items.forEach((item) => {
    if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) {
      return;
    }

    const key = cellKey(cellIndex(item.latitude), cellIndex(item.longitude));
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
    }
  });

  return buckets;
}

function cellBounds<T>(buckets: Map<string, T[]>): CellBounds {
  // 資料佔用的格號範圍。查詢點可能落在資料範圍外（例如海上或境外），此時
  // 需要擴張的環數取決於查詢點到這個範圍有多遠，不能只看資料本身的跨度。
  let minLatCell = 0;
  let maxLatCell = 0;
  let minLngCell = 0;
  let maxLngCell = 0;

  if (buckets.size > 0) {
    minLatCell = Infinity;
    maxLatCell = -Infinity;
    minLngCell = Infinity;
    maxLngCell = -Infinity;

    buckets.forEach((_, key) => {
      const separator = key.indexOf(',');
      const latCell = Number(key.slice(0, separator));
      const lngCell = Number(key.slice(separator + 1));

      if (latCell < minLatCell) {
        minLatCell = latCell;
      }

      if (latCell > maxLatCell) {
        maxLatCell = latCell;
      }

      if (lngCell < minLngCell) {
        minLngCell = lngCell;
      }

      if (lngCell > maxLngCell) {
        maxLngCell = lngCell;
      }
    });
  }

  return { minLatCell, maxLatCell, minLngCell, maxLngCell };
}

/** 從查詢點的格子出發，涵蓋所有資料格所需的最大環數。 */
function ringLimitFrom(centerLat: number, centerLng: number, bounds: CellBounds) {
  const { minLatCell, maxLatCell, minLngCell, maxLngCell } = bounds;

  return Math.max(
    Math.abs(centerLat - minLatCell),
    Math.abs(centerLat - maxLatCell),
    Math.abs(centerLng - minLngCell),
    Math.abs(centerLng - maxLngCell),
  );
}

/** 呼叫 visit 走訪與中心格 Chebyshev 距離恰為 ring 的所有格子。 */
function forEachCellInRing<T>(
  buckets: Map<string, T[]>,
  {
    centerLat,
    centerLng,
    ring,
  }: { centerLat: number; centerLng: number; ring: number },
  visit: (bucket: T[]) => void,
) {
  if (ring === 0) {
    const bucket = buckets.get(cellKey(centerLat, centerLng));

    if (bucket) {
      visit(bucket);
    }

    return;
  }

  for (let latCell = centerLat - ring; latCell <= centerLat + ring; latCell += 1) {
    const onLatEdge = latCell === centerLat - ring || latCell === centerLat + ring;
    // 非上下邊的列只有左右兩端屬於這一環，中間屬於更內圈，跳過避免重複計算。
    const step = onLatEdge ? 1 : ring * 2;

    for (
      let lngCell = centerLng - ring;
      lngCell <= centerLng + ring;
      lngCell += step
    ) {
      const bucket = buckets.get(cellKey(latCell, lngCell));

      if (bucket) {
        visit(bucket);
      }
    }
  }
}

function queryNearest<T extends GeoPoint>(
  buckets: Map<string, T[]>,
  bounds: CellBounds,
  { latitude, longitude, limit, maxDistanceKm }: NearestQuery,
): Located<T>[] {
  // 沒有任何格子時，格線邊界不成立，環狀展開會一路擴張到查詢點的絕對格號。
  if (limit <= 0 || buckets.size === 0) {
    return [];
  }

  const centerLat = cellIndex(latitude);
  const centerLng = cellIndex(longitude);
  const found: Located<T>[] = [];

  const ringLimit = ringLimitFrom(centerLat, centerLng, bounds);

  for (let ring = 0; ring <= ringLimit; ring += 1) {
    forEachCellInRing(buckets, { centerLat, centerLng, ring }, (bucket) => {
      collectLocated(found, bucket, { latitude, longitude, maxDistanceKm });
    });

    // 下一環的最短可能距離；已湊滿且第 k 名比它更近就不必再往外找。
    const nextRingMinKm = ring * MIN_KM_PER_RING;

    if (nearestComplete(found, limit, nextRingMinKm)) {
      return found.slice(0, limit);
    }

    if (maxDistanceKm !== undefined && nextRingMinKm > maxDistanceKm) {
      break;
    }
  }

  found.sort((a, b) => a.distanceKm - b.distanceKm);

  return found.slice(0, limit);
}

function queryBounds<T extends GeoPoint>(
  buckets: Map<string, T[]>,
  { south, west, north, east }: GeoBounds,
): T[] {
  const result: T[] = [];
  const latFrom = cellIndex(south);
  const latTo = cellIndex(north);
  const lngFrom = cellIndex(west);
  const lngTo = cellIndex(east);

  for (let latCell = latFrom; latCell <= latTo; latCell += 1) {
    for (let lngCell = lngFrom; lngCell <= lngTo; lngCell += 1) {
      const bucket = buckets.get(cellKey(latCell, lngCell));

      if (!bucket) {
        continue;
      }

      bucket.forEach((item) => {
        // 邊界格只有部分落在範圍內，仍需逐點確認。
        if (
          item.latitude >= south
          && item.latitude <= north
          && item.longitude >= west
          && item.longitude <= east
        ) {
          result.push(item);
        }
      });
    }
  }

  return result;
}

function collectLocated<T extends GeoPoint>(
  found: Located<T>[],
  bucket: T[],
  { latitude, longitude, maxDistanceKm }: Omit<NearestQuery, 'limit'>,
) {
  bucket.forEach((item) => {
    const distanceKm = distanceBetween({ latitude, longitude }, item);

    if (maxDistanceKm !== undefined && distanceKm > maxDistanceKm) {
      return;
    }

    found.push({ item, distanceKm });
  });
}

function nearestComplete<T>(
  found: Located<T>[],
  limit: number,
  nextRingMinKm: number,
) {
  if (found.length < limit) {
    return false;
  }

  found.sort((a, b) => a.distanceKm - b.distanceKm);

  return found[limit - 1].distanceKm <= nextRingMinKm;
}
