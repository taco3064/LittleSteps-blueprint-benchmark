import { describe, it, expect } from 'vitest';
import { splitOverdueByProfileStart } from './index';

/** 只需要 dueDate 與 status，用最小形狀避免綁死任一服務的型別。 */
const item = (dueDate: string, status = 'overdue') => ({
  id: dueDate,
  dueDate,
  status,
});

const idsOf = (rows: { id: string }[]) => rows.map((row) => row.id);

describe('splitOverdueByProfileStart', () => {
  it('建檔前就到期的歸入 missingHistory，建檔後才到期的留在 overdue', () => {
    // 這條就是整個功能：同樣是 overdue，只有後者是家長真的漏掉的。
    const { overdue, missingHistory } = splitOverdueByProfileStart(
      [item('2025-06-01'), item('2026-03-01')],
      '2026-01-10T00:00:00.000Z',
    );

    expect(idsOf(overdue)).toEqual(['2026-03-01']);
    expect(idsOf(missingHistory)).toEqual(['2025-06-01']);
  });

  it('到期日與建檔日同一天算真的逾期', () => {
    // 那一天家長已經在用 app 了，不屬於它看不到的過去，不能藏進收合區。
    const { overdue, missingHistory } = splitOverdueByProfileStart(
      [item('2026-01-10')],
      '2026-01-10T00:00:00.000Z',
    );

    expect(idsOf(overdue)).toEqual(['2026-01-10']);
    expect(missingHistory).toEqual([]);
  });

  it('createdAt 依本地時區換算日曆日，不是取 ISO 字串的 UTC 日期', () => {
    // 台灣時間 2026-01-15 04:00 建的檔，UTC 還在 01-14。若直接拿字串前 10 碼，
    // 01-14 到期的項目會被誤判成家長漏掉的，開場又是一張紅卡。
    const { overdue, missingHistory } = splitOverdueByProfileStart(
      [item('2026-01-14'), item('2026-01-15')],
      '2026-01-14T20:00:00.000Z',
    );

    expect(idsOf(overdue)).toEqual(['2026-01-15']);
    expect(idsOf(missingHistory)).toEqual(['2026-01-14']);
  });

  it('非 overdue 的項目兩堆都不收', () => {
    // 呼叫端傳整份清單進來，切分只負責逾期那一段；due／upcoming／done
    // 各自的分區仍由頁面照原本的 status 篩，不能被這裡吃掉或重複計算。
    const split = splitOverdueByProfileStart(
      [
        item('2025-06-01', 'due'),
        item('2025-07-01', 'upcoming'),
        item('2025-08-01', 'done'),
      ],
      '2026-01-10T00:00:00.000Z',
    );

    expect(split.overdue).toEqual([]);
    expect(split.missingHistory).toEqual([]);
  });

  it('沒有 createdAt 時不切分，全部當成真的逾期', () => {
    // 沒有分界點就寧可照舊提醒：把家長確實漏掉的項目藏起來的代價高得多。
    const { overdue, missingHistory } = splitOverdueByProfileStart([
      item('2025-06-01'),
      item('2026-03-01'),
    ]);

    expect(idsOf(overdue)).toEqual(['2025-06-01', '2026-03-01']);
    expect(missingHistory).toEqual([]);
  });

  it('兩堆都維持傳入的順序', () => {
    // 兩個頁面收到的清單已依到期日遞增，分區直接沿用；重排會讓卡片順序亂掉。
    const { overdue, missingHistory } = splitOverdueByProfileStart(
      [item('2025-01-01'), item('2026-02-01'), item('2025-05-01'), item('2026-04-01')],
      '2026-01-01',
    );

    expect(idsOf(overdue)).toEqual(['2026-02-01', '2026-04-01']);
    expect(idsOf(missingHistory)).toEqual(['2025-01-01', '2025-05-01']);
  });

  it('createdAt 收純日期字串時原樣當分界', () => {
    // 產檢的 lmp／生日等欄位都是 YYYY-MM-DD，同一支函式要吃得下。
    const { overdue, missingHistory } = splitOverdueByProfileStart(
      [item('2026-06-14'), item('2026-06-15')],
      '2026-06-15',
    );

    expect(idsOf(overdue)).toEqual(['2026-06-15']);
    expect(idsOf(missingHistory)).toEqual(['2026-06-14']);
  });
});
