import { motion } from 'framer-motion';
import { CalendarPlus, Check, Syringe, Undo2 } from 'lucide-react';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { buildGoogleCalendarUrl } from '~app/family/domain/icsExport';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import { tap } from '~app/platform/components/Motion';
import CareTaskForm from '../CareTaskForm';
import CareTaskSummary from '../CareTaskSummary';
interface CareTaskRowProps {
  task: ResolvedCareTask;
  accent: string;
  beforeProfile: boolean;
  isDone: boolean;
  showActions: boolean;
  isVaccine: boolean;
  onOpenVaccines: () => void;
  undoTask: (taskId: string) => Promise<void>;
  saving: boolean;
  showForm: boolean;
  setFormFor: React.Dispatch<React.SetStateAction<string | null>>;
  openForm: (taskId: string) => void;
  currentChild: ChildProfile | null | undefined;
  completedDate: string;
  setCompletedDate: React.Dispatch<React.SetStateAction<string>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  submitForm: (taskId: string) => Promise<void>;
  failure: { taskId: string; message: string } | null;
}

export default function CareTaskRow(props: CareTaskRowProps) {
  return (
    <li key={props.task.template.id} className={`card ${props.accent}`}>
      <CareTaskSummary
        task={props.task}
        beforeProfile={props.beforeProfile}
        isDone={props.isDone}
      />

      {props.showActions && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {props.isVaccine
            ? (
                <motion.button
                  type="button"
                  whileTap={tap}
                  onClick={() => {
                    props.onOpenVaccines();
                  }}
                  className="btn-secondary px-4 text-sm text-explorer-sky-ink"
                >
                  <Syringe className="w-4 h-4" />
                  到疫苗追蹤勾選
                </motion.button>
              )
            : props.isDone
              ? (
                  <motion.button
                    type="button"
                    whileTap={tap}
                    onClick={() => {
                      void props.undoTask(props.task.template.id);
                    }}
                    disabled={props.saving}
                    className="btn-ghost text-sm disabled:opacity-60"
                  >
                    <Undo2 className="w-4 h-4" />
                    取消完成
                  </motion.button>
                )
              : (
                  <motion.button
                    type="button"
                    whileTap={tap}
                    onClick={() =>
                      props.showForm
                        ? props.setFormFor(null)
                        : props.openForm(props.task.template.id)}
                    className="btn-secondary px-4 text-sm text-explorer-meadow-ink"
                  >
                    <Check className="w-4 h-4" />
                    標記完成
                  </motion.button>
                )}

          {/* 做完的項目不必再塞進行事曆。 */}
          {!props.beforeProfile && !props.isDone && (
            <a
              href={buildGoogleCalendarUrl(
                props.task,
                props.currentChild?.name ?? '寶寶',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              加入 Google 日曆
            </a>
          )}
        </div>
      )}

      {props.showForm && (
        <CareTaskForm
          completedDate={props.completedDate}
          setCompletedDate={props.setCompletedDate}
          location={props.location}
          setLocation={props.setLocation}
          notes={props.notes}
          setNotes={props.setNotes}
          submitForm={props.submitForm}
          task={props.task}
          saving={props.saving}
        />
      )}

      {props.failure?.taskId === props.task.template.id && (
        <p role="alert" className="text-sm mt-2 text-explorer-clay-ink">
          {props.failure.message}
        </p>
      )}
    </li>
  );
}
