import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms/index';
import { prenatalCheckupSchedule } from '~app/knowledge/domain/prenatalCheckups';
import { toddlerWikiArticles } from '~app/knowledge/domain/toddlerWiki';
import type { RadarData } from '~app/littleguard/domain/radarModels/index';
import type { Venue } from '~app/littleouting/domain/venueModels/index';

/**
 * 首頁文案裡的數字，對得上真正的資料。
 *
 * 為什麼需要一支測試看著文案
 *   ServiceLanding 寫著「44 篇」的時候，幼兒百科早就長到 45 篇了。同一種漂移
 *   在這個 repo 至少發生三次：routePolicy.test.ts 的頁面清單在第五個服務上線
 *   那一刻就過期，HubLanding.test.tsx 列了四個服務而畫面上有五個。資料會長，
 *   文案不會自己跟上。
 *
 *   這些數字不是裝飾。「全台 234 間親子館」「3,852 處哺乳室」是在告訴家長這
 *   份資料有多完整，是願不願意用下去的依據；數字一旦和實際資料對不上，壞掉的
 *   是信任，而畫面上完全看不出來。
 *
 * 為什麼是從 source 讀文案，而不是渲染頁面再比對
 *   要守的方向是「資料變了、文案沒跟上」。把句子抄進測試等於再多一份會過期的
 *   副本；從 source 抓出數字、拿真資料算出應該是多少，資料一動測試就紅在正確
 *   的地方。
 *
 * 兩個放在別處的判斷
 *   逐筆資料的正確性不歸這裡：親子館的縣市館數在
 *   src/littleouting/data/familyCentres.test.ts、哺乳室的座標與欄位在
 *   src/babyoasis/data/nursingRooms.test.ts、公費產檢的次數與週數在
 *   src/littlebloom/data/prenatalCheckups.test.ts。這支只管文案與那些資料
 *   之間的那一步。
 *
 *   檔案位置選在 src/common/landing/：文案的兩個來源
 *   （ServiceLanding.tsx、HubLanding.tsx）就住在這裡，但這條規則橫跨兩支元件，
 *   塞進其中任何一支的 render 測試都會變成放錯地方。
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..', '..');

/**
 * public/ 底下的 JSON 不像 src/ 的資料可以直接 import，只能從檔案系統讀。
 * 用 fileURLToPath 轉成字串路徑而不是 `readFileSync(new URL(…))`：
 * happy-dom 覆寫了全域 URL，Node 的 fs 不吃它——routePolicy.test.ts 踩過同一個坑。
 */
const readJson = <T>(...segments: string[]): T =>
  JSON.parse(readFileSync(join(ROOT, ...segments), 'utf8'));

const venues = readJson<Venue[]>('public', 'data', 'familyCentres.json');
const rooms = readJson<NursingRoom[]>('public', 'data', 'nursingRooms.json');
const radar = readJson<RadarData>('public', 'data', 'diseaseRadar.json');

/**
 * 親子館與育兒友善園是兩份來源、兩種 id 前綴，同住一個檔案。
 * 文案講的「親子館」只有 centre- 那一批。
 */
const centres = venues.filter((venue) => venue.id.startsWith('centre-'));
const roomCities = new Set(rooms.map((room) => room.city));

const publicCheckups = prenatalCheckupSchedule.filter(
  (item) => item.kind === 'checkup',
);

/**
 * 迷你走勢圖回顧幾週。每個 cell 都一樣長，收成 Set 是為了在長度不齊時
 * 讓下面那條直接紅——拿第一個 cell 當代表的話，不齊會被靜靜吃掉。
 */
const radarSparkWeeks = new Set(
  Object.values(radar.counties).flatMap((bands) =>
    Object.values(bands).flatMap((cells) =>
      Object.values(cells).map((cell) => cell.spark.length),
    ),
  ),
);

/** 中文數字寫的量詞，`六種` 的 `六`。文案只會用到個位數。 */
const CHINESE_DIGITS = [...'零一二三四五六七八九'];

interface CopyLine {
  file: string;
  line: number;
  text: string;
}

/**
 * 從 source 抓出使用者真的看得到的句子：帶中日韓文字的字串常值。
 *
 * 以中文字當判準，是為了把 className、hash 路由與 icon 名稱擋在外面——那些
 * 字串裡也有數字（`grid-cols-2`、`gap-4`），一起收進來的話下面的窮舉檢查會被
 * 淹沒到沒有意義。
 */
function copyOf(file: string): CopyLine[] {
  const source = readFileSync(join(ROOT, file), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(?<![:/])\/\/[^\n]*/g, (line) => ' '.repeat(line.length));

  const strings
    = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;

  return [...source.matchAll(strings)].flatMap((match) => {
    const text = match[1] ?? match[2] ?? match[3];

    if (!/[\u3400-\u9fff]/.test(text)) {
      return [];
    }

    return [
      { file, line: source.slice(0, match.index).split('\n').length, text },
    ];
  });
}

const SERVICE_LANDING = copyOf(
  'src/portal/components/ServiceLanding/ServiceLanding.tsx',
);

const HUB_LANDING = copyOf('src/portal/components/HubLanding/HubLanding.tsx');

/**
 * 文案裡「數字 + 單位」寫的那個數字，`3,852 處` 的千分位一起吃掉。
 *
 * 回傳陣列而不是單一值：數量對了還不夠，還要確定這個說法在頁面上只出現一次。
 * 同一個數字被抄到第二個地方，就是下一次漂移的起點。
 */
function claimed(copy: CopyLine[], unit: string): number[] {
  const pattern = new RegExp(`([\\d,]+)\\s*${unit}`, 'g');

  return copy.flatMap((entry) =>
    [...entry.text.matchAll(pattern)].map((match) =>
      Number(match[1].replace(/,/g, '')),
    ),
  );
}

describe('首頁文案的數字', () => {
  it('掃得到文案，而且抓得出裡面的數字', () => {
    // 抽取器安靜地回空陣列時，下面每一條都會變成永遠通過。
    expect(
      SERVICE_LANDING.length,
      '讀不到 ServiceLanding 的文案',
    ).toBeGreaterThan(5);

    expect(HUB_LANDING.length, '讀不到 HubLanding 的文案').toBeGreaterThan(10);

    expect(
      [...SERVICE_LANDING, ...HUB_LANDING].filter((entry) =>
        /\d/.test(entry.text),
      ).length,
      '一句帶數字的文案都沒抓到，抽取器壞了',
    ).toBeGreaterThanOrEqual(9);
  });

  it('幼兒百科的篇數就是真的篇數', () => {
    // 這裡曾經是 44，資料已經是 45。
    expect(claimed(SERVICE_LANDING, '篇')).toEqual([
      toddlerWikiArticles.length,
    ]);
  });

  it('親子館的間數就是 centre- 那一批的筆數', () => {
    expect(claimed(HUB_LANDING, '間親子館')).toEqual([centres.length]);
  });

  it('哺乳室的處數與縣市數就是 nursingRooms.json 裡的數字', () => {
    expect(claimed(HUB_LANDING, '處')).toEqual([rooms.length]);
    expect(claimed(HUB_LANDING, '縣市')).toEqual([roomCities.size]);
  });

  it('公費產檢的次數就是排程裡 checkup 的筆數', () => {
    expect(claimed(HUB_LANDING, '次公費產檢')).toEqual([publicCheckups.length]);
  });

  it('疫情雷達的病種數與回顧週數就是 diseaseRadar.json 裡的數字', () => {
    // 「六種」是中文數字，claimed() 的阿拉伯數字比對抓不到，這裡自己轉一次；
    // 六個病種是 spec 訂死的清單，改資料卻沒改文案時要在這裡紅。
    const diseaseCounts = HUB_LANDING.flatMap((entry) =>
      [...entry.text.matchAll(/([零一二三四五六七八九])種/g)].map((match) =>
        CHINESE_DIGITS.indexOf(match[1]),
      ),
    );

    expect(diseaseCounts).toEqual([radar.diseases.length]);

    expect([...radarSparkWeeks], '各 cell 的 spark 長度不一致').toHaveLength(1);
    expect(claimed(HUB_LANDING, '週比')).toEqual([...radarSparkWeeks]);
  });
});

/**
 * 每一個出現在文案裡的數字，都要有交代。
 *
 * 只釘住現在知道的那五個數字，等於默許第六個數字被寫進去而沒有人比對過；
 * 上一次的 44 就是這樣長出來的。這條規則反過來要求：文案裡的每個數字，
 * 不是上面某條規則對過的，就是列在下面並寫明為什麼不能對。
 */
describe('文案裡沒有第三種數字', () => {
  /** 上面已經逐條對過資料的說法。 */
  const CHECKED_ABOVE = [
    '45 篇',
    '234 間親子館',
    '3,852 處',
    '22 縣市',
    '14 次公費產檢',
    '8 週',
  ];

  /**
   * 不是數量、因此沒有資料可以對的數字。每一條都要寫得出理由；
   * 寫不出來就表示它其實是個數量，該加一條規則而不是加進這裡。
   */
  const NOT_A_COUNT: Record<string, string> = {
    '1 到 3 歲': '服務年齡範圍，是產品定義不是資料筆數',
    '1-3 歲': '同上，卡片與旅程時間軸的短寫法',
    '12-36 個月':
      'LittleExplorer 的方案邊界（ageBands 的 TODDLER_MIN_MONTHS / TODDLER_MAX_MONTHS），'
      + '是常數不是可以數的資料列；拿它去對任何 JSON 都只會是重寫一次同一個常數',
    '0-40 週': '孕期長度，是生理事實',
    '0-12 月': '新生兒期的範圍定義',
  };

  it('每個數字不是對過資料，就是寫明了為什麼不能對', () => {
    const accounted = [...CHECKED_ABOVE, ...Object.keys(NOT_A_COUNT)];

    const unaccounted = [...SERVICE_LANDING, ...HUB_LANDING].flatMap(
      (entry) => {
        const rest = accounted.reduce(
          (text, phrase) => text.split(phrase).join(''),
          entry.text,
        );

        return [...rest.matchAll(/\d[\d,]*/g)].map(
          (match) =>
            `${entry.file}:${entry.line}: 「${match[0]}」沒有出處——`
            + `加一條對資料的規則，或列進 NOT_A_COUNT 並寫明理由`,
        );
      },
    );

    expect(unaccounted).toEqual([]);
  });

  it('交代清單本身沒有過期的條目', () => {
    // 文案改寫之後留在清單裡的死條目，會讓上面那條窮舉少擋一個數字。
    const allCopy = [...SERVICE_LANDING, ...HUB_LANDING]
      .map((entry) => entry.text)
      .join('\n');

    const stale = [...CHECKED_ABOVE, ...Object.keys(NOT_A_COUNT)].filter(
      (phrase) => !allCopy.includes(phrase),
    );

    expect(stale).toEqual([]);
  });
});
