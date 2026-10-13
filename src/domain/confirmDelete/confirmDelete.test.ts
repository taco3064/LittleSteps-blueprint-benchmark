import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirmDelete } from './confirmDelete';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function tsFiles(dir: string): string[] {
  const out: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      out.push(...tsFiles(full));
    } else if (/\.tsx?$/.test(entry) && !entry.includes('.test.')) {
      out.push(full);
    }
  }

  return out;
}

describe('confirmDelete', () => {
  // happy-dom 沒有實作 window.confirm，所以是指派而不是 spyOn。
  beforeEach(() => {
    window.confirm = vi.fn(() => true);
  });

  it('每次都說刪的是什麼，以及回不來', () => {
    confirmDelete('這筆成長記錄');

    expect(window.confirm).toHaveBeenCalledWith(
      '確定要刪除這筆成長記錄嗎？刪除後無法復原。',
    );
  });

  it('會連帶刪掉別的東西時要先講', () => {
    confirmDelete('這位寶寶的資料', '所有里程碑進度');

    expect(window.confirm).toHaveBeenCalledWith(
      '確定要刪除這位寶寶的資料嗎？所有里程碑進度也會一併刪除。刪除後無法復原。',
    );
  });

  it('留下來的東西也要講，不然「刪除」聽起來就是全部', () => {
    // 刪帳號是唯一一個「有些東西會留下」的刪除點：和家人共用的孩子留給對方。
    // 少了那一句，家長只能猜，而這個動作回不來。
    confirmDelete(
      '這個帳號',
      '只有你一個人在用的寶寶資料與所有紀錄',
      '和家人共用的寶寶會留給他們，只把你從成員名單上移除。',
    );

    expect(window.confirm).toHaveBeenCalledWith(
      '確定要刪除這個帳號嗎？只有你一個人在用的寶寶資料與所有紀錄也會一併刪除。和家人共用的寶寶會留給他們，只把你從成員名單上移除。刪除後無法復原。',
    );
  });

  it('回傳使用者的選擇，沒有自己決定', () => {
    window.confirm = vi.fn(() => false);

    expect(confirmDelete('這則日記')).toBe(false);
  });
});

describe('刪除確認只有一種寫法', () => {
  /**
   * 原本五個刪除點各寫一句，量詞和用字都不同，其中三句沒講「不可復原」。
   * 這條規則讓下一個刪除點沒辦法再長出第六種說法。
   */
  it('window.confirm 只出現在 confirmDelete 裡', () => {
    const offenders = tsFiles(SRC)
      .filter((file) => file !== join(SRC, 'domain', 'confirmDelete', 'confirmDelete.ts'))
      .filter((file) => /window\.confirm\s*\(/.test(readFileSync(file, 'utf8')))
      .map((file) => file.slice(SRC.length + 1));

    expect(offenders).toEqual([]);
  });

  it('掃描範圍不是空的', () => {
    // 檔案列舉壞掉時，上面那條規則會安靜地永遠通過。
    const files = tsFiles(SRC);

    expect(files.length).toBeGreaterThan(100);
    expect(files).toContain(join(SRC, 'domain', 'confirmDelete', 'confirmDelete.ts'));
    expect(files.some((file) => file.includes(join(SRC, 'containers')))).toBe(true);
  });
});
