/**
 * 22 縣市的代表座標，只用來把 geolocation 的一個點對到一個縣市名。
 *
 * 刻意不做 geocoding：本 repo 已經測試並否決過台灣地址的 geocoding（見
 * README 的 LittleOuting 段），而這裡需要的精度只有「哪一縣市」。座標取各縣
 * 市政府所在地，誤差不影響最近縣市的判斷；二十二筆座標於 2026-09-03 逐筆查證。
 *
 * 縣市名必須與 diseaseRadar.json 的 key 完全一致（上游用「台北市」而非
 * 「臺北市」），countyCentroids.test.ts 會逐字比對——打錯一個字不會報錯，
 * 只會讓定位永遠對不到那一格。
 */
export const COUNTY_CENTROIDS: { name: string; lat: number; lon: number }[] = [
  { name: '基隆市', lat: 25.1276, lon: 121.7392 },
  { name: '台北市', lat: 25.0375, lon: 121.5637 },
  { name: '新北市', lat: 25.0169, lon: 121.4627 },
  { name: '桃園市', lat: 24.9937, lon: 121.297 },
  { name: '新竹市', lat: 24.8039, lon: 120.9647 },
  { name: '新竹縣', lat: 24.8387, lon: 121.0177 },
  { name: '苗栗縣', lat: 24.5602, lon: 120.8214 },
  { name: '台中市', lat: 24.1477, lon: 120.6736 },
  { name: '彰化縣', lat: 24.0752, lon: 120.5443 },
  { name: '南投縣', lat: 23.9609, lon: 120.9718 },
  { name: '雲林縣', lat: 23.7092, lon: 120.4313 },
  { name: '嘉義市', lat: 23.4801, lon: 120.4491 },
  { name: '嘉義縣', lat: 23.4518, lon: 120.2555 },
  { name: '台南市', lat: 22.9999, lon: 120.2269 },
  { name: '高雄市', lat: 22.6273, lon: 120.3014 },
  { name: '屏東縣', lat: 22.5519, lon: 120.5487 },
  { name: '台東縣', lat: 22.7583, lon: 121.1444 },
  { name: '花蓮縣', lat: 23.9872, lon: 121.6015 },
  { name: '宜蘭縣', lat: 24.7021, lon: 121.7378 },
  { name: '澎湖縣', lat: 23.5711, lon: 119.5793 },
  { name: '金門縣', lat: 24.4321, lon: 118.3171 },
  { name: '連江縣', lat: 26.1608, lon: 119.9494 },
];

/** 平面近似就夠：縣市尺度下不需要大圓距離。 */
export function nearestCounty(lat: number, lon: number): string {
  let best = COUNTY_CENTROIDS[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const county of COUNTY_CENTROIDS) {
    const dLat = county.lat - lat;
    // 一度經度在北緯 23 度只有一度緯度的 0.92 倍長，少了這個 cos，中南部
    // 山區會被判去隔壁縣市。
    const dLon = (county.lon - lon) * Math.cos((lat * Math.PI) / 180);
    const distance = dLat * dLat + dLon * dLon;

    if (distance < bestDistance) {
      bestDistance = distance;
      best = county;
    }
  }

  return best.name;
}
