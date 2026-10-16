/**
 * 產生 public/data/familyCentres.json：全國親子館（托育資源中心）場館資料。
 *
 * 來源
 *
 *   1. 主幹：衛生福利部社會及家庭署《全國親子館(托育資源中心)名冊(115.06)》
 *      https://www.sfaa.gov.tw/sfaa/list/detail/5eC/5Ea
 *      234 筆，全國唯一一份把 22 縣市都收齊的官方名單，欄位為
 *      項次／縣市／區域／名稱／地址／電話／成立時間。
 *      授權：政府資料開放授權條款第 1 版（需顯名標示，見檔尾 ATTRIBUTION）。
 *
 *   2. 補充：臺北市嬰幼兒照顧服務_育兒友善園
 *      https://data.taipei/dataset/detail?id=7262cdae-18e7-4d33-a842-4978cbc84d43
 *      13 筆，只有臺北市有。育兒友善園是規模小得多的社區據點，和親子館
 *      是兩種服務，所以另立 id 前綴並在 notes 說明，絕不併進 234 筆裡。
 *
 * 為什麼把擷取結果進版控（scripts/data/familyCentres.source.tsv）
 *   來源是 PDF。要在建置時重新解析就得帶進 poppler 或一套 PDF 函式庫，
 *   而這個專案沒有這種依賴，為了 234 筆資料引進一個原生依賴不划算。把擷取
 *   結果釘成 TSV 有三個好處：建置可重現（同一份 TSV 永遠產出同一份 JSON）、
 *   資料能在 diff 裡被人眼審（PDF 不能）、以及下一版名冊出來時能一眼看出
 *   哪幾列變了。這和 src/babyoasis/domain/facilities/facilities.json 進版控的理由一致：
 *   無法在建置時穩定重新取得的資產就釘住，能重新下載的就不釘。
 *   育兒友善園是 JSON API，隨時可重抓，所以不釘，由本腳本現抓。
 *
 * 為什麼沒有經緯度
 *   三份官方來源（本名冊、臺北市 CSV、桃園市 CSV）都不含座標，而自行地理
 *   編碼在這個專案已經實測失敗：免費的 OSM 系服務定位台灣門牌，誤差中位數
 *   830 公尺、p75 7.2 公里（詳見 scripts/buildNursingRooms.cjs）。與其給家長
 *   一個會把他們導到隔壁區的地圖，不如老實地只提供縣市／區瀏覽。
 *
 * 為什麼標籤只有四個
 *   名冊沒有任何設施欄位。托育資源中心這個方案本身的定義（社家署對外說明）
 *   保證了免費、家長全程陪同、室內、教玩具借閱這四件事，所以每一館都掛上
 *   這四個標籤；其餘設施（尿布台、哺乳室、停車場…）一律不掛——沒有來源就
 *   不能寫，猜出來的設施標籤會讓家長帶著孩子白跑一趟。
 *   needsBooking 只掛在 src/littleouting/domain/centreAccess/centreAccess.ts 查證到「入館
 *   須先預約」的縣市；能現場排隊的縣市不掛，因為那會嚇退不想預約的家長。
 *
 * 關於 id 的壽命
 *   id 是 centre-<項次>，項次來自名冊。下一版名冊若在中間插入新館，項次會
 *   整批位移，因此這些 id 只在同一版名冊內穩定，不可用作長期主鍵。
 *   要做收藏／備註等會存進 Firebase 的功能，請另外用 名稱+地址 當鍵。
 *
 * 用法
 *   node scripts/buildFamilyCentres.cjs
 *   node scripts/buildFamilyCentres.cjs --youyuan=<本機 JSON 路徑>
 *   node scripts/buildFamilyCentres.cjs --skip-youyuan
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SOURCE_TSV = path.join(__dirname, 'data/familyCentres.source.tsv');
const OUTPUT = path.join(ROOT, 'public/data/familyCentres.json');

/** 名冊的下載頁。逐筆 sourceUrl 都指這裡，因為 PDF 的檔名每版都會換。 */
const SFAA_URL = 'https://www.sfaa.gov.tw/sfaa/list/detail/5eC/5Ea';
const TAIPEI_DATASET_URL =
  'https://data.taipei/dataset/detail?id=7262cdae-18e7-4d33-a842-4978cbc84d43';
/** data.taipei 的資源 id（不是 dataset id，dataset id 查出來是空陣列）。 */
const TAIPEI_API_URL =
  'https://data.taipei/api/v1/dataset/4bfa01ad-7ba0-4b7a-9c1b-f9c58a2cd751?scope=resourceAquire&limit=200';

/** 名冊擷取當天的日期。不用 new Date()，否則每次跑都會改 JSON。 */
const VERIFIED_ON = '2026-08-28';

/**
 * 官方公布的各縣市館數。名冊自己的小計，用來擋擷取錯誤：少一列或縣市沒承接
 * 下來，這裡就會爆，而不是等家長發現某個區的館不見了。
 */
const EXPECTED_BY_CITY = {
  新北市: 63, 臺北市: 13, 桃園市: 24, 臺中市: 26, 高雄市: 24, 宜蘭縣: 14,
  臺南市: 13, 彰化縣: 10, 基隆市: 7, 雲林縣: 6, 屏東縣: 5, 臺東縣: 4,
  花蓮縣: 4, 苗栗縣: 3, 新竹市: 3, 金門縣: 3, 南投縣: 3, 新竹縣: 2,
  嘉義縣: 2, 嘉義市: 2, 連江縣: 2, 澎湖縣: 1,
};
const EXPECTED_TOTAL = Object.values(EXPECTED_BY_CITY).reduce((a, b) => a + b, 0);

/**
 * 托育資源中心這個方案的定義就保證的四件事，所以每一館都掛。
 * 其餘標籤沒有來源，一個都不加。
 */
const BASE_TAGS = ['free', 'guardianRequired', 'indoor', 'toyLending'];

/**
 * 查證到「入館須先預約」的縣市，依 src/littleouting/domain/centreAccess/centreAccess.ts。
 *
 * 這份名單和那個 TS 檔重複，是模組邊界逼出來的：本腳本是 CommonJS，讀不到
 * .ts。所以不靠自律，改用測試把兩邊釘在一起——
 * src/littleouting/services/family_centres/family_centres.test.ts 的「needsBooking 只出現在
 * centreAccess 查證到預約報名制的縣市」會比對產出的標籤與 centreAccess 裡
 * booking.value 開頭是不是「預約報名制」，任一邊改了另一邊沒跟上就會紅。
 */
const NEEDS_BOOKING_CITIES = new Set(['新北市']);

/** 名冊寫的是 6 歲以下，不是 0-2/3-6 分齡。 */
const AGE_YEARS = [0, 6];

const CITY_PATTERN = /^..[縣市]$/;

/**
 * 抓出地址開頭的鄉鎮市區。
 *
 * (?![區鄉鎮市]) 這個否定前瞻是必要的：懶惰量詞碰到「前鎮區信義里」會先配到
 * 「前鎮」（鎮在字元集裡），前瞻逼它退回去多吃一個字才配出「前鎮區」。
 * 同理救回新市區、平鎮區、路竹區、大社區、新社區。
 */
const DISTRICT_PATTERN = /^(.{1,4}?[區鄉鎮市])(?![區鄉鎮市])/;

/** 台灣的地址與電話裡沒有有意義的空白，PDF 換行留下的一律清掉（含 U+00A0）。 */
function squash(value) {
  return value.replace(/\s+/g, '');
}

/**
 * 讀釘住的 TSV。縣市欄只出現在該縣市第一列（PDF 用 rowspan 合併），
 * 其餘留空，必須往下承接，否則整個縣市的資料會沒有歸屬。
 */
function readSource() {
  const text = fs.readFileSync(SOURCE_TSV, 'utf8');
  const rows = [];
  let city = null;

  text.split('\n').forEach((line, index) => {
    if (!line || line.startsWith('#')) return;
    const cells = line.split('\t');
    if (cells[0] === '項次') return;
    if (cells.length !== 7) {
      throw new Error(`${SOURCE_TSV}:${index + 1} 應有 7 欄，實際 ${cells.length} 欄`);
    }
    const [seq, cityCell, areaCell, name, address, phone, established] = cells;
    if (cityCell) city = cityCell;
    if (!city) throw new Error(`${SOURCE_TSV}:${index + 1} 縣市無法承接，第一列缺縣市`);
    rows.push({
      seq: Number(seq),
      city,
      area: areaCell,
      name: name.trim(),
      address: squash(address),
      phone: squash(phone),
      established,
    });
  });

  return rows;
}

/**
 * 決定行政區。以地址為主、區域欄為輔，而不是反過來——
 * 名冊的區域欄有錯（項次 192 寫「北斗鄉」，北斗是鎮），地址欄則沒抓到錯。
 * 地址無法解析的情況只有一種：地址省略了區（如「臺北市木柵路1段177號」、
 * 「新竹市中央路241號」），這時才回頭用區域欄。
 */
function resolveDistrict(row) {
  const tail = row.address.startsWith(row.city) ? row.address.slice(row.city.length) : row.address;
  const matched = DISTRICT_PATTERN.exec(tail);
  if (matched) return matched[1];

  const area = squash(row.area);
  // 區域欄填的是縣市名（澎湖縣那種單列縣市的錯位）時不能當行政區用。
  if (area && !CITY_PATTERN.test(area)) return area;
  return null;
}

function fetchJson(url) {
  const body = execFileSync('curl', ['-sS', '-L', '--max-time', '45', url], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(body);
}

/**
 * 育兒友善園：臺北市獨有、規模小得多的社區據點，和親子館不是同一種服務，
 * 所以另立 id 前綴、另掛 notes，並且不計入 234 筆的驗證。
 */
function readYouyuan() {
  if (process.argv.includes('--skip-youyuan')) {
    console.log('略過育兒友善園（--skip-youyuan）');
    return [];
  }
  const local = process.argv.find((a) => a.startsWith('--youyuan='));
  let payload;
  try {
    payload = local
      ? JSON.parse(fs.readFileSync(local.slice('--youyuan='.length), 'utf8'))
      : fetchJson(TAIPEI_API_URL);
  } catch (error) {
    throw new Error(
      `取得育兒友善園失敗：${error.message}\n` +
        '這 13 筆是補充資料，但靜靜少掉會讓輸出隨網路狀況變動。請改用\n' +
        '  --youyuan=<本機 JSON> 指定已下載的檔案，或 --skip-youyuan 明確捨棄。',
    );
  }

  const rows = (payload.result && payload.result.results) || [];
  // 上游被截斷或改欄位時要爆掉；但館數本來會成長，所以不寫死等於 13。
  if (rows.length < 10) {
    throw new Error(`育兒友善園僅取得 ${rows.length} 筆，遠低於預期（擷取日為 13 筆）`);
  }
  return rows.map((row) => ({
    seq: Number(row['序號']),
    name: (row['機構名稱'] || '').trim(),
    address: squash(row['地址'] || ''),
    phone: squash(row['電話'] || ''),
    kindLabel: (row['機構類型'] || '').trim(),
  }));
}

function main() {
  const rows = readSource();
  console.log(`讀取 ${path.relative(ROOT, SOURCE_TSV)}：${rows.length} 筆`);

  const venues = [];
  const problems = [];

  rows.forEach((row) => {
    const district = resolveDistrict(row);
    if (!district) {
      problems.push(`項次 ${row.seq} ${row.city} 無法決定行政區（區域欄「${row.area}」，地址「${row.address}」）`);
      return;
    }
    const tags = NEEDS_BOOKING_CITIES.has(row.city) ? [...BASE_TAGS, 'needsBooking'] : [...BASE_TAGS];
    venues.push({
      id: `centre-${String(row.seq).padStart(3, '0')}`,
      kind: 'centre',
      name: row.name,
      city: row.city,
      district,
      address: row.address,
      ...(row.phone ? { phone: row.phone } : {}),
      tags,
      ageYears: AGE_YEARS,
      sourceUrl: SFAA_URL,
      verifiedOn: VERIFIED_ON,
    });
  });

  // 各縣市小計必須對上名冊自己公布的數字，錯一筆就停。
  const byCity = {};
  venues.forEach((venue) => {
    byCity[venue.city] = (byCity[venue.city] || 0) + 1;
  });
  Object.keys(EXPECTED_BY_CITY).forEach((city) => {
    if (byCity[city] !== EXPECTED_BY_CITY[city]) {
      problems.push(`${city} 應有 ${EXPECTED_BY_CITY[city]} 筆，實際 ${byCity[city] || 0} 筆`);
    }
  });
  Object.keys(byCity).forEach((city) => {
    if (!(city in EXPECTED_BY_CITY)) problems.push(`出現名冊沒有的縣市「${city}」`);
  });
  if (venues.length !== EXPECTED_TOTAL) {
    problems.push(`親子館總數應為 ${EXPECTED_TOTAL} 筆，實際 ${venues.length} 筆`);
  }

  const youyuan = readYouyuan();
  youyuan.forEach((row) => {
    const district = resolveDistrict({ city: '臺北市', area: '', address: row.address });
    if (!district) {
      problems.push(`育兒友善園 ${row.seq} ${row.name} 無法從地址「${row.address}」決定行政區`);
      return;
    }
    if (row.kindLabel !== '育兒友善園') {
      problems.push(`育兒友善園 ${row.seq} 機構類型為「${row.kindLabel}」，來源可能已混入其他服務`);
      return;
    }
    venues.push({
      id: `youyuan-${String(row.seq).padStart(2, '0')}`,
      kind: 'centre',
      name: row.name,
      city: '臺北市',
      district,
      address: row.address,
      ...(row.phone ? { phone: row.phone } : {}),
      // 育兒友善園沒有教玩具借閱，是社區小型據點，不能套親子館的四個標籤。
      tags: ['free', 'guardianRequired', 'indoor'],
      ageYears: AGE_YEARS,
      sourceUrl: TAIPEI_DATASET_URL,
      verifiedOn: VERIFIED_ON,
      notes: '育兒友善園，非親子館。臺北市獨有的社區小型據點，空間與服務規模都比親子館小，未收錄於社家署全國名冊。',
    });
  });

  // 每一筆的必填欄位都要有值；缺就停，不要讓空白流到畫面上。
  venues.forEach((venue) => {
    ['name', 'city', 'district', 'address', 'sourceUrl', 'verifiedOn'].forEach((field) => {
      if (!venue[field]) problems.push(`${venue.id} 缺 ${field}`);
    });
  });
  const ids = venues.map((venue) => venue.id);
  if (new Set(ids).size !== ids.length) {
    const seen = new Set();
    ids.forEach((id) => {
      if (seen.has(id)) problems.push(`id 重複：${id}`);
      seen.add(id);
    });
  }

  if (problems.length) {
    problems.forEach((problem) => console.error(`  ✗ ${problem}`));
    throw new Error(`驗證未過，共 ${problems.length} 項，未寫出檔案`);
  }

  // 依 id 排序（也就是名冊自己的項次順序，本來就按縣市分組），讓 diff 乾淨。
  venues.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  fs.writeFileSync(OUTPUT, `${JSON.stringify(venues, null, 2)}\n`);

  const width = Math.max(...Object.keys(EXPECTED_BY_CITY).map((c) => c.length));
  console.log('\n各縣市親子館數（左：本次產出，右：名冊公布）');
  Object.keys(EXPECTED_BY_CITY).forEach((city) => {
    const districts = new Set(
      venues.filter((v) => v.city === city && v.id.startsWith('centre-')).map((v) => v.district),
    );
    console.log(
      `  ${city.padEnd(width, '　')}  ${String(byCity[city]).padStart(3)} / ${String(EXPECTED_BY_CITY[city]).padStart(3)}` +
        `   ${districts.size} 個行政區`,
    );
  });
  console.log(`  ${'合計'.padEnd(width, '　')}  ${String(venues.length - youyuan.length).padStart(3)} / ${String(EXPECTED_TOTAL).padStart(3)}`);
  if (youyuan.length) console.log(`  臺北市育兒友善園（另計）  ${youyuan.length} 筆`);
  console.log(
    `\n輸出 ${path.relative(ROOT, OUTPUT)}：${venues.length} 筆，` +
      `${(fs.statSync(OUTPUT).size / 1024).toFixed(0)} KB`,
  );
  console.log(
    '\n提醒：政府資料開放授權條款第 1 版要求顯名標示，' +
      '未依格式標示者視為自始未取得授權。\n' +
      '      UI 必須逐字顯示 CENTRE_DATA_ATTRIBUTION' +
      '（src/littleouting/domain/centreAccess/centreAccess.ts）。',
  );
}

// 標示字串不放在這裡：這是 CommonJS 建置腳本，前端無法 import，
// 兩邊各留一份必然會走鐘。唯一來源是 src/littleouting/domain/centreAccess/centreAccess.ts
// 的 CENTRE_DATA_ATTRIBUTION，那是 UI 真的讀得到的地方。

main();
