import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { SERVICE_ORDER, SERVICE_THEME } from './serviceTheme';
import type { ServiceId, ServiceTheme } from './serviceTheme';

/**
 * 對比度是這個 palette 唯一不能靠肉眼守的約定，所以這裡是「量」出來的。
 *
 * 為什麼不信註解裡的數字
 *   tailwind.config.js 每個文字色階旁邊都寫著量到的對比度，但那是某一次手算的
 *   結果。色碼一改，註解不會跟著改。所以這支測試動態 import 真正的 config，
 *   把 class 名稱（`text-bloom-stone-ink`、`bg-primary-dark`）解析回色碼，再用
 *   WCAG 2.x 的公式重算。改色階會紅，改 class 名稱也會紅（解析不到就丟錯）。
 *
 * 為什麼這件事值得一支測試
 *   統一設計系統之前，全 app 的白字淺色 CTA 都在 1.87–2.02:1，LittleBloom 的
 *   標題色是 1.80:1（`bloom-stone` #C9C0B5）。那不是「有點淺」，是戶外看不見。
 *   規則因此拆成兩層：DEFAULT 色階只當填色（~2:1），只有 `-dark`/`-ink`/`-deep`
 *   可以承載文字或當白字的底。目前沒有任何機制阻止它退回去，除了這支測試。
 *
 * 門檻取捨（實測值寫在各測試裡）
 *   `ink` 對白色與對自己的 pageBg 都用 4.5:1。白色是 `.card`/`.panel` 與 AppBar
 *   的底，pageBg 是頁面級大標題的底——同一個色階要在兩個表面上都讀得到。這裡
 *   曾對 pageBg 放寬到 WCAG 大字級的 3:1，因為有兩個色階是照「對白色 4.5」調
 *   的，落在自己的 pageBg 上只剩 4.19 與 4.38；色階已重調，門檻收回 4.5。
 */

type PaletteEntry = string | Record<string, string | undefined>;
type Palette = Record<string, PaletteEntry | undefined>;

const WHITE = '#FFFFFF';

/** Tailwind 內建色，不在 config 的 extend.colors 裡。 */
const BUILT_IN: Record<string, string | undefined> = {
  white: WHITE,
  black: '#000000',
};

/**
 * 直接讀真正的 palette，而不是在測試裡抄一份色碼。
 *
 * 靜態 import 在這裡不可行：tailwind.config.js 沒有型別宣告也不在 tsconfig 的
 * include 裡，字面值 specifier 會讓 tsc 報找不到模組。用變數當 specifier 讓
 * TypeScript 放手，執行期則由 Vite 依這支檔案的位置解析。
 */
const CONFIG_SPECIFIER = '../../../tailwind.config.js';

const config = (await import(CONFIG_SPECIFIER)) as {
  default: { theme: { extend: { colors: Palette } } };
};

const COLORS: Palette = config.default.theme.extend.colors;

interface Paint {
  hex: string;
  /** `/70` 這類透明度修飾詞，0-1。 */
  alpha: number;
}

const UTILITY_PREFIXES = ['text-', 'bg-', 'border-', 'ring-', 'from-', 'to-', 'via-'];

/**
 * 把色碼從 palette 裡挖出來。config 混用兩種形狀：巢狀物件帶 DEFAULT
 * （`primary.dark`、`primary` → DEFAULT）與扁平的連字號鍵
 * （`bloom['dusty-rose-ink']`）。從最長的前綴往回試，兩種都吃得到。
 */
function lookup(token: string): string | undefined {
  const builtIn = BUILT_IN[token];

  if (builtIn) {
    return builtIn;
  }

  const parts = token.split('-');

  for (let cut = parts.length; cut > 0; cut -= 1) {
    const group = COLORS[parts.slice(0, cut).join('-')];

    if (group === undefined) {
      continue;
    }

    const rest = parts.slice(cut).join('-');

    if (typeof group === 'string') {
      if (rest === '') {
        return group;
      }

      continue;
    }

    const value = group[rest === '' ? 'DEFAULT' : rest];

    if (typeof value === 'string') {
      return value;
    }
  }

  return undefined;
}

/**
 * `text-bloom-stone-ink/70` → { hex: '#6E655C', alpha: 0.7 }。
 *
 * 解析不到就丟錯，不回退成白色：一個解析不到的 token 本身就是 bug（class 打錯
 * 名字在 Tailwind 裡是靜默失效，字會變成瀏覽器預設色），而且靜默回退會讓底下
 * 每一條對比度斷言都變成假的。
 */
function resolve(className: string): Paint {
  const prefix = UTILITY_PREFIXES.find((candidate) =>
    className.startsWith(candidate),
  );

  if (prefix === undefined) {
    throw new Error(
      `無法解析色彩 class「${className}」：缺少 text-/bg-/border- 前綴`,
    );
  }

  const [token, alphaText] = className.slice(prefix.length).split('/');
  const hex = lookup(token);

  if (hex === undefined) {
    throw new Error(`無法解析色彩 class「${className}」：palette 裡沒有「${token}」`);
  }

  if (alphaText === undefined) {
    return { hex, alpha: 1 };
  }

  const alpha = Number(alphaText) / 100;

  if (!Number.isFinite(alpha) || alpha <= 0 || alpha > 1) {
    throw new Error(
      `無法解析色彩 class「${className}」：透明度「${alphaText}」不合法`,
    );
  }

  return { hex, alpha };
}

function channels(hex: string): number[] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);

  if (match === null) {
    throw new Error(`不是六位十六進位色碼：${hex}`);
  }

  const value = Number.parseInt(match[1], 16);

  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff].map(
    (c) => c / 255,
  );
}

/** WCAG 2.x 相對亮度。 */
function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x 對比度，兩個都必須是不透明色碼。 */
function ratio(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (high + 0.05) / (low + 0.05);
}

/** 帶透明度的前景實際渲染出來的顏色：把它壓在不透明的底色上。 */
function flatten(paint: Paint, backdrop: string): string {
  if (paint.alpha === 1) {
    return paint.hex;
  }

  const fg = channels(paint.hex);
  const bg = channels(backdrop);

  return `#${fg
    .map((c, i) => Math.round((c * paint.alpha + bg[i] * (1 - paint.alpha)) * 255))
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** class 對 class 的實際對比度。 */
function contrast(foreground: string, background: string): number {
  const bg = flatten(resolve(background), WHITE);

  return ratio(flatten(resolve(foreground), bg), bg);
}

/** class 去掉 utility 前綴與透明度後的色彩 token，用來比對「同一個顏色」。 */
function colorToken(className: string): string {
  const prefix
    = UTILITY_PREFIXES.find((candidate) => className.startsWith(candidate)) ?? '';

  return className.slice(prefix.length).split('/')[0];
}

const SERVICES = Object.entries(SERVICE_THEME) as [ServiceId, ServiceTheme][];

describe('色彩 class 解析', () => {
  it('解析不到的 token 會丟錯，不會靜默當成白色', () => {
    expect(() => resolve('text-not-a-real-token')).toThrow(/palette 裡沒有/);
    expect(() => resolve('bloom-cream')).toThrow(/缺少 text-/);
  });

  it('兩種 palette 形狀都解析得到', () => {
    // 比對「解析路徑」而不是釘住色碼：調色不該讓這條假性失敗，但走錯一層
    // （例如把 `primary-dark` 解成 `primary.DEFAULT`）就要紅。
    const primary = COLORS.primary as Record<string, string>;
    const bloom = COLORS.bloom as Record<string, string>;

    // 巢狀物件：省略後綴走 DEFAULT，有後綴走那個 key。
    expect(resolve('bg-primary')).toEqual({ hex: primary.DEFAULT, alpha: 1 });
    expect(resolve('text-primary-dark').hex).toBe(primary.dark);

    // 扁平的連字號 key，外加透明度修飾詞。
    expect(resolve('text-bloom-stone-ink/70')).toEqual({
      hex: bloom['stone-ink'],
      alpha: 0.7,
    });

    // 群組名本身就帶連字號（warm-white）。
    expect(resolve('bg-warm-white').hex).toBe(
      (COLORS.warm as Record<string, string>).white,
    );

    // 內建色不在 config 裡。
    expect(resolve('text-white').hex).toBe('#FFFFFF');
  });
});

describe('SERVICE_THEME 對比度', () => {
  it('每個服務的 ink 在白色表面上 ≥4.5:1', () => {
    // 白色是 ink 真正的底：`.card`/`.panel` 是 bg-white，AppBar 是 bg-white/90，
    // ServiceLanding 的標題在 `.panel` 裡。改壞 `-dark`/`-ink` 色階這裡先紅。
    for (const [id, theme] of SERVICES) {
      const value = contrast(theme.ink, 'bg-white');

      expect(
        value,
        `${id} ink ${theme.ink} 在白色上只有 ${value.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('每個服務的 ink 直接落在自己的 pageBg 上時 ≥4.5:1', () => {
    // 落在 pageBg 上的 ink 只有頁面級大標題（h1 24px bold），WCAG 大字級門檻是
    // 3:1，但這裡收到 4.5：app 的底色從來不是純白，所以「對白色 4.5」調出來的
    // 色階落在自己的 pageBg 上會掉下去——`bloom-dusty-rose-ink` 曾是 4.19
    // （#8E6A6A on #F5F0E8）、`secondary-dark` 曾是 4.38（#2F7F9C on #FDFBF7）。
    // 兩個色階都已照真正的 pageBg（而不是純白）重新調深，六個服務現在的實測是
    // littlebloom 4.87、littlesteps 4.92、littleouting 4.98、babyoasis 5.26、
    // littleexplorer 5.38、littleguard 5.48，所以不再需要分成兩個門檻。
    for (const [id, theme] of SERVICES) {
      const value = contrast(theme.ink, theme.pageBg);

      expect(
        value,
        `${id} ink ${theme.ink} 在 ${theme.pageBg} 上只有 ${value.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('fill 與 fillText 這一組 ≥4.5:1', () => {
    // 就是這一組以前全錯：白字壓在 2:1 的 DEFAULT 填色上。
    // LittleExplorer 是刻意的例外，反過來走——亮琥珀底配深墨字（6.31:1）。
    // 要讓白字在黃色上到 4.5:1，底色得深到不再是黃色，品牌色就沒了。
    for (const [id, theme] of SERVICES) {
      const value = contrast(theme.fillText, theme.fill);

      expect(
        value,
        `${id} ${theme.fillText} on ${theme.fill} 只有 ${value.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('body 在白色與自己的 pageBg 上都 ≥4.5:1', () => {
    for (const [id, theme] of SERVICES) {
      const onPage = contrast(theme.body, theme.pageBg);
      const onWhite = contrast(theme.body, 'bg-white');

      expect(
        onPage,
        `${id} body ${theme.body} 在 ${theme.pageBg} 上只有 ${onPage.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);

      expect(
        onWhite,
        `${id} body ${theme.body} 在白色上只有 ${onWhite.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('muted 是次要文案，門檻 3:1', () => {
    // muted 出現的地方是 AppBar 副標、panel 裡的說明字，底色都是白。
    // 實測 littlebloom 的 muted（`text-bloom-stone-ink/80`）是白底 3.69:1、
    // 自己的 cream pageBg 上 3.38:1。`/70` 在 cream 上只有 2.81:1（破 3:1
    // 地板），所以透明度是 /80 而不是 /70。
    for (const [id, theme] of SERVICES) {
      const value = contrast(theme.muted, 'bg-white');

      expect(
        value,
        `${id} muted ${theme.muted} 在白色上只有 ${value.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('accent 是填色，拿不到文字的位置', () => {
    // accent 允許跟 fill 同一個色（LittleExplorer 就是），但絕不能出現在
    // ink/body/muted：那等於把 ~2:1 的填色當字用，也就是修掉的那個 bug。
    for (const [id, theme] of SERVICES) {
      const accent = colorToken(theme.accent);

      for (const role of ['ink', 'body', 'muted'] as const) {
        expect(
          colorToken(theme[role]),
          `${id} 把 accent 色 ${accent} 當成 ${role} 用`,
        ).not.toBe(accent);
      }
    }
  });

  it('每個服務的 accent 是不同顏色', () => {
    // hub 上六張卡片並排，兩張同色就讀成同一個服務。
    const byHex = new Map<string, ServiceId>();

    for (const [id, theme] of SERVICES) {
      const { hex } = resolve(theme.accent);
      const clash = byHex.get(hex);

      expect(clash, `${id} 與 ${clash} 的 accent 同為 ${hex}`).toBeUndefined();
      byHex.set(hex, id);
    }

    expect(byHex.size).toBe(SERVICES.length);
  });
});

describe('SERVICE_THEME 完整性', () => {
  it('SERVICE_ORDER 不重不漏地涵蓋每個服務', () => {
    // 加進 SERVICE_THEME 卻忘了排進 SERVICE_ORDER，那個服務會從 hub 上消失。
    expect([...SERVICE_ORDER].sort()).toEqual(Object.keys(SERVICE_THEME).sort());

    expect(new Set(SERVICE_ORDER).size, 'SERVICE_ORDER 有重複').toBe(
      SERVICE_ORDER.length,
    );
  });

  it('每個 theme 的 id 與它的鍵一致', () => {
    for (const [id, theme] of SERVICES) {
      expect(theme.id).toBe(id);
    }
  });

  it('每個服務的 icon 都渲染得出 svg，且六個服務不共用同一個 icon', () => {
    const seen = new Map<unknown, ServiceId>();

    for (const [id, theme] of SERVICES) {
      const { container, unmount } = render(
        createElement(theme.icon, { 'aria-hidden': true }),
      );

      expect(
        container.querySelector('svg'),
        `${id} 的 icon 渲染不出 svg`,
      ).not.toBeNull();

      unmount();

      const clash = seen.get(theme.icon);

      expect(clash, `${id} 與 ${clash} 共用同一個識別 icon`).toBeUndefined();
      seen.set(theme.icon, id);
    }
  });

  // 清單由測試自持、不從實作 import：把 icon 換成警示圖形的同時又把它從清單刪掉
  // 也會過的測試，等於沒有守。只針對 littleguard 斷言——「提醒而不是驚嚇」是這個
  // 服務的規格約束，其他五個服務不該被這裡順手加上新規則。
  it('疫情雷達的識別 icon 不是警示類圖形', () => {
    const ALARM_ICONS = [
      'ShieldAlert',
      'AlertTriangle',
      'TriangleAlert',
      'AlertCircle',
      'CircleAlert',
      'AlertOctagon',
      'OctagonAlert',
      'Siren',
      'BellRing',
    ];

    const { displayName } = SERVICE_THEME.littleguard.icon as {
      displayName?: string;
    };

    // 沒有 displayName 的話，下面那條斷言永遠不會命中，測試就變成擺設。
    expect(
      displayName,
      'lucide icon 沒有 displayName，這個測試守不到東西',
    ).toBeTruthy();

    expect(
      ALARM_ICONS,
      `疫情雷達的 icon 是 ${displayName}：圖形裡的驚嘆號違反「提醒而不是驚嚇」`,
    ).not.toContain(displayName);
  });

  it('每個服務都有非空的 name 與 role', () => {
    for (const [id, theme] of SERVICES) {
      expect(theme.name.trim(), `${id} name`).toBe(theme.name);
      expect(theme.name.length, `${id} name`).toBeGreaterThan(0);
      expect(theme.role.trim(), `${id} role`).toBe(theme.role);
      expect(theme.role.length, `${id} role`).toBeGreaterThan(0);
    }
  });
});

describe('palette 的色階規則', () => {
  /** 六個基礎色階：DEFAULT 是填色，可讀的夥伴各自叫 dark 或 ink。 */
  const RAMPS: { group: string; readable: string }[] = [
    { group: 'primary', readable: 'dark' },
    { group: 'secondary', readable: 'dark' },
    { group: 'mint', readable: 'dark' },
    { group: 'butter', readable: 'dark' },
    { group: 'outing', readable: 'ink' },
    { group: 'guard', readable: 'ink' },
  ];

  it('DEFAULT 色階是填色：對白色 <4.5:1', () => {
    // 這條是刻意寫成「DEFAULT 就是填色」而不是「DEFAULT 目前很淺」。
    // 哪天有人把 DEFAULT 調到可讀，這裡會紅——那不是壞事，是提醒他順手把
    // 命名一起想清楚（能當字用的色階不該再叫 DEFAULT）。
    for (const { group } of RAMPS) {
      const value = ratio(lookup(group) ?? '', WHITE);

      expect(
        value,
        `${group} DEFAULT 對白色 ${value.toFixed(2)}:1，已經不只是填色`,
      ).toBeLessThan(4.5);
    }
  });

  it('每個基礎色階的可讀夥伴 ≥4.5:1', () => {
    for (const { group, readable } of RAMPS) {
      const token = `${group}-${readable}`;
      const value = ratio(lookup(token) ?? '', WHITE);

      expect(
        value,
        `${token} 對白色只有 ${value.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('所有 -ink 與 -deep 色階都 ≥4.5:1', () => {
    // palette 的自我承諾：「每個 -ink 是同名填色的可讀夥伴」。窮舉檢查，
    // 新增一個 -ink 卻沒調夠深時要在這裡失敗。
    const inks = paletteTokens().filter(
      (token) =>
        token.endsWith('-ink')
        || token.endsWith('-deep')
        || /(^|-)(ink|deep)$/.test(token),
    );

    expect(inks.length, '找不到任何 -ink/-deep 色階，選取邏輯壞了').toBeGreaterThan(
      10,
    );

    for (const token of inks) {
      const hex = lookup(token);

      if (hex === undefined) {
        continue;
      }

      const value = ratio(hex, WHITE);

      expect(
        value,
        `${token} (${hex}) 對白色只有 ${value.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('bloom 與 explorer 的 -dark 是深填色，不是文字色', () => {
    // bloom/explorer 的 -dark 實測只有 2.44–3.72:1（`explorer-sunbeam-dark`
    // 2.44、`bloom-dusty-blue-dark` 2.87、`bloom-dusty-rose-dark` 2.98、
    // `bloom-sage-dark` / `bloom-terracotta-dark` 3.01、`bloom-mauve-dark`
    // 3.18、`explorer-meadow-dark` 3.72）：它們是 hover 用的深填色，可讀夥伴
    // 一律是 -ink。README 的規則已按 palette 家族分開寫，這條是它的量測依據。
    // 若哪天刻意把它們調深，這裡會紅——請一併改名並更新 README 的規則。
    for (const token of paletteTokens()) {
      if (!token.startsWith('bloom-') && !token.startsWith('explorer-')) {
        continue;
      }

      if (!token.endsWith('-dark')) {
        continue;
      }

      const hex = lookup(token);

      if (hex === undefined) {
        continue;
      }

      const value = ratio(hex, WHITE);

      expect(
        value,
        `${token} (${hex}) 對白色 ${value.toFixed(2)}:1，已經像文字色了`,
      ).toBeLessThan(4.5);
    }
  });
});

/** palette 裡所有可解析的 token，例如 `primary-dark`、`bloom-stone-ink`。 */
function paletteTokens(): string[] {
  return Object.entries(COLORS).flatMap(([group, entry]) => {
    if (typeof entry === 'string') {
      return [group];
    }

    if (entry === undefined) {
      return [];
    }

    return Object.keys(entry).map((key) =>
      key === 'DEFAULT' ? group : `${group}-${key}`,
    );
  });
}
