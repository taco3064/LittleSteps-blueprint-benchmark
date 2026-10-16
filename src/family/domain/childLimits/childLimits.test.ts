import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHILD_LIMIT_MESSAGE, MAX_CHILDREN } from './index';

/**
 * 兩件事在這裡守：
 *
 * 1. 不要再對家長承諾一個不存在的付費方案。這個 app 沒有付費升級，四個地方
 *    卻都寫著「請升級付費會員」。存孩子健康紀錄的產品講一條走不通的路，
 *    比單純說「就是只能兩個」更傷信任。
 * 2. 上限只有一個定義。原本 2 這個數字寫死在三個檔案裡，改一處另外兩處就
 *    對不上，最糟是 UI 讓你按、資料層擋下來。
 */

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function sourceFiles(dir: string): string[] {
  const out: string[] = [];

  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') {
      continue;
    }

    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(entry) && !/\.test\./.test(entry)) {
      out.push(full);
    }
  }

  return out;
}

/** 註解換成等長空白：childLimits.ts 自己的說明就在解釋這個被禁的詞。 */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
}

describe('孩子數量上限', () => {
  const files = sourceFiles(SRC);

  it('掃描範圍不是空的', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('沒有任何地方叫使用者升級到不存在的付費方案', () => {
    const offenders = files.filter((file) => {
      const source = withoutComments(readFileSync(file, 'utf8'));

      return source.includes('付費會員') || source.includes('免費版');
    });

    expect(offenders.map((f) => f.slice(SRC.length + 1))).toEqual([]);
  });

  it('上限只有一個定義，沒有第二份寫死的數字', () => {
    const offenders = files
      .filter((file) => !file.endsWith('childLimits.ts'))
      .filter((file) => /MAX_FREE_CHILDREN\s*=/.test(readFileSync(file, 'utf8')));

    expect(offenders.map((f) => f.slice(SRC.length + 1))).toEqual([]);
  });

  it('訊息說得出實際上限，不會與常數脫鉤', () => {
    expect(CHILD_LIMIT_MESSAGE).toContain(String(MAX_CHILDREN));
  });
});
