import type { DiaryEntry } from '~app/family/domain/familyRecords';

export interface DiaryMonthGroup {
  /** YYYY-MM，用於排序與 React key */
  key: string;
  /** 顯示用，例：2026 年 8 月 */
  label: string;
  entries: DiaryEntry[];
}

/** 由 YYYY-MM 產生「2026 年 8 月」，月份不補零。 */
function monthLabel(key: string): string {
  const [year, month] = key.split('-');

  return `${year} 年 ${Number(month)} 月`;
}

/**
 * 將日記條目依月份分組，群組與組內皆為降序（最新在前）。
 * 同一天的條目以 createdAt 決定先後。不修改傳入的陣列。
 */
export function groupEntriesByMonth(entries: DiaryEntry[]): DiaryMonthGroup[] {
  const buckets = new Map<string, DiaryEntry[]>();

  for (const entry of entries) {
    const key = entry.date.slice(0, 7);
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.push(entry);
    } else {
      buckets.set(key, [entry]);
    }
  }

  return [...buckets.keys()]
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({
      key,
      label: monthLabel(key),
      entries: buckets
        .get(key)!
        .slice()
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
        ),
    }));
}
