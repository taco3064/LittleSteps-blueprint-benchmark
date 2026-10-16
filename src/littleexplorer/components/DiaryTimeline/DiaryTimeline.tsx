import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';
import type { ChildFormValues } from '~app/family/domain/childForm';
import type { ChildProfile, DiaryEntry } from '~app/family/domain/familyRecords';
import { calculateAgeDisplay } from '~app/family/domain/summaryCalculator';
import type { DiaryMonthGroup } from '~app/littleexplorer/domain/diaryHelpers';
import EmptyState from '~app/platform/components/EmptyState';
import { listItem, stagger, tap } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import DiaryMonth from '../DiaryMonth';
import type { ExplorerShellProps } from '../ExplorerShell';
import type { NoChildNoticeProps } from '../NoChildNotice';
const THEME = SERVICE_THEME.littleexplorer;
interface DiaryTimelineProps {
  NoChildNotice: React.ComponentType<NoChildNoticeProps>;
  ExplorerShell: React.ComponentType<ExplorerShellProps>;
  currentChild: ChildProfile | null | undefined;
  reminderBadge: number | undefined;
  onAddChild: (child: ChildFormValues) => Promise<void>;
  onJoinChild: ((uuid: string) => Promise<void>) | undefined;
  composerOpen: boolean;
  editingId: string | null;
  form: JSX.Element;
  resetForm: () => void;
  setComposerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  groups: DiaryMonthGroup[];
  checkItemTitles: Record<string, string>;
  startEdit: (entry: DiaryEntry) => void;
  remove: (entry: DiaryEntry) => Promise<void>;
  deleteError: { entryId: string; message: string } | null;
}

export default function DiaryTimeline(props: DiaryTimelineProps) {
  return (
    <props.ExplorerShell
      active="diary"
      childName={props.currentChild?.name}
      ageLabel={
        props.currentChild
          ? calculateAgeDisplay(props.currentChild.birthday)
          : undefined
      }
      reminderBadge={props.reminderBadge}
    >
      {!props.currentChild
        ? (
            <props.NoChildNotice
              description="新增寶寶後，就能在這裡留下成長的點滴。"
              onAddChild={props.onAddChild}
              onJoinChild={props.onJoinChild}
            />
          )
        : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.section variants={listItem} className="panel">
                {props.composerOpen && !props.editingId
                  ? (
                      props.form
                    )
                  : (
                      <motion.button
                        type="button"
                        whileTap={tap}
                        onClick={() => {
                          props.resetForm();
                          props.setComposerOpen(true);
                        }}
                        className={`w-full min-h-tap flex items-center gap-3 text-left ${THEME.muted}`}
                      >
                        <PenLine className="w-5 h-5 shrink-0" />
                        <span className="text-sm">今天發生了什麼？</span>
                      </motion.button>
                    )}
              </motion.section>

              {props.groups.length === 0 && !props.composerOpen && (
                <motion.div variants={listItem}>
                  <EmptyState
                    theme={THEME}
                    title="還沒有任何紀錄"
                    description={
                      '這裡適合記下那些不會出現在數據裡的時刻——\n今天冒出的新詞、第一次自己穿鞋、公園裡不肯回家。\n\n在成長分頁勾選'
                      + '會的項目時，也可以順手記一筆。'
                    }
                  />
                </motion.div>
              )}

              {props.groups.map((group) => (
                <DiaryMonth
                  key={group.key}
                  group={group}
                  checkItemTitles={props.checkItemTitles}
                  editingId={props.editingId}
                  form={props.form}
                  startEdit={props.startEdit}
                  remove={props.remove}
                  deleteError={props.deleteError}
                />
              ))}
            </motion.div>
          )}
    </props.ExplorerShell>
  );
}
