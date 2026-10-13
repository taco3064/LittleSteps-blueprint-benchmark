import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NursingRoom } from '../../src/domain/records';
import { categoryOf, isInternalVenue } from '../../src/domain/roomCategory';

/**
 * public/data/nursingRooms.json 由 scripts/buildNursingRooms.cjs 從國健署的
 * 哺集乳室地圖與依法應設置名單合併產生。這些測試守的是「重跑管線後資料仍然
 * 可用」——上游改欄位、改端點或回傳殘缺資料時要在這裡爆掉，而不是等到使用者
 * 打開地圖才發現一片空白或標記掉到海裡。
 */
const rooms: NursingRoom[] = JSON.parse(
  readFileSync(join(__dirname, '../../public/data/nursingRooms.json'), 'utf8'),
);

/** 台灣本島與離島（含連江）的外接範圍。 */
const TAIWAN_BOUNDS = { south: 21.5, north: 26.5, west: 118.0, east: 122.5 };

const EXPECTED_CITIES = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '澎湖縣',
  '金門縣',
  '連江縣',
];

describe('全國哺乳室資料', () => {
  it('筆數達到全國規模，而不是只剩單一縣市', () => {
    // 舊版只有臺北市 306 筆；國健署地圖全國約 3,900 筆。
    expect(rooms.length).toBeGreaterThan(3000);
  });

  it('涵蓋全部 22 個縣市', () => {
    const cities = new Set(rooms.map((room) => room.city));

    EXPECTED_CITIES.forEach((city) => expect(cities).toContain(city));
    expect(cities.size).toBe(EXPECTED_CITIES.length);
  });

  it('每筆都有名稱、地址與縣市', () => {
    const incomplete = rooms.filter(
      (room) => !room.name || !room.address || !room.city,
    );

    expect(incomplete).toEqual([]);
  });

  it('id 不重複', () => {
    expect(new Set(rooms.map((room) => room.id)).size).toBe(rooms.length);
  });

  it('每筆都有落在台灣範圍內的座標', () => {
    const outside = rooms.filter(
      (room) =>
        !Number.isFinite(room.latitude) ||
        !Number.isFinite(room.longitude) ||
        room.latitude < TAIWAN_BOUNDS.south ||
        room.latitude > TAIWAN_BOUNDS.north ||
        room.longitude < TAIWAN_BOUNDS.west ||
        room.longitude > TAIWAN_BOUNDS.east,
    );

    expect(
      outside.map((room) => `${room.name} ${room.latitude},${room.longitude}`),
    ).toEqual([]);
  });

  it('地址開頭的縣市與 city 欄位一致', () => {
    const mismatched = rooms.filter((room) => !room.address.startsWith(room.city));

    expect(mismatched.map((room) => `${room.city} / ${room.address}`)).toEqual([]);
  });

  it('沒有同名同址的重複記錄', () => {
    const keys = rooms.map((room) => `${room.name}@${room.address}`);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('設施欄位若存在，只記錄確認有的項目', () => {
    const withFacilities = rooms.filter((room) => room.facilities);

    // 來源不提供設施明細，只有臺北市開放資料補得上，屬少數。
    expect(withFacilities.length).toBeGreaterThan(0);

    withFacilities.forEach((room) => {
      const values = Object.values(room.facilities ?? {});

      expect(values.length).toBeGreaterThan(0);
      values.forEach((value) => expect(value).toBe(true));
    });
  });

  it('多數記錄帶有開放時間或注意事項', () => {
    const withDetail = rooms.filter((room) => room.openingHours || room.remarks);

    expect(withDetail.length).toBeGreaterThan(rooms.length / 2);
  });

  it('電話不含換行或空白，可直接用於 tel: 連結', () => {
    const malformed = rooms.filter((room) => room.phone && /\s/.test(room.phone));

    expect(malformed.map((room) => `${room.name}: ${room.phone}`)).toEqual([]);
  });

  it('statutory 只會是 true 或整個不存在，不會出現 false', () => {
    // 產生器一律省略假值欄位；寫成 false 會讓 `!room.statutory` 的判斷與
    // 「欄位存在」的判斷不再等價。
    const wrong = rooms.filter(
      (room) => 'statutory' in room && room.statutory !== true,
    );

    expect(wrong.map((room) => `${room.name}: ${String(room.statutory)}`)).toEqual(
      [],
    );
  });

  it('多數記錄在依法應設置名單上', () => {
    // 名單約 2,800 筆，地圖多出來的是自願設置場所。掉到兩千以下代表比對鍵
    // 壞了，內部場所的判斷會跟著失真。
    expect(rooms.filter((room) => room.statutory).length).toBeGreaterThan(2000);
  });

  it('場所分類把絕大多數記錄歸到具體類別，其他類不超過 12%', () => {
    // 規則表比對的是登記名稱，上游改寫名稱格式時會靜靜地把整批場所推進
    // 「其他」——那時 chip 篩出來的東西會愈來愈少，卻不會有任何錯誤。
    const other = rooms.filter((room) => categoryOf(room) === 'other');

    expect(other.length / rooms.length).toBeLessThan(0.12);
  });

  it('確實存在一批公司或校園又不在名單上的場所，內部場所提示才有意義', () => {
    expect(rooms.filter(isInternalVenue).length).toBeGreaterThan(100);
  });
});
