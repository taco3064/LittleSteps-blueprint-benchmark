import { useMemo } from 'react';
import type { ChildFormValues } from '~app/family/domain/childForm';
import type { ChildProfile, DiaryEntry } from '~app/family/domain/familyRecords';
import DiaryForm from '~app/littleexplorer/components/DiaryForm';
import DiaryTimeline from '~app/littleexplorer/components/DiaryTimeline';
import { developmentCheckItems } from '~app/littleexplorer/domain/developmentChecks';
import { groupEntriesByMonth } from '~app/littleexplorer/domain/diaryHelpers';
import { useDiaryForm } from '~app/littleexplorer/hooks/useDiaryForm';
import { createDiaryActions } from './createDiaryActions';
import ExplorerShell from './ExplorerShell';
import NoChildNotice from './NoChildNotice';

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
  onAddChild: (child: ChildFormValues) => Promise<void>;
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
  const {
    composerOpen,
    setComposerOpen,
    editingId,
    setEditingId,
    date,
    setDate,
    content,
    setContent,
    mood,
    setMood,
    saving,
    setSaving,
    formError,
    setFormError,
    deleteError,
    setDeleteError,
  } = useDiaryForm();

  /* 刪除失敗的訊息貼在那一則上：日記一頁十幾則，頁面級的橫幅說不清是哪一則。 */

  const groups = useMemo(() => groupEntriesByMonth(entries), [entries]);

  const checkItemTitles = useMemo(() => {
    const titles: Record<string, string> = {};

    for (const item of developmentCheckItems) {
      titles[item.id] = item.title;
    }

    return titles;
  }, []);

  const { resetForm, startEdit, submit, remove } = createDiaryActions({
    mood,
    setComposerOpen,
    setEditingId,
    setDate,
    setContent,
    setMood,
    setFormError,
    content,
    date,
    saving,
    setSaving,
    editingId,
    onUpdate,
    onAdd,
    setDeleteError,
    onDelete,
  });

  /*
   * store 的 addDiaryEntry／updateDiaryEntry／deleteDiaryEntry 失敗時往外丟
   * 且不 toast——訊息由這一頁負責。這裡最要緊的是失敗時不能 resetForm：家長
   * 剛寫的那段話沒有別的地方存著，清掉就永遠沒了。
   */

  const form = (
    <DiaryForm
      date={date}
      setDate={setDate}
      content={content}
      setContent={setContent}
      setMood={setMood}
      mood={mood}
      formError={formError}
      submit={submit}
      saving={saving}
      editingId={editingId}
      resetForm={resetForm}
    />
  );

  return (
    <DiaryTimeline
      NoChildNotice={NoChildNotice}
      ExplorerShell={ExplorerShell}
      currentChild={currentChild}
      reminderBadge={reminderBadge}
      onAddChild={onAddChild}
      onJoinChild={onJoinChild}
      composerOpen={composerOpen}
      editingId={editingId}
      form={form}
      resetForm={resetForm}
      setComposerOpen={setComposerOpen}
      groups={groups}
      checkItemTitles={checkItemTitles}
      startEdit={startEdit}
      remove={remove}
      deleteError={deleteError}
    />
  );
}
