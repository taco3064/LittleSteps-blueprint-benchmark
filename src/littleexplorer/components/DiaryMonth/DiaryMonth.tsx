import { motion } from 'framer-motion';
import { PenLine, Sprout, Trash2 } from 'lucide-react';
import { formatDate } from '~app/platform/domain/calendar';
import type { DiaryEntry } from '~app/family/domain/familyRecords';
import type { DiaryMonthGroup } from '~app/littleexplorer/domain/diaryHelpers';
import { listItem } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littleexplorer;
interface DiaryMonthProps {
  group: DiaryMonthGroup;
  checkItemTitles: Record<string, string>;
  editingId: string | null;
  form: JSX.Element;
  startEdit: (entry: DiaryEntry) => void;
  remove: (entry: DiaryEntry) => Promise<void>;
  deleteError: { entryId: string; message: string } | null;
}

export default function DiaryMonth({
  group,
  checkItemTitles,
  editingId,
  form,
  startEdit,
  remove,
  deleteError,
}: DiaryMonthProps) {
  return (
    <section key={group.key}>
      {/* AppBar 固定 h-16，月份分隔線就貼在它下緣。
                  這一層刻意不做入場動畫：sticky 元素若落在有 transform 的
                  祖先裡，動畫期間會連帶被推移。 */}
      <h2
        className={
          'sticky top-16 z-10 -mx-4 px-4 py-2 bg-explorer-sand/95 '
          + 'backdrop-blur-sm '
          + THEME.body
          + ''
        }
      >
        {group.label}
      </h2>
      <motion.ul variants={listItem} className="space-y-3 mt-2">
        {group.entries.map((entry) => {
          const linkedTitle = entry.linkedCheckItemId
            ? checkItemTitles[entry.linkedCheckItemId]
            : undefined;

          if (editingId === entry.id) {
            return (
              <li key={entry.id} className="panel">
                {form}
              </li>
            );
          }

          return (
            <li key={entry.id} className="panel">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm ${THEME.muted}`}>
                  {formatDate(entry.date)}
                </span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => startEdit(entry)}
                  className="btn-icon"
                  aria-label="編輯"
                >
                  <PenLine className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void remove(entry);
                  }}
                  className={
                    'btn-icon hover:bg-explorer-clay/10 '
                    + 'hover:text-explorer-clay-ink'
                  }
                  aria-label="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-explorer-bark leading-relaxed whitespace-pre-line">
                {entry.content}
              </p>

              {linkedTitle && (
                <p className="tag mt-3 bg-explorer-meadow/15 text-explorer-meadow-ink">
                  <Sprout className="w-3.5 h-3.5" />
                  {linkedTitle}
                </p>
              )}

              {deleteError?.entryId === entry.id && (
                <p role="alert" className="text-sm mt-2 text-explorer-clay-ink">
                  {deleteError.message}
                </p>
              )}
            </li>
          );
        })}
      </motion.ul>
    </section>
  );
}
