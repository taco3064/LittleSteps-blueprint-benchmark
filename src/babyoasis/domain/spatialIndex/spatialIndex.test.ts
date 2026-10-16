import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { NursingRoom } from '../nursingRooms/index';
import { createSpatialIndex, distanceBetween, GeoPoint } from './index';

const rooms: NursingRoom[] = JSON.parse(
  readFileSync(join(__dirname, '../../../../public/data/nursingRooms.json'), 'utf8'),
);

/** 暴力解：索引的唯一正確性標準就是與它逐筆一致。 */
function bruteForceNearest<T extends GeoPoint>(
  items: readonly T[],
  latitude: number,
  longitude: number,
  limit: number,
  maxDistanceKm?: number,
) {
  return items
    .map((item) => ({
      item,
      distanceKm: distanceBetween(
        [latitude, longitude],
        [item.latitude, item.longitude],
      ),
    }))
    .filter(
      (entry) => maxDistanceKm === undefined || entry.distanceKm <= maxDistanceKm,
    )
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/** 涵蓋六都、離島與海上、境外等落在格線外的查詢點。 */
const QUERY_POINTS: [number, number][] = [
  [25.033, 121.5645], // 臺北 101
  [25.0, 121.46], // 新北
  [24.1477, 120.6736], // 臺中
  [22.9997, 120.227], // 臺南
  [22.6273, 120.3014], // 高雄
  [23.9971, 121.6015], // 花蓮
  [23.5655, 119.5865], // 澎湖
  [26.1608, 119.9494], // 連江
  [23.5, 121.0], // 中央山脈，附近點稀疏
  [21.0, 120.0], // 台灣以南海面
  [30.0, 125.0], // 遠在資料範圍之外
];

describe('createSpatialIndex', () => {
  const index = createSpatialIndex(rooms);

  it('索引涵蓋全部資料', () => {
    expect(index.size).toBe(rooms.length);
    expect(rooms.length).toBeGreaterThan(0);
  });

  it.each(QUERY_POINTS)(
    '最近查詢結果與暴力解一致 (%s, %s)',
    (latitude, longitude) => {
      const expected = bruteForceNearest(rooms, latitude, longitude, 20);
      const actual = index.nearest([latitude, longitude], 20);

      expect(actual.map((entry) => entry.item.id)).toEqual(
        expected.map((entry) => entry.item.id),
      );

      actual.forEach((entry, i) => {
        expect(entry.distanceKm).toBeCloseTo(expected[i].distanceKm, 9);
      });
    },
  );

  it('結果依距離遞增排序', () => {
    const found = index.nearest([25.033, 121.5645], 30);
    const distances = found.map((entry) => entry.distanceKm);

    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it('maxDistanceKm 會排除範圍外的點，且與暴力解一致', () => {
    const [latitude, longitude] = QUERY_POINTS[0];
    const actual = index.nearest([latitude, longitude], 50, 3);
    const expected = bruteForceNearest(rooms, latitude, longitude, 50, 3);

    expect(actual.map((entry) => entry.item.id)).toEqual(
      expected.map((entry) => entry.item.id),
    );

    actual.forEach((entry) => expect(entry.distanceKm).toBeLessThanOrEqual(3));
  });

  it('limit 大於資料筆數時回傳全部，不會補空值', () => {
    const small = createSpatialIndex([
      { latitude: 25, longitude: 121 },
      { latitude: 25.001, longitude: 121.001 },
    ]);

    expect(small.nearest([25, 121], 10)).toHaveLength(2);
  });

  it('limit 為零或索引為空時回傳空陣列', () => {
    expect(index.nearest([25.033, 121.5645], 0)).toEqual([]);
    expect(createSpatialIndex([]).nearest([25.033, 121.5645], 5)).toEqual([]);
  });

  it('withinBounds 與暴力解一致', () => {
    const [south, west, north, east] = [24.9, 121.4, 25.15, 121.7];

    const actual = index
      .withinBounds([south, west], [north, east])
      .map((room) => room.id)
      .sort();

    const expected = rooms
      .filter(
        (room) =>
          room.latitude >= south
          && room.latitude <= north
          && room.longitude >= west
          && room.longitude <= east,
      )
      .map((room) => room.id)
      .sort();

    expect(actual).toEqual(expected);
    expect(actual.length).toBeGreaterThan(0);
  });

  it('withinBounds 不會漏掉剛好落在邊界上的點', () => {
    const target = rooms[0];

    const found = index.withinBounds(
      [target.latitude, target.longitude],
      [target.latitude, target.longitude],
    );

    expect(found.map((room) => room.id)).toContain(target.id);
  });

  it('忽略座標無效的項目而不是讓查詢崩潰', () => {
    const withBroken = createSpatialIndex([
      { latitude: 25, longitude: 121 },
      { latitude: Number.NaN, longitude: 121 },
    ]);

    expect(withBroken.nearest([25, 121], 5)).toHaveLength(1);
  });
});

describe('distanceBetween', () => {
  it('同一點距離為零', () => {
    expect(distanceBetween([25.033, 121.5645], [25.033, 121.5645])).toBe(0);
  });

  it('臺北到高雄約 296 公里', () => {
    // 兩地直線距離的公認值約 295 至 300 公里。
    const km = distanceBetween([25.033, 121.5645], [22.6273, 120.3014]);

    expect(km).toBeGreaterThan(290);
    expect(km).toBeLessThan(305);
  });

  it('距離對稱', () => {
    const forward = distanceBetween([25.033, 121.5645], [22.6273, 120.3014]);
    const backward = distanceBetween([22.6273, 120.3014], [25.033, 121.5645]);

    expect(forward).toBeCloseTo(backward, 12);
  });
});
