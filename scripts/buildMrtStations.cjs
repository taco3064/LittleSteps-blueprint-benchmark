#!/usr/bin/env node
'use strict';

/**
 * 產生 src/babyoasis/domain/mrtStations/mrtStations.json：全台捷運與輕軌車站座標。
 *
 * 為什麼需要這一份
 *   哺集乳室資料裡只有 56 個場所的名稱帶「捷運」，遠少於實際站數——家長要的
 *   「我要去某一站，那附近有哪裡可以餵」需要全部車站的座標當定位點，而不是
 *   只有剛好自己設了哺集乳室的那幾站。有了站點座標，選一站就等於手動定位，
 *   後面直接沿用既有的空間索引取最近幾筆。
 *
 * 為什麼是 OpenStreetMap 而不是各家業者的開放資料
 *   臺北、新北、桃園、臺中、高雄五套系統分屬不同單位，開放資料的格式、欄位
 *   與更新節奏都不同，而 TDX 需要申請金鑰。OSM 一次查詢就涵蓋全部五套系統
 *   （含淡海輕軌、安坑輕軌、高雄環狀輕軌），欄位一致，且地圖底圖本來就是
 *   OSM，標示需求已經滿足。授權：ODbL，需標示來源。
 *
 * 資料清理的三條規則
 *   1. 必須有 network 或 operator：OSM 裡三鶯線（LB01-LB12）兩者都沒有，
 *      那是還沒通車的路線，列出來只會把家長帶到工地。
 *   2. 排除 network=Skytrain：那是桃園機場航廈之間的接駁電車，不是捷運，
 *      而且同名節點重複出現。
 *   3. 轉乘站在 OSM 是兩個節點（南港展覽館 BL23／BR24 相距 107 公尺），
 *      合併成一站並保留兩條路線名，否則清單裡會出現兩個同名的站。
 *
 * 用法
 *   node scripts/buildMrtStations.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const OUT_FILE = path.join(__dirname, '..', 'src', 'babyoasis', 'domain', 'mrtStations', 'mrtStations.json');

/** 公共 Overpass 實例會限流，主要那台忙碌時換下一台，不要讓整份資料生不出來。 */
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const QUERY = `[out:json][timeout:120];
area["ISO3166-1"="TW"][admin_level=2]->.tw;
(
  node["railway"="station"]["station"="subway"](area.tw);
  node["railway"="station"]["station"="light_rail"](area.tw);
  node["railway"="halt"]["station"="light_rail"](area.tw);
);
out tags center;`;

/** 通車站數約 263 站；低於這個數就是查詢或上游出了問題，不要覆蓋既有資料。 */
const MIN_STATIONS = 240;

/** 顯示順序，由北到南。OSM 的 network 值先正規化成這五個。 */
const SYSTEM_ORDER = ['臺北捷運', '新北捷運', '桃園機場捷運', '臺中捷運', '高雄捷運'];

/**
 * 為什麼輸出裡沒有路線名
 *   ref 的字首（BL23、R22A）看起來就是路線，換成「板南線」也很誘人，但 OSM
 *   把一個轉乘站記成一個節點、只帶一個 ref：實測 21 個已知轉乘站有 13 個只
 *   對得到一條線（忠孝復興只剩文湖線，美麗島只剩橘線）。標一個少一半的路線
 *   比不標更糟，所以只輸出站名與系統。ref 仍然拿來排序，同一條線的站因此
 *   還是排在一起，只是不掛標籤。
 */
function normalizeSystem(tags) {
  const raw = (tags.network || tags.operator || '').replace(/^台/, '臺').replace(/公司$/, '');
  if (raw.startsWith('臺中捷運')) return '臺中捷運';
  if (raw.startsWith('桃園')) return '桃園機場捷運';
  return raw;
}

function fetchStations() {
  const errors = [];
  for (const endpoint of ENDPOINTS) {
    try {
      const body = execFileSync(
        'curl',
        ['-s', '--fail', '--max-time', '150', '-X', 'POST', '--data-binary', '@-', endpoint],
        { input: QUERY, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
      );
      const json = JSON.parse(body);
      if (!Array.isArray(json.elements)) throw new Error('回應沒有 elements 陣列');
      console.log(`  ${endpoint} 回傳 ${json.elements.length} 個節點`);
      return json.elements;
    } catch (error) {
      errors.push(`${endpoint}: ${error.message}`);
    }
  }
  throw new Error(`所有 Overpass 實例都取不到資料\n  ${errors.join('\n  ')}`);
}

function main() {
  console.log('查詢 OpenStreetMap 的捷運與輕軌車站…');
  const elements = fetchStations();

  const merged = new Map();
  let skipped = 0;
  elements.forEach((element) => {
    const tags = element.tags || {};
    const name = (tags['name:zh'] || tags.name || '').trim();
    const system = normalizeSystem(tags);
    // 規則 1 與 2：沒有營運者的是未通車路線，Skytrain 是航廈接駁電車。
    if (!name || !system || tags.network === 'Skytrain') {
      skipped += 1;
      return;
    }
    if (!SYSTEM_ORDER.includes(system)) {
      throw new Error(`未知的系統「${system}」（${name}），請確認 OSM 的 network 標記是否改過`);
    }

    const key = `${system}|${name}`;
    // 規則 3：轉乘站合併成一站。座標取先到的那個節點就夠——同站兩個節點相距
    // 最多 110 公尺，對「這站附近有什麼」沒有影響。
    if (merged.has(key)) return;
    merged.set(key, {
      name,
      system,
      ref: String(tags.ref || ''),
      latitude: +element.lat.toFixed(5),
      longitude: +element.lon.toFixed(5),
    });
  });

  const stations = [...merged.values()].sort(
    (a, b) =>
      SYSTEM_ORDER.indexOf(a.system) - SYSTEM_ORDER.indexOf(b.system) ||
      a.ref.localeCompare(b.ref, 'en') ||
      a.name.localeCompare(b.name, 'zh-Hant'),
  );
  if (stations.length < MIN_STATIONS) {
    throw new Error(`只取得 ${stations.length} 站，低於預期的 ${MIN_STATIONS}，中止以免產出殘缺資料`);
  }
  // ref 只是排序用的中間值，不寫進產出。
  const output = stations.map(({ ref, ...station }) => station);
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(output, null, 0)}\n`);

  const bySystem = {};
  output.forEach((station) => {
    bySystem[station.system] = (bySystem[station.system] || 0) + 1;
  });
  console.log(`\n輸出 ${output.length} 站，略過 ${skipped} 個節點`);
  Object.entries(bySystem).forEach(([system, count]) => console.log(`  ${system} ${count}`));
  console.log(
    `  ${path.relative(path.join(__dirname, '..'), OUT_FILE)} ${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB`,
  );
}

main();
