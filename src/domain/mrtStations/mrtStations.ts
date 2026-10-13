import stations from './mrtStations.json';

/**
 * 全台捷運與輕軌車站座標，供「我要去某一站，那附近有哪裡可以餵」用。
 *
 * 由 scripts/buildMrtStations.cjs 從 OpenStreetMap 產生（Overpass API，
 * railway=station 且 station=subway/light_rail），查證日期 2026-09-04。
 * 授權 ODbL，需標示來源——地圖底圖本來就標了 OpenStreetMap。
 *
 * 為什麼直接打進 bundle
 *   260 站、22 KB（gzip 4.2 KB）。哺乳室那 1.1 MB 要另外抓是因為它大，這一份
 *   直接 import 進 BabyOasis 的 lazy chunk 就好：家長點下「捷運站」那一刻要
 *   立刻看到清單，不該再等一次網路。
 *
 * 為什麼站名本身不夠、需要座標
 *   哺乳室資料裡只有 56 個場所的名稱帶「捷運」，遠少於實際站數。要回答「這一
 *   站附近有什麼」，需要的是全部車站的位置當定位點，不是只有剛好自己設了哺集
 *   乳室的那幾站。
 */
export interface MrtStation {
  /** 站名，不含系統與路線（「劍潭」而不是「臺北大眾捷運股份有限公司-劍潭站」）。 */
  name: string;
  /** 臺北捷運／新北捷運／桃園機場捷運／臺中捷運／高雄捷運。 */
  system: string;
  latitude: number;
  longitude: number;
}

/*
  沒有路線名是刻意的：OSM 把轉乘站記成一個節點、只帶一條線的代號，實測 21 個
  已知轉乘站有 13 個只對得到一條（忠孝復興只剩文湖線）。標一個少一半的路線比
  不標更糟。清單順序仍照路線代號排，同一條線的站因此還是相鄰。
*/

export const MRT_STATIONS: readonly MrtStation[] = stations;
