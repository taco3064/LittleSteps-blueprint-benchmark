import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * 服務之間共用帳號與孩子資料，不共用畫面。
 *
 * 這條界線曾經破過一次：新增孕期檔案的唯一入口在 LittleSteps 的側邊欄，
 * 所以 LittleBloom 的空狀態只能寫「到 LittleSteps 的側邊選單新增一個孕期
 * 檔案」，把家長送去另一個服務才能開始用這一個。LittleExplorer 的三個頁面
 *也都寫著「請先到 LittleSteps 新增寶寶」。
 *
 * 每個服務現在自己開自己需要的新增視窗（共用同一張表單與同一個資料層），
 * 這個測試盯的就是那些指路句子不要回來。
 *
 * 注意它不禁止所有跨服務連結：出生後把媽媽帶去 LittleSteps 看里程碑、或
 * 幼兒期檔案還不到 1 歲時指回 LittleSteps，都是階段交棒而不是「要建資料
 * 請去別的服務」，那是產品本來的形狀。
 */

// happy-dom 換掉了全域 URL，readFileSync(new URL(...)) 會炸；用 fileURLToPath。
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function tsxFiles(dir: string): string[] {
  const out: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      out.push(...tsxFiles(full));
    } else if (full.endsWith('.tsx') && !full.includes('.test.')) {
      out.push(full);
    }
  }

  return out;
}

/** 「要建資料請先去另一個服務」的句型。 */
const CREATION_REDIRECTS = [
  '請先到 LittleSteps 新增',
  'LittleSteps 的側邊選單',
  '前往新增孕期檔案',
];

/**
 * 註解換成等長空白，行號才對得上。
 *
 * 必要而不是防禦性的：修好之後，好幾個檔案的註解正是在解釋「原本寫著請先到
 * LittleSteps 新增」，不濾掉的話這個規則會被它自己的說明文字咬到。
 */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(
      /(^|[^:])\/\/[^\n]*/g,
      (m, p1) => p1 + ' '.repeat(m.length - p1.length),
    );
}

describe('服務獨立性', () => {
  const files = tsxFiles(SRC);

  it('掃描範圍不是空的', () => {
    expect(files.length).toBeGreaterThan(50);
    expect(files.some((f) => f.includes('littlebloom'))).toBe(true);
    expect(files.some((f) => f.includes('littleexplorer'))).toBe(true);
  });

  it('沒有任何服務叫使用者去別的服務才能新增資料', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const lines = withoutComments(readFileSync(file, 'utf8')).split('\n');

      lines.forEach((line, i) => {
        for (const phrase of CREATION_REDIRECTS) {
          if (line.includes(phrase)) {
            offenders.push(`${file.slice(SRC.length + 1)}:${i + 1}: ${phrase}`);
          }
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it('新增／加入寶寶的入口用 create+join，不提供孕期分頁——那是 LittleBloom 的入口', () => {
    // 這個入口原本長在 LittleSteps 的側邊抽屜裡。抽屜只在 LittleSteps 的
    // 路由下渲染，所以帳號與寶寶切換等於被關在一個服務裡；現在搬到每個
    // AppBar 都有的 AccountSheet，斷言跟著搬，守的規則沒變。
    const sheet = readFileSync(join(SRC, 'account/index.tsx'), 'utf8');

    expect(sheet).toMatch(/modes=\{\['create', 'join'\]\}/);
    expect(sheet).not.toContain('\'pregnancy\'');
  });

  it('側邊抽屜只剩 LittleSteps 自己的頁面導覽', () => {
    // 帳號與寶寶留在這裡的話就是兩個入口，其中一個還只有一個服務看得到。
    const sidebar = readFileSync(
      join(SRC, 'littlesteps/components/Sidebar/Sidebar.tsx'),
      'utf8',
    );

    expect(sidebar).not.toContain('AddChildModal');
    expect(sidebar).not.toContain('onSignOut');
  });

  it('每個需要建資料的服務都有自己的新增入口', () => {
    // LittleBloom 建孕期檔案，LittleExplorer 建寶寶檔案。
    const bloom = readFileSync(
      join(SRC, 'littlebloom/AddPregnancyModal.tsx'),
      'utf8',
    );

    expect(bloom).toContain('modes={[\'pregnancy\']}');

    const explorer = readFileSync(
      join(SRC, 'littleexplorer/NoChildNotice.tsx'),
      'utf8',
    );

    expect(explorer).toContain('modes={[\'create\', \'join\']}');

    // 兩者都用自己服務的配色，視窗才不會看起來是 LittleSteps 的。
    for (const source of [bloom, explorer]) {
      expect(source).toContain('accent={theme.fill}');
    }
  });
});
