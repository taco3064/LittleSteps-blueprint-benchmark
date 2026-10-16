import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { COUNTY_CENTROIDS, nearestCounty } from './index';

/**
 * 定位功能唯一的死點是名字：座標挑得再準，只要縣市名跟 diseaseRadar.json 差
 * 一個字（「台」對「臺」），定位就永遠對不到那一格，而且不會報錯——它會安靜
 * 地什麼都不做。所以這裡除了距離計算，更重要的是那條名字比對。
 */
const HERE = dirname(fileURLToPath(import.meta.url));

const data = JSON.parse(
  readFileSync(join(HERE, '../../../../public/data/diseaseRadar.json'), 'utf8'),
) as { counties: Record<string, unknown> };

describe('COUNTY_CENTROIDS 與資料的縣市名', () => {
  it('22 個縣市，名字與 diseaseRadar.json 逐字相同', () => {
    const inData = Object.keys(data.counties);

    expect(inData).toHaveLength(22);
    expect(COUNTY_CENTROIDS).toHaveLength(22);

    expect([...COUNTY_CENTROIDS.map((c) => c.name)].sort()).toEqual(
      [...inData].sort(),
    );
  });

  it('RadarPage 的預設縣市在兩邊都存在', () => {
    expect(COUNTY_CENTROIDS.map((c) => c.name)).toContain('台北市');
    expect(Object.keys(data.counties)).toContain('台北市');
  });

  it('沒有重複的縣市，座標都落在台灣及離島的範圍內', () => {
    const names = COUNTY_CENTROIDS.map((c) => c.name);

    expect(new Set(names).size).toBe(names.length);

    COUNTY_CENTROIDS.forEach((county) => {
      expect(county.lat).toBeGreaterThan(21.8);
      expect(county.lat).toBeLessThan(26.4);
      expect(county.lon).toBeGreaterThan(118.1);
      expect(county.lon).toBeLessThan(122.1);
    });
  });
});

describe('nearestCounty', () => {
  it('每個縣市的代表座標都對回自己', () => {
    // 這一條會抓到任何一組打錯或對調的座標：只要有一顆被挪到別人家裡，
    // 它就對不回自己。
    COUNTY_CENTROIDS.forEach((county) => {
      expect(nearestCounty(county.lat, county.lon)).toBe(county.name);
    });
  });

  it('本島常見地點對得到所在縣市', () => {
    expect(nearestCounty(25.034, 121.5645)).toBe('台北市'); // 台北 101
    expect(nearestCounty(25.0143, 121.467)).toBe('新北市'); // 板橋車站
    expect(nearestCounty(24.1369, 120.6869)).toBe('台中市'); // 台中車站
    expect(nearestCounty(22.6205, 120.282)).toBe('高雄市'); // 駁二
    expect(nearestCounty(23.993, 121.601)).toBe('花蓮縣'); // 花蓮車站
    expect(nearestCounty(23.857, 120.915)).toBe('南投縣'); // 日月潭
  });

  it('離島不會被拉到本島', () => {
    expect(nearestCounty(23.5655, 119.5663)).toBe('澎湖縣'); // 馬公
    expect(nearestCounty(24.433, 118.317)).toBe('金門縣'); // 金城
    expect(nearestCounty(26.16, 119.94)).toBe('連江縣'); // 南竿
  });

  it('經度差有按緯度收斂，不是把度數當公里用', () => {
    // 一度經度在北緯 23 度只有一度緯度的 0.92 倍長。少了那個 cos，這個點
    // 會被算成離嘉義市比較近。
    expect(nearestCounty(23.07, 120.72)).toBe('台南市');
  });

  it('超出台灣範圍的座標仍然回一個縣市名，不會回 undefined', () => {
    // geolocation 可能給出國外或明顯離譜的點；這裡的合約是「一定給得出一個
    // 名字」，由呼叫端決定那個名字在不在資料裡。
    const far = nearestCounty(35.6812, 139.7671); // 東京

    expect(COUNTY_CENTROIDS.map((c) => c.name)).toContain(far);
  });
});
