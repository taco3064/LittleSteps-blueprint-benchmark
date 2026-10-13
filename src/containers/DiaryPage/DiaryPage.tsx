import { motion } from 'framer-motion';
import { PenLine, Sprout, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '~app/components/EmptyState';
import ExplorerShell from '../ExplorerShell';
import NoChildNotice from '~app/components/NoChildNotice';
import { confirmDelete } from '~app/domain/confirmDelete';
import { formatDate } from '~app/domain/dateHelpers';
import { developmentCheckItems } from '~app/domain/developmentChecks';
import { groupEntriesByMonth } from '~app/domain/diaryHelpers';
import { listItem, stagger } from '~app/domain/motion';
import type { ChildProfile, DiaryEntry } from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { calculateAgeDisplay } from '~app/domain/summaryCalculator';
import { DiaryComposerPrompt, DiaryForm, useDiaryComposer } from './DiaryComposer';

const THEME = SERVICE_THEME.littleexplorer;

interface DiaryPageProps {
  currentChild?: ChildProfile | null;
  entries: DiaryEntry[];
  reminderBadge?: number;
  onAdd: (
    entry: Omit<DiaryEntry, 'id' | 'childId' | 'createdAt'>,
  ) => Promise<string | undefined>;
  onUpdate: (entryId: string, updates: Partial<DiaryEntry>) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  /**
   * 新增／加入寶寶。LittleExplorer 自己開新增視窗，不把家長送去 LittleSteps
   * ——共用的是帳號與孩子資料，不是彼此的畫面。
   */
  onAddChild: React.ComponentProps<typeof NoChildNotice>['onAddChild'];
  onJoinChild?: (uuid: string) => Promise<void>;
}

/**
 * 成長日記：自由書寫的質性紀錄。
 *
 * 與 LittleSteps 的快速日誌切乾淨——那邊記餵奶／睡眠／尿布的結構化數據，
 * 這邊記那些永遠不會出現在數據裡的東西。日記刻意不顯示快速日誌的資料：
 * 混合時間軸看似整合，實際上會讓家長不知道該去哪裡寫。
 *
 * 這是唯一不做年齡守門的分頁——不論孩子 11 個月還是 4 歲，既有紀錄都必須
 * 看得到、寫得了。
 */
export default function DiaryPage({
  currentChild,
  entries,
  reminderBadge,
  onAdd,
  onUpdate,
  onDelete,
  onAddChild,
  onJoinChild,
}: DiaryPageProps) {
  const composer = useDiaryComposer({ onAdd, onUpdate });

  const { composerOpen, editingId, resetForm, startEdit, setComposerOpen }
    = composer;

  const { deleteError, remove } = useDiaryDeletion({
    onDelete,
    editingId,
    resetForm,
  });

  const groups = useMemo(() => groupEntriesByMonth(entries), [entries]);

  const form = <DiaryForm composer={composer} />;

  return (
    <ExplorerShell
      active="diary"
      childName={currentChild?.name}
      ageLabel={
        currentChild ? calculateAgeDisplay(currentChild.birthday) : undefined
      }
      reminderBadge={reminderBadge}
    >
      {!currentChild && (
        <NoChildNotice
          description="新增寶寶後，就能在這裡留下成長的點滴。"
          onAddChild={onAddChild}
          onJoinChild={onJoinChild}
        />
      )}
      {currentChild && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <DiaryComposerPrompt
            composerOpen={composerOpen}
            editingId={editingId}
            form={form}
            resetForm={resetForm}
            setComposerOpen={setComposerOpen}
          />

          {groups.length === 0 && !composerOpen && <DiaryEmptyNotice />}

          {groups.map((group) => (
            <section key={group.key}>
              {/* AppBar 固定 h-16，月份分隔線就貼在它下緣。
                  這一層刻意不做入場動畫：sticky 元素若落在有 transform 的
                  祖先裡，動畫期間會連帶被推移。 */}
              <h2
                className={
                  'sticky top-16 z-10 -mx-4 px-4 py-2 bg-explorer-sand/95'
                  + ` backdrop-blur-sm ${THEME.body}`
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
                    <DiaryEntryCard
                      key={entry.id}
                      entry={entry}
                      startEdit={startEdit}
                      remove={remove}
                      linkedTitle={linkedTitle}
                      deleteError={deleteError}
                    />
                  );
                })}
              </motion.ul>
            </section>
          ))}
        </motion.div>
      )}
    </ExplorerShell>
  );
}

function useDiaryDeletion({
  onDelete,
  editingId,
  resetForm,
}: {
  onDelete: DiaryPageProps['onDelete'];
  editingId: string | null;
  resetForm: () => void;
}) {
  /* 刪除失敗的訊息貼在那一則上：日記一頁十幾則，頁面級的橫幅說不清是哪一則。 */
  const [deleteError, setDeleteError] = useState<{
    entryId: string;
    message: string;
  } | null>(null);

  const remove = async (entry: DiaryEntry) => {
    if (!confirmDelete('這則日記')) {
      return;
    }

    setDeleteError(null);

    try {
      await onDelete(entry.id);

      if (editingId === entry.id) {
        resetForm();
      }
    } catch (error) {
      console.error('刪除日記失敗:', error);

      setDeleteError({
        entryId: entry.id,
        message: '刪除失敗，請確認網路後再試一次。',
      });
    }
  };

  return { deleteError, remove };
}

function DiaryEntryCard({
  entry,
  startEdit,
  remove,
  linkedTitle,
  deleteError,
}: {
  entry: import('~app/domain/records').DiaryEntry;
  startEdit: (entry: import('~app/domain/records').DiaryEntry) => void;
  remove: (entry: import('~app/domain/records').DiaryEntry) => Promise<void>;
  linkedTitle: string | undefined;
  deleteError: { entryId: string; message: string } | null;
}) {
  return (
    <li key={entry.id} className="panel">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-sm ${THEME.muted}`}>{formatDate(entry.date)}</span>
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
          className="btn-icon hover:bg-explorer-clay/10 hover:text-explorer-clay-ink"
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
}

const checkItemTitles = Object.fromEntries(
  developmentCheckItems.map((item) => [item.id, item.title]),
);

function DiaryEmptyNotice() {
  return (
    <motion.div variants={listItem}>
      <EmptyState
        theme={THEME}
        title="還沒有任何紀錄"
        description={
          '這裡適合記下那些不會出現在數據裡的時刻——\n'
          + '今天冒出的新詞、第一次自己穿鞋、公園裡不肯回家。\n\n'
          + '在成長分頁勾選會的項目時，也可以順手記一筆。'
        }
      />
    </motion.div>
  );
}
