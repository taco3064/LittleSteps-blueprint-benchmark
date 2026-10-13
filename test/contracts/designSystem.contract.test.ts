import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * 設計系統的護欄：掃 source，守那些「看起來沒壞、但會慢慢長回來」的約定。
 *
 * 為什麼是掃檔案而不是渲染
 *   這些是詞彙一致性的規則，不是某個元件的行為。統一之前，同一個卡片角色有五種
 *   寫法、同一個陰影有五個 token、同一個容器寬度有五個值；沒有任何單一元件是壞
 *   的，壞的是「每個人各自挑一個」。這種漂移只有窮舉整棵樹才看得到。
 *
 * 每條規則都印出檔名與行號。護欄測試一旦只說「有東西不合規」，下一個人會直接
 * 刪掉它；說得出 `src/x/Y.tsx:42` 才會被修。
 *
 * VenueTag 的標籤與分組窮舉不在這裡：src/domain/restaurants/restaurants.test.ts
 * 已經有「每個 VenueTag 都有標籤，且沒有多出來的鍵」與「恰好切分全部標籤，不重複
 * 也不遺漏」，重寫一份只會變成兩個地方要一起改。
 */

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

/** 這支測試自己會寫出被禁的字串（在 regex 裡），掃 .ts 的規則要跳過自己。 */
const SELF = 'test/contracts/designSystem.contract.test.ts';

/** motion 詞彙的唯一持有者。 */
const MOTION_OWNER = 'src/domain/motion/motion.ts';

interface SourceFile {
  /** 相對於 repo 根目錄，訊息裡用得上。 */
  name: string;
  /** 已把註解換成空白（行號不變）的內容。 */
  code: string;
}

function collect(dir: string, suffixes: string[]): SourceFile[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return collect(full, suffixes);
    }

    if (!suffixes.some((suffix) => entry.name.endsWith(suffix))) {
      return [];
    }

    const raw = fs.readFileSync(full, 'utf8');

    return [
      {
        name: path.relative(ROOT, full).split(path.sep).join('/'),
        code: withoutComments(raw),
      },
    ];
  });
}

/**
 * 把註解換成等量空白，行號因此不動。
 *
 * 必要而不是保險：BabyOasisPage 有一段註解解釋「為什麼是 h-dscreen 而不是
 * h-screen」，SparklineChart 的註解寫著 `#2A7288` 是哪個 token。那些是說明，
 * 不是違規；不先清掉，護欄第一次跑就會誤報。
 */
function withoutComments(source: string): string {
  return (
    source
      .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
      // 排除 `https://`：lookbehind 擋掉前面是 `:` 或 `/` 的斜線對。
      .replace(/(?<![:/])\/\/[^\n]*/g, (line) => ' '.repeat(line.length))
  );
}

const lineOf = (code: string, index: number) =>
  code.slice(0, index).split('\n').length;

/** 每個 match 收成 `檔名:行號: 內容`，失敗訊息就是一份可以直接去修的清單。 */
function offenders(
  files: SourceFile[],
  pattern: RegExp,
  skip: string[] = [],
): string[] {
  const found: string[] = [];

  for (const file of files) {
    if (skip.includes(file.name)) {
      continue;
    }

    for (const match of file.code.matchAll(pattern)) {
      found.push(`${file.name}:${lineOf(file.code, match.index)}: ${match[0]}`);
    }
  }

  return found;
}

/**
 * 抓出每個 `className` 的值，包含 `="…"`、`={'…'}`、`={\`…\`}` 與跨行的三元式：
 * 遇到 `{` 就數到成對的 `}`，所以整段 template literal 都拿得到。
 */
function classNameValues(file: SourceFile): { line: number; value: string }[] {
  const values: { line: number; value: string }[] = [];

  for (const match of file.code.matchAll(/className\s*=\s*/g)) {
    const start = match.index + match[0].length;
    const opener = file.code[start];

    if (opener === '"' || opener === "'") {
      const end = file.code.indexOf(opener, start + 1);

      if (end === -1) {
        continue;
      }

      values.push({
        line: lineOf(file.code, start),
        value: file.code.slice(start + 1, end),
      });

      continue;
    }

    if (opener !== '{') {
      continue;
    }

    let depth = 0;
    let cursor = start;

    for (; cursor < file.code.length; cursor += 1) {
      if (file.code[cursor] === '{') {
        depth += 1;
      } else if (file.code[cursor] === '}') {
        depth -= 1;

        if (depth === 0) {
          break;
        }
      }
    }

    values.push({
      line: lineOf(file.code, start),
      value: file.code.slice(start + 1, cursor),
    });
  }

  return values;
}

/**
 * 開頭標籤自己的那個 `>` 的位置。
 *
 * 屬性裡有 `{...pressable(() => setExpanded(isExpanded ? null : id), isExpanded)}`
 * 這種帶箭頭函式與巢狀大括號的表達式、`className={`…${x}…`}` 這種 template
 * literal，還有像 `label=">"` 的字串；直接 regex 找第一個 `>` 這三種都會切錯。
 * 沿用 classNameValues 的數括號做法，另外跳過字串。
 */
function endOfOpeningTag(code: string, from: number): number {
  let depth = 0;
  let quote: string | null = null;

  for (let cursor = from; cursor < code.length; cursor += 1) {
    const char = code[cursor];

    if (quote) {
      if (char === '\\') {
        cursor += 1;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    } else if (char === '>' && depth === 0) {
      return cursor;
    }
  }

  return code.length;
}

const TSX = collect(SRC, ['.tsx']);
const TS_AND_TSX = collect(SRC, ['.ts', '.tsx']);

/** src/index.css：`.screen` 這個所有頁面共用的外殼就住在這裡。 */
const CSS = collect(SRC, ['.css']);

/**
 * 挖掉 `.h-dscreen` / `.min-h-dscreen` 這兩個 block 的內容（同樣換成等量空白，
 * 行號不動）。
 *
 * 它們的定義本來就必須有一行 `100vh`：那是 pre-`dvh` 瀏覽器的 fallback，後面
 * 緊接著被 `100dvh` 覆蓋。只排除這兩個 block，而不是把 pattern 放寬成「後面沒
 * 有 dvh 就算違規」——放寬 pattern 的話 `.screen` 那種直接寫 `min-h-screen`
 * 的用法也會一起被放過，而那正是要守的東西。
 */
function withoutDscreenFallback(code: string): string {
  return code.replace(/\.(?:min-)?h-dscreen\s*\{[^}]*\}/g, (block) =>
    block.replace(/[^\n]/g, ' '),
  );
}

describe('掃描範圍', () => {
  it('真的掃到整棵 src 樹', () => {
    // cwd 不對或走訪壞掉時，底下每條規則都會「通過」。先在這裡失敗。
    expect(fs.existsSync(SRC), `找不到 ${SRC}`).toBe(true);
    expect(TSX.length, '.tsx 檔數異常，走訪可能壞了').toBeGreaterThan(50);
    expect(TS_AND_TSX.some((file) => file.name === MOTION_OWNER)).toBe(true);
    expect(fs.existsSync(path.join(ROOT, SELF))).toBe(true);
  });

  it('註解被清掉，但程式碼留著', () => {
    const babyOasis = TSX.find(
      (file) => file.name === 'src/containers/BabyOasisPage/BabyOasisPage.tsx',
    );

    expect(babyOasis, '找不到 BabyOasisPage').toBeDefined();
    // 那段註解裡就寫著 h-screen；清不掉的話下面的規則會誤報。
    expect(babyOasis?.code).not.toContain('h-screen: 100vh');
    expect(babyOasis?.code).toContain('h-dscreen');
  });

  it('CSS 也在掃描範圍內，且只挖掉 dscreen 的 fallback', () => {
    const css = CSS.find((file) => file.name === 'src/index.css');

    expect(css, '找不到 src/index.css').toBeDefined();

    // page shell 就住在這裡，規則要真的看得到它。
    expect(css?.code, '抓不到 .screen，CSS 規則會變成永遠通過').toContain(
      '.screen {',
    );

    const stripped = withoutDscreenFallback(css?.code ?? '');

    expect(
      stripped,
      'dscreen 的 100vh fallback 沒被挖掉，CSS 規則會誤報',
    ).not.toContain('100vh');

    expect(stripped, '挖太多了，整個 utilities layer 都不見了').toContain(
      '.row-bleed',
    );

    expect(stripped, '挖太多了，.screen 一起被清掉').toContain('.screen {');
  });

  it('className 抽取器兩種寫法都吃得到', () => {
    // 抽取器安靜地回空陣列時，hex 那條規則就變成永遠通過。實測全樹有
    // 1648 個 className（1379 個引號字串、201 個帶 ${} 的 template），
    // 門檻放寬到只要沒有整批消失就好。
    const values = TSX.flatMap((file) => classNameValues(file));

    expect(values.length, 'className 抽取數量異常').toBeGreaterThan(800);

    expect(
      values.filter(({ value }) => value.includes('${')).length,
      '抓不到帶 ${} 的 className，`{…}` 那條路壞了',
    ).toBeGreaterThan(50);
  });
});

describe('顏色', () => {
  /**
   * className 裡不寫 hex。明列的例外（而不是把 regex 放寬）：
   *
   *  1. SVG presentation attribute：`fill=`/`stroke=`/`color=` 收的是 paint 值，
   *     吃不到 Tailwind class。SparklineChart、GrowthChartDisplay、ReportChart、
   *     ScoreCircle、PoopSummaryCard 因此只能寫色碼，且都在註解裡寫明對應的
   *     token。這些不在 className 裡，本來就落在掃描範圍外。
   *  2. Leaflet 的 divIcon HTML 字串（src/containers/BabyOasisPage/BabyOasisPage.tsx）：
   *     marker 是 Leaflet 用 innerHTML 塞進地圖的，Tailwind 掃不到那段字串也不會
   *     產出對應的 class，只能寫 inline style。這一條由下一個 it 收斂成白名單。
   */
  it('className 裡沒有 hex 色碼', () => {
    const found: string[] = [];

    for (const file of TSX) {
      for (const { line, value } of classNameValues(file)) {
        for (const hex of value.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
          found.push(`${file.name}:${line}: className 含 ${hex[0]}`);
        }
      }
    }

    expect(found).toEqual([]);
  });

  it('只有 BabyOasisPage 的 mapIcons 可以在 HTML 字串裡寫色碼', () => {
    // 白名單要有牙齒：別的地方開始用 innerHTML 拼樣式時，這裡要響。
    const allowed = ['src/containers/BabyOasisPage/mapIcons.tsx'];
    const icons = TSX.find((file) => file.name === allowed[0]);

    expect(icons, '找不到獨立的 Leaflet 圖示來源').toBeDefined();
    expect(icons?.code.match(/html:\s*`[^`]*#[0-9a-fA-F]{3,8}[^`]*`/g))
      .toHaveLength(3);

    // marker 的 HTML 動輒好幾百字元，只留開頭讓失敗訊息還讀得懂。
    const found = offenders(
      TSX,
      /html:\s*`[^`]*#[0-9a-fA-F]{3,8}[^`]*`/g,
      allowed,
    ).map((entry) => `${entry.slice(0, 80)}…`);

    expect(found).toEqual([]);
  });

  it('沒有 text-gray / bg-gray / border-gray', () => {
    // ink 色階取代了它們：純灰在暖底色上偏冷，同一頁會出現兩種「黑」。
    expect(
      offenders(TSX, /(?<![\w-])(?:text|bg|border)-gray-\d{2,3}(?![\w-])/g),
    ).toEqual([]);
  });
});

describe('陰影', () => {
  it('沒有 shadow-lg / shadow-xl / shadow-2xl', () => {
    // 只有 shadow-soft、shadow-soft-lg、shadow-sm 合法。
    // 用 token 邊界比對而不是 includes('-lg')：`shadow-soft-lg` 是合法的，
    // 用字串包含判斷會把它一起打掉。
    expect(
      offenders(TSX, /(?<![\w-])(?:drop-)?shadow-(?:lg|xl|2xl)(?![\w-])/g),
    ).toEqual([]);
  });
});

describe('版面高度', () => {
  it('.tsx 不用 min-h-screen / h-screen', () => {
    // 100vh 把手機瀏覽器的 chrome 也算進去，而那塊 chrome 正蓋在螢幕底部：
    // 定位按鈕與 sheet 把手曾經被壓在它下面。改用 min-h-dscreen / h-dscreen。
    // 註解裡提到這兩個字沒關係（withoutComments 已經清掉）。
    expect(offenders(TSX, /(?<![\w-])(?:min-h|h)-screen(?![\w-])/g)).toEqual([]);
  });

  it('.css 也不用 min-h-screen / h-screen / 100vh', () => {
    // 這條規則原本只掃 .tsx，而 page shell 不住在 .tsx 裡：`.screen` 在
    // src/index.css 用 `@apply min-h-screen`，14 個頁面全部繼承那個 100vh，
    // 每一支 .tsx 卻都是乾淨的——規則要防的 bug 就活在規則的掃描範圍外。
    // 連原始的 `100vh` 一起掃：`.screen` 若繞過 utility 直接寫 CSS 也要紅。
    const files = CSS.map((file) => ({
      ...file,
      code: withoutDscreenFallback(file.code),
    }));

    expect(
      offenders(files, /(?<![\w-])(?:min-h|h)-screen(?![\w-])|\b100vh\b/g),
    ).toEqual([]);
  });
});

/**
 * 標題不能比巢狀在它底下的標題小。
 *
 * h1–h4 的級距寫在 src/index.css 的 @layer base，而且由大到小單調遞減，所以
 * 唯一能把這個順序弄反的辦法就是在某顆標題上補一個 text-* 覆寫。真的發生過：
 * AppBar 的 h1 被壓成 text-lg（18px），BabyOasis 的哺乳室面板卻把 h2 放大到
 * text-xl（20px），於是面板標題比它背後那一頁的頁名還大。
 *
 * 守的是順序，不是像素：級距與門檻都從 index.css 和 Tailwind 自己的 fontSize
 * 讀出來，改字級不會誤報。兩條規則各守一個方向，合起來才是完整的不變式：
 *
 *   下界：AppBar 的 h1 ≥ base 的 h2（頁名不能再往下縮）
 *   上界：任何 h2–h4 ≤ 自己那一級的 base（內容標題不能往上長）
 *   ⇒ AppBar 的 h1 ≥ 它底下畫出來的每一顆標題
 *
 * h1 不在上界那條規則裡：它是一頁最外層的標題，放大不會反轉任何東西——
 * StepsLanding 與 ServiceLanding 的 `sm:text-3xl` 就是這種刻意的放大。
 * 反過來把 h2 縮小（CountyPicker、RadarPage 的 text-sm 眉標）也一樣安全。
 */
describe('字級層級', () => {
  /** Tailwind 預設 fontSize 的 rem 值；tailwind.config.js 沒有覆寫這一組。 */
  const remOf = (token: string): number | null => {
    const entry = (defaultTheme.fontSize as Record<string, unknown>)[token];
    const value = Array.isArray(entry) ? entry[0] : entry;
    const rem = typeof value === 'string' ? /^([\d.]+)rem$/.exec(value) : null;

    return rem ? Number(rem[1]) : null;
  };

  /**
   * index.css 的 @layer base 給 h1–h4 的級距。
   *
   * 讀出來而不是抄一份：抄的那份會跟著級距一起被改，於是規則永遠通過。
   */
  const BASE_REM = new Map<number, number>();
  const indexCss = CSS.find((file) => file.name === 'src/index.css')?.code ?? '';

  for (const block of indexCss.matchAll(/\bh([1-4])\s*\{\s*@apply\s+([^;]*);/g)) {
    const size = /(?<![\w-])text-([\w.]+)(?![\w-])/.exec(block[2]);
    const rem = size ? remOf(size[1]) : null;

    if (rem !== null) {
      BASE_REM.set(Number(block[1]), rem);
    }
  }

  /** 標籤上所有真的是字級的 text-*（text-ink 這種顏色 token 會回 null 被濾掉）。 */
  const sizesOn = (attrs: string): { token: string; rem: number }[] =>
    [...attrs.matchAll(/(?<![\w-])text-([\w.]+)(?![\w-])/g)]
      .map(({ 1: token }) => ({ token, rem: remOf(token) }))
      .filter((size): size is { token: string; rem: number } => size.rem !== null);

  interface Heading {
    file: string;
    line: number;
    level: number;
    /** 開頭標籤自己的屬性段，跨行也吃得到（同 endOfOpeningTag 的用法）。 */
    attrs: string;
  }

  const HEADINGS: Heading[] = TSX.flatMap((file) =>
    [...file.code.matchAll(/<(?:motion\.)?h([1-4])(?=[\s/>])/g)].map((match) => {
      const afterName = match.index + match[0].length;

      return {
        file: file.name,
        line: lineOf(file.code, match.index),
        level: Number(match[1]),
        attrs: file.code.slice(afterName, endOfOpeningTag(file.code, afterName)),
      };
    }),
  );

  const APP_BAR = 'src/containers/AppBar/AppBar.tsx';

  it('級距與標題都真的讀得到', () => {
    // 任何一項落空，下面兩條規則都會安靜地永遠通過。
    expect([...BASE_REM.keys()].sort(), 'index.css 的 h1–h4 級距沒解析出來').toEqual([
      1, 2, 3, 4,
    ]);

    expect(BASE_REM.get(1)).toBeGreaterThan(BASE_REM.get(2) as number);
    expect(HEADINGS.length, '一顆標題都沒掃到，標籤解析壞了').toBeGreaterThan(50);

    expect(
      HEADINGS.some((heading) => heading.file === APP_BAR && heading.level === 1),
      `找不到 ${APP_BAR} 的 h1`,
    ).toBe(true);

    // 眉標那種刻意縮小的 h2/h3 要留在掃描範圍內，規則才有東西可以放行。
    expect(
      HEADINGS.filter(
        (heading) => heading.level >= 2 && sizesOn(heading.attrs).length > 0,
      ).length,
      '帶 text-* 的 h2–h4 一個都沒抓到，覆寫解析壞了',
    ).toBeGreaterThan(3);
  });

  it('AppBar 的 h1 不小於 base 的 h2', () => {
    // 頁名是整頁最外層的標題。它縮到比預設的 h2 還小，底下任何一顆按預設級距
    // 畫出來的 h2 就會反過來壓過它——這是 BabyOasis 面板那個 bug 的另一半。
    const bar = HEADINGS.find(
      (heading) => heading.file === APP_BAR && heading.level === 1,
    );

    const declared = sizesOn(bar?.attrs ?? '');

    // 沒寫覆寫就是 base h1；有的話取最小的那個（窄螢幕看到的就是它）。
    const effective = declared.length
      ? Math.min(...declared.map((size) => size.rem))
      : (BASE_REM.get(1) as number);

    expect(
      effective,
      `AppBar 的 h1 是 ${effective}rem，比 base 的 h2（${BASE_REM.get(2)}rem）小`,
    ).toBeGreaterThanOrEqual(BASE_REM.get(2) as number);
  });

  it('h2–h4 沒有被放大到超過自己那一級的 base', () => {
    const found = HEADINGS.filter((heading) => heading.level >= 2).flatMap(
      (heading) => {
        const base = BASE_REM.get(heading.level) as number;

        return sizesOn(heading.attrs)
          .filter((size) => size.rem > base)
          .map(
            (size) =>
              `${heading.file}:${heading.line}: h${heading.level} 用 text-${size.token}（${size.rem}rem），` +
              `比 base 的 ${base}rem 大`,
          );
      },
    );

    expect(found).toEqual([]);
  });
});

describe('動效詞彙', () => {
  it('沒有本地的 containerVariants / itemVariants', () => {
    // 曾經有六份手抄的 variants，其中一份漏了 duration，那個清單的入場速度
    // 因此和其他五個畫面不一樣。詞彙集中在 src/domain/motion/motion.ts。
    expect(
      offenders(
        TS_AND_TSX,
        /(?<![\w$])(?:containerVariants|itemVariants)(?![\w$])/g,
        [MOTION_OWNER, SELF],
      ),
    ).toEqual([]);
  });

  it('只有 motion.ts 能寫 staggerChildren', () => {
    expect(
      offenders(TS_AND_TSX, /(?<![\w$])staggerChildren(?![\w$])/g, [
        MOTION_OWNER,
        SELF,
      ]),
    ).toEqual([]);
  });
});

/**
 * 可點、但鍵盤到不了的元素。
 *
 * 曾經有五列是只掛 onClick 的 motion.div：wiki 文章卡、睡眠訓練法手風琴、
 * 副食品階段手風琴，以及兩處食物記錄列。滑鼠按得動，鍵盤完全進不去；光是
 * wiki 那一張就擋住三個知識庫共 85 篇文章——看得到，但沒有指標裝置就永遠
 * 打不開。
 *
 * 掃的是 div / li / span / section（含 motion. 版本）。button 與 a 天生就有
 * 鍵盤，不在範圍內；把這些列改成 button 也不是解法，它們裡面有標題、清單與
 * 自己的巢狀按鈕，而 button 不能包互動內容或 heading。
 */
describe('鍵盤可達性', () => {
  interface Clickable {
    file: string;
    line: number;
    attrs: string;
  }

  /** motion. 前綴一定要抓：出事的那五個全都是 motion.div。 */
  const NON_INTERACTIVE = /<(motion\.)?(div|li|span|section)(?=[\s/>])/g;

  const hasAttr = (attrs: string, name: string) =>
    new RegExp(`(?<![\\w$])${name}\\s*=`).test(attrs);

  const spreadsPressable = (attrs: string) =>
    /\{\s*\.\.\.\s*pressable\s*\(/.test(attrs);

  /**
   * modal 遮罩是唯一的例外，而且判準要有牙齒：認得出來的條件是「spread 了
   * motion.ts 的 backdrop」或「class 是 fixed inset-0」，不是一句註解說它是。
   *
   * 它們不走 pressable：點遮罩關閉只是順手，每個 modal 都另外有一顆聚焦得到
   * 的關閉鈕；把整片覆蓋層變成 tabbable，只會在對話框前面多一個沒有意義的
   * tab 停留點。
   */
  const isBackdrop = (attrs: string) =>
    /\{\s*\.\.\.\s*backdrop\s*\}/.test(attrs) ||
    /(?<![\w-])fixed\s+inset-0(?![\w-])/.test(attrs);

  const CLICKABLE: Clickable[] = TSX.flatMap((file) =>
    [...file.code.matchAll(NON_INTERACTIVE)].flatMap((match) => {
      // 屬性段從標籤名之後吃到開頭標籤自己的 `>`，跨行也要吃到底。
      const afterName = match.index + match[0].length;
      const attrs = file.code.slice(afterName, endOfOpeningTag(file.code, afterName));

      // pressable 是 spread 進去的，標籤上不會有字面的 onClick；兩種都要收，
      // 否則五個已經修好的元素會整批掉出掃描範圍，非空檢查就失去意義。
      if (!hasAttr(attrs, 'onClick') && !spreadsPressable(attrs)) {
        return [];
      }

      return [{ file: file.name, line: lineOf(file.code, match.index), attrs }];
    }),
  );

  const at = (tag: Clickable) => `${tag.file}:${tag.line}`;
  const PRESSABLE = CLICKABLE.filter((tag) => spreadsPressable(tag.attrs));

  const BACKDROPS = CLICKABLE.filter(
    (tag) => !spreadsPressable(tag.attrs) && isBackdrop(tag.attrs),
  );

  /**
   * 九片 modal 遮罩，逐一列名。例外要是只寫成一條判斷式，任何人只要在可點的
   * 列上加一個 `fixed inset-0` 就能繞過整條規則；列成白名單，第十片遮罩出現
   * 時得有人來這裡簽名。
   *
   * 第九片是 AccountSheet：登入登出與切換寶寶原本鎖在 LittleSteps 的側邊
   * 抽屜裡，另外四個服務碰不到，所以搬成每個 AppBar 都有的一張 sheet。
   *
   * 只釘檔名不釘行號：行號會被無關的修改推走，那種紅燈只會教人放寬規則。
   */
  const KNOWN_BACKDROPS = [
    'src/containers/AccountSheet/AccountSheet.tsx',
    'src/components/ModalFrame/ModalFrame.tsx',
    'src/components/Sidebar/Sidebar.tsx',
    'src/components/LogEntryModal/LogEntryModal.tsx',
    'src/components/FoodSheet/FoodSheet.tsx',
    'src/components/FoodTrialModal/FoodTrialModal.tsx',
    'src/containers/AddGrowthRecordModal/AddGrowthRecordModal.tsx',
    'src/containers/MilestoneModal/MilestoneModal.tsx',
    'src/containers/VaccineTrackingPage/Sheet.tsx',
  ];

  it('標籤解析真的解得開，沒有整批漏掉', () => {
    // 解析一壞，CLICKABLE 就是空陣列，下面那條規則會安靜地永遠通過。
    expect(CLICKABLE.length, '一個可點的元素都沒掃到，標籤解析壞了').toBeGreaterThan(
      10,
    );

    expect(
      PRESSABLE.length,
      `只掃到 ${PRESSABLE.length} 個 pressable：${PRESSABLE.map(at).join(', ')}`,
    ).toBeGreaterThanOrEqual(5);

    expect(
      BACKDROPS.length,
      `只掃到 ${BACKDROPS.length} 片遮罩：${BACKDROPS.map(at).join(', ')}`,
    ).toBeGreaterThanOrEqual(8);

    // 屬性段要真的跨行吃到底：WikiArticleCard 那個標籤有四行。
    const card = PRESSABLE.find(
      (tag) => tag.file === 'src/components/WikiArticleCard/WikiArticleCard.tsx',
    );

    expect(card, '找不到 WikiArticleCard 的 pressable').toBeDefined();

    expect(card?.attrs, '屬性只吃到第一行，跨行標籤會被判成沒有鍵盤路徑').toContain(
      'className',
    );
  });

  it('遮罩例外就是那八片，一片不多', () => {
    expect([...new Set(BACKDROPS.map((tag) => tag.file))].sort()).toEqual(
      [...KNOWN_BACKDROPS].sort(),
    );
  });

  it('可點的 div / li / span / section 都進得了鍵盤', () => {
    const unreachable = CLICKABLE.filter(
      (tag) =>
        !spreadsPressable(tag.attrs) &&
        !isBackdrop(tag.attrs) &&
        // 自己寫齊 role + tabIndex + onKeyDown，等於手工版的 pressable。
        !(
          hasAttr(tag.attrs, 'role') &&
          hasAttr(tag.attrs, 'tabIndex') &&
          hasAttr(tag.attrs, 'onKeyDown')
        ),
    );

    expect(
      unreachable.map((tag) => `${at(tag)}: onClick 但鍵盤到不了，改用 pressable()`),
    ).toEqual([]);
  });
});
