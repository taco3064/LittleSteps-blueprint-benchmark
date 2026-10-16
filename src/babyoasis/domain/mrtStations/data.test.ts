import { describe, expect, it } from 'vitest';
import { MRT_STATIONS } from './index';

/**
 * mrtStations.json 由 scripts/buildMrtStations.cjs 從 OpenStreetMap 產生。
 * 這些測試守的是「重跑腳本後這份資料仍然能當定位點用」——上游改標記、路線代號
 * 改寫，或查詢只回一半的站，都要在這裡爆掉，而不是等家長選了一站卻飛到海上。
 */
const TAIWAN_BOUNDS = { south: 21.5, north: 26.5, west: 118.0, east: 122.5 };

const EXPECTED_SYSTEMS = [
  '臺北捷運',
  '新北捷運',
  '桃園機場捷運',
  '臺中捷運',
  '高雄捷運',
];

describe('捷運車站資料', () => {
  it('站數達到全台通車規模', () => {
    // 2026 年通車站數約 260（含淡海輕軌、安坑輕軌、高雄環狀輕軌）。
    expect(MRT_STATIONS.length).toBeGreaterThan(240);
  });

  it('只有五套系統，沒有未通車路線混進來', () => {
    // 三鶯線在 OSM 沒有 network／operator，腳本靠這一點把它排除；這裡守住結果。
    const systems = [...new Set(MRT_STATIONS.map((station) => station.system))];

    expect(systems.sort()).toEqual([...EXPECTED_SYSTEMS].sort());
  });

  it('每一站都有站名與台灣範圍內的座標', () => {
    const broken = MRT_STATIONS.filter(
      (station) =>
        !station.name
        || !Number.isFinite(station.latitude)
        || !Number.isFinite(station.longitude)
        || station.latitude < TAIWAN_BOUNDS.south
        || station.latitude > TAIWAN_BOUNDS.north
        || station.longitude < TAIWAN_BOUNDS.west
        || station.longitude > TAIWAN_BOUNDS.east,
    );

    expect(broken.map((station) => `${station.system} ${station.name}`)).toEqual([]);
  });

  it('同一套系統裡沒有重複的站名', () => {
    // 轉乘站在 OSM 是兩個節點（南港展覽館相距 107 公尺），腳本合併成一站。
    const keys = MRT_STATIONS.map((station) => `${station.system}|${station.name}`);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('轉乘站只出現一次', () => {
    const exchange = MRT_STATIONS.filter((station) => station.name === '南港展覽館');

    expect(exchange).toHaveLength(1);
  });

  it('站名不含營運公司，直接就是家長講的那個名字', () => {
    // 「臺北大眾捷運股份有限公司-劍潭站」是哺乳室資料裡的場所名；這一份不是。
    // 「站」字本身不能當雜訊擋掉——高雄車站、岡山車站、橋頭火車站都是站名。
    const noisy = MRT_STATIONS.filter((station) => /捷運|公司/.test(station.name));

    expect(noisy.map((station) => station.name)).toEqual([]);
  });
});
