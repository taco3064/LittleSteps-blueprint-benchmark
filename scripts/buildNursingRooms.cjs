/**
 * 產生 public/data/nursingRooms.json：全國哺集乳室地圖資料。
 *
 * 兩個來源都出自衛生福利部國民健康署，是同一份登記的兩種呈現：
 *
 *   1. 哺集乳室地圖（主幹，含座標）
 *      https://mammy.hpa.gov.tw/Map/AjaxBreastfeedingRoom?county=<縣市>&district=
 *      國健署孕產兒關懷網站上對外公開的地圖所使用的端點，逐縣市查詢，
 *      提供場所名稱、WGS84 經緯度、地址、電話，全國約 3,900 筆，
 *      涵蓋依法應設置與自願設置兩類。
 *      著作權聲明：https://mammy.hpa.gov.tw/Home/CopyRight（需標示來源）
 *
 *   2. 依法應設置哺集乳室公共場所名單（補齊開放時間與注意事項）
 *      政府資料開放平臺 dataset 23750，ODS 檔，約 2,800 筆。
 *      授權：政府資料開放授權條款第 1 版。
 *      這份有開放時間、注意事項、樓層位置，但沒有座標。
 *
 * 為什麼要合併而不是只用其中一份
 *   地圖有座標卻沒有開放時間與注意事項；名單有這些欄位卻沒有座標。實測
 *   99.0%（2805/2833）的名單記錄能對回地圖，所以以地圖為主幹、名單補欄位，
 *   兩邊都不必捨棄。地圖筆數較多的部分是自願設置場所，對要找地方哺乳的
 *   家長一樣有用，且本來就在國健署的公開地圖上。
 *
 * statutory 這個旗標記的是「這一筆出現在名單裡」
 *   地圖同時收依法應設置與自願設置兩類場所，而兩類在地圖上長得一模一樣，
 *   只有名單分得出來。差別對家長是實際的：自願設置的那些有不少是工廠、
 *   科技公司與校園裡的哺集乳室，登記給員工或學生用，外人走不進去。名稱
 *   看起來像公司或學校、又不在名單上，是唯一有來源可依據的判斷方式，所以
 *   即使名單補不了任何欄位，成員資格本身也值得帶進輸出。
 *
 * 為什麼不自行地理編碼
 *   免費的 OSM 系服務無法定位台灣門牌，實測：Nominatim 與 Photon 帶門牌號
 *   查詢 20 筆樣本 0 命中；去掉門牌號只查路名時，以 30 筆已知精確座標的
 *   台北場所比對，誤差中位數 830 公尺、p75 7.2 公里、最大 14 公里（常配到
 *   他區同名道路）。座標因此一律採用國健署自己的定位結果。
 *
 * 設施明細兩個來源都沒有，只有臺北市開放資料曾提供，保存在
 * src/domain/facilities/facilities.json。那是這條管線唯一無法重新取得的
 * 資產，所以進版控；其餘來源隨時可重新下載。
 *
 * 用法
 *   node scripts/buildNursingRooms.cjs
 *   node scripts/buildNursingRooms.cjs --ods=<本機 ODS 路徑>
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FACILITIES = path.join(ROOT, 'src/domain/facilities/facilities.json');
const OUTPUT = path.join(ROOT, 'public/data/nursingRooms.json');
/**
 * 資料集的產生日期與出處，另外寫成一個小檔。
 *
 * nursingRooms.json 本身沒有日期：它是一個 3,852 筆的純陣列，BabyOasis 在執行期
 * 直接 fetch，E2E 也照這個形狀攔截，所以不在它身上包一層。日期放在 src/ 底下
 * 而不是 public/，是為了讓「關於資料」頁和地圖的資料來源標註都能 import 同一份、
 * 永遠寫出同一個查證日期——這正是 mrtStations.json 已經走的路。
 *
 * 少了這個檔，關於頁只能拿 git 的提交日期當查證日期，而那個日期沒有任何測試
 * 看得到。
 */
const META_OUTPUT = path.join(ROOT, 'src/domain/nursingRoomsMeta/nursingRoomsMeta.json');

const MAP_ENDPOINT = 'https://mammy.hpa.gov.tw/Map/AjaxBreastfeedingRoom';
const ODS_URL =
  'https://www.hpa.gov.tw/Pages/ashx/GetFile.ashx?lang=c&type=1&sid=61bc18faca974bd78e36ed1c04d16dc8';

const CITIES = [
  '臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市',
  '基隆市', '新竹市', '新竹縣', '苗栗縣', '彰化縣', '南投縣',
  '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
  '臺東縣', '澎湖縣', '金門縣', '連江縣',
];

/**
 * 用 curl 而非 node:https：mammy.hpa.gov.tw 送出的憑證鏈缺中介憑證，
 * curl 會依 AIA 自行補抓，node 則直接以 UNABLE_TO_VERIFY_LEAF_SIGNATURE 失敗。
 */
function fetchText(url, params) {
  const args = ['-s', '--max-time', '90', '-A', 'Mozilla/5.0', '-L'];
  Object.entries(params || {}).forEach(([key, value]) => {
    args.push('-G', '--data-urlencode', `${key}=${value}`);
  });
  args.push(url);
  return execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function fetchBinary(url, destination) {
  execFileSync('curl', ['-s', '--max-time', '180', '-A', 'Mozilla/5.0', '-L', '-o', destination, url]);
  return destination;
}

/** 地址正規化，只作為比對鍵。統一台/臺、異體字巿、全形括號空白、之與 ~ 的寫法。 */
function normalizeAddress(value) {
  return (value || '')
    .replace(/台/g, '臺')
    .replace(/巿/g, '市')
    .replace(/[（）()\s\u3000]/g, '')
    .replace(/之/g, '-')
    .replace(/[~～]/g, '-')
    .trim();
}

/**
 * 去掉村里段。地圖的地址含村里（臺北市士林區三玉里士東路190號），
 * 名單的地址通常不含，兩邊要對上必須有這個變體。
 */
function withoutVillage(value) {
  return normalizeAddress(value).replace(/^(..[縣市].{1,4}[區鄉鎮市])[^0-9]{1,5}[里村]/, '$1');
}

function normalizeName(value) {
  return (value || '')
    .replace(/台/g, '臺')
    .replace(/[（）()\s\u3000-]/g, '')
    .trim();
}

/**
 * 地圖回傳 { "<序號>_<編號>": "名稱,緯度,經度,<HTML 彈窗>" }，
 * 彈窗裡的地址包在指向 Google Maps 的連結中，電話則是純文字。
 */
function parseMapEntries(city, json) {
  return Object.values(json).flatMap((value) => {
    const parts = String(value).split(',');
    const name = parts[0];
    const latitude = Number(parts[1]);
    const longitude = Number(parts[2]);
    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    if (latitude < 21.5 || latitude > 26.5 || longitude < 118 || longitude > 122.5) return [];

    const address = (String(value).match(/地址:<a[^>]*>([^<]*)<\/a>/) || [])[1];
    if (!address) return [];
    // 電話欄位常內嵌換行（「02-\n28312321轉1565」），壓成單行。
    const phone = ((String(value).match(/電話:([^<]*)/) || [])[1] || '')
      .replace(/\s+/g, '')
      .trim();

    return [{ city, name: name.trim(), address: address.trim(), phone: phone || undefined,
      latitude, longitude }];
  });
}

/** 讀 ODS 單一工作表。空儲存格以 number-columns-repeated 壓縮，必須還原否則整列左移。 */
function readSheet(odsPath, sheetName) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ods-'));
  execFileSync('unzip', ['-q', '-o', odsPath, 'content.xml', '-d', dir]);
  const xml = fs.readFileSync(path.join(dir, 'content.xml'), 'utf8');
  fs.rmSync(dir, { recursive: true, force: true });

  const table = xml.match(
    new RegExp(`<table:table [^>]*table:name="${sheetName}"[^>]*>([\\s\\S]*?)</table:table>`),
  );
  if (!table) throw new Error(`找不到工作表「${sheetName}」`);

  return [...table[1].matchAll(/<table:table-row[^>]*>([\s\S]*?)<\/table:table-row>/g)]
    .map(([, inner]) => {
      const cells = [];
      const re = /<table:table-cell([^>]*?)(\/>|>([\s\S]*?)<\/table:table-cell>)/g;
      let match;
      while ((match = re.exec(inner))) {
        const repeat = (match[1].match(/number-columns-repeated="(\d+)"/) || [])[1];
        const text = (match[3] || '')
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ')
          .trim();
        // 列尾的重複空欄可達數千，夾住上限避免產生巨大陣列。
        for (let i = 0; i < (repeat ? Math.min(+repeat, 50) : 1); i += 1) cells.push(text);
      }
      return cells;
    })
    .filter((cells) => cells.some(Boolean));
}

const ODS_COLUMNS = [
  'name', 'city', 'district', 'village', 'road', 'section',
  'lane', 'number', 'floor', 'phone', 'hours', 'notes',
];

/** 把名單的結構化欄位組回地址，供與地圖比對。 */
function odsAddress(row) {
  const street = row.road
    ? `${row.road}${row.section}${row.lane}${row.number}`
    : `${row.village}${row.lane}${row.number}`;
  return `${row.city}${row.district}${street}`;
}

function readOdsDetails(odsPath) {
  const rows = readSheet(odsPath, '彙整');
  if (rows[0][0] !== '場所名稱' || rows[0][1] !== '縣市') {
    throw new Error(`彙整表欄位與預期不符：${JSON.stringify(rows[0].slice(0, 3))}`);
  }

  const byAddress = new Map();
  const byCityName = new Map();
  // 名單成員資格要逐列記下，包含樓層／開放時間／注意事項全空的那些列：
  // 那幾列補不了欄位，但它們在名單上這件事本身就是資訊。
  const statutoryAddresses = new Set();
  const statutoryNames = new Set();
  rows.slice(1).forEach((cells) => {
    const row = {};
    ODS_COLUMNS.forEach((field, i) => {
      row[field] = (cells[i] || '').trim();
    });
    row.city = row.city.replace(/台/g, '臺').replace(/巿/g, '市');
    if (!row.name || !/[縣市]$/.test(row.city)) return;

    const address = odsAddress(row);
    const withVillage = `${row.city}${row.district}${row.village}${row.road}${row.section}${row.lane}${row.number}`;
    statutoryAddresses.add(normalizeAddress(address));
    statutoryAddresses.add(withoutVillage(address));
    statutoryAddresses.add(normalizeAddress(withVillage));
    statutoryNames.add(`${row.city}|${normalizeName(row.name)}`);

    const detail = {
      floor: row.floor || undefined,
      openingHours: row.hours || undefined,
      remarks: row.notes || undefined,
    };
    if (!detail.floor && !detail.openingHours && !detail.remarks) return;

    byAddress.set(normalizeAddress(address), detail);
    byAddress.set(withoutVillage(address), detail);
    byAddress.set(normalizeAddress(withVillage), detail);
    byCityName.set(`${row.city}|${normalizeName(row.name)}`, detail);
  });

  return { byAddress, byCityName, statutoryAddresses, statutoryNames };
}

function main() {
  console.log('讀取國健署哺集乳室地圖…');
  const rooms = [];
  CITIES.forEach((city) => {
    const body = fetchText(MAP_ENDPOINT, { county: city, district: '' });
    let json;
    try {
      json = JSON.parse(body);
    } catch {
      throw new Error(`${city} 回應非 JSON，端點可能已變更`);
    }
    const entries = parseMapEntries(city, json);
    rooms.push(...entries);
    process.stdout.write(`  ${city} ${entries.length}\n`);
  });
  if (rooms.length < 3000) {
    throw new Error(`地圖僅取得 ${rooms.length} 筆，遠低於預期，中止以免產出殘缺資料`);
  }

  const odsArg = process.argv.find((a) => a.startsWith('--ods='));
  const odsPath = odsArg
    ? odsArg.slice('--ods='.length)
    : fetchBinary(ODS_URL, path.join(os.tmpdir(), 'hpa-nursing-rooms.ods'));
  console.log('讀取依法應設置名單，補開放時間與注意事項…');
  const details = readOdsDetails(odsPath);
  const facilities = JSON.parse(fs.readFileSync(FACILITIES, 'utf8'));

  const seen = new Set();
  const output = [];
  let withDetail = 0;
  let withFacilities = 0;
  let statutoryCount = 0;

  rooms.forEach((room) => {
    const key = `${normalizeName(room.name)}@${normalizeAddress(room.address)}`;
    if (seen.has(key)) return;
    seen.add(key);

    const detail =
      details.byAddress.get(normalizeAddress(room.address)) ||
      details.byAddress.get(withoutVillage(room.address)) ||
      details.byCityName.get(`${room.city}|${normalizeName(room.name)}`);
    if (detail) withDetail += 1;

    // 和補欄位一樣的三段回退：先比正規化地址，再比去掉村里的地址，
    // 最後才用縣市加名稱——名單的地址寫法與地圖不一致的那些筆靠這一段對上。
    const statutory =
      details.statutoryAddresses.has(normalizeAddress(room.address)) ||
      details.statutoryAddresses.has(withoutVillage(room.address)) ||
      details.statutoryNames.has(`${room.city}|${normalizeName(room.name)}`);
    if (statutory) statutoryCount += 1;

    const facility =
      facilities[normalizeAddress(room.address)] || facilities[withoutVillage(room.address)];
    if (facility) withFacilities += 1;

    const district = (room.address.match(/^..[縣市](.{1,4}?[區鄉鎮市])/) || [])[1];
    output.push({
      id: `hpa-${output.length + 1}`,
      name: room.name,
      address: room.address,
      city: room.city,
      ...(district ? { district } : {}),
      ...(statutory ? { statutory: true } : {}),
      ...(detail && detail.floor ? { floor: detail.floor } : {}),
      latitude: +room.latitude.toFixed(7),
      longitude: +room.longitude.toFixed(7),
      ...(facility ? { facilities: facility } : {}),
      ...(detail && detail.openingHours ? { openingHours: detail.openingHours } : {}),
      ...(room.phone ? { phone: room.phone } : {}),
      ...(detail && detail.remarks ? { remarks: detail.remarks } : {}),
    });
  });

  fs.writeFileSync(OUTPUT, JSON.stringify(output));

  // 查證日期取本地日期，不取 UTC：台灣早上八點前跑這支腳本，toISOString()
  // 會給前一天，dataSources.test.ts 那條「不在未來」的檢查反而擋不到它。
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  const meta = {
    generatedAt: now.toISOString(),
    verifiedOn: localDate,
    source: '衛生福利部國民健康署 哺集乳室地圖、依法應設置哺集乳室公共場所名單',
    sourceUrls: [MAP_ENDPOINT, ODS_URL, 'https://data.gov.tw/dataset/23750'],
    license: '政府資料開放授權條款第 1 版；地圖資料依 https://mammy.hpa.gov.tw/Home/CopyRight 標示來源',
    count: output.length,
    statutoryCount,
  };
  fs.writeFileSync(META_OUTPUT, `${JSON.stringify(meta, null, 2)}\n`);

  const byCity = {};
  output.forEach((r) => {
    byCity[r.city] = (byCity[r.city] || 0) + 1;
  });
  console.log(`\n輸出 ${output.length} 筆，涵蓋 ${Object.keys(byCity).length} 縣市`);
  console.log(`  有開放時間或注意事項 ${withDetail} 筆，有設施明細 ${withFacilities} 筆`);
  console.log(`  在依法應設置名單上 ${statutoryCount} 筆`);
  console.log(`  ${path.relative(ROOT, OUTPUT)} ${(fs.statSync(OUTPUT).size / 1024).toFixed(0)} KB`);
  console.log(`  ${path.relative(ROOT, META_OUTPUT)} 查證日期 ${meta.verifiedOn}`);
}

main();
