import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { CareTaskRecord, ChildProfile } from '~app/family/domain/familyRecords';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import CareTaskRow from '~app/littleexplorer/components/CareTaskRow';
import { goTo } from '~app/portal/services/navigate';
interface ActionOptions {
  setFormFor: React.Dispatch<React.SetStateAction<string | null>>;
  setCompletedDate: React.Dispatch<React.SetStateAction<string>>;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setFailure: React.Dispatch<
    React.SetStateAction<{ taskId: string; message: string } | null>
  >;
  onCompleteTask: (record: CareTaskRecord) => Promise<void>;
  location: string;
  notes: string;
  onUndoTask: ((taskId: string) => Promise<void>) | undefined;
  formFor: string | null;
  currentChild: ChildProfile | null | undefined;
  completedDate: string;
  failure: { taskId: string; message: string } | null;
}
const today = () => toLocalDateKey();

export function createRemindersActions(model: ActionOptions) {
  const openForm = (taskId: string) => {
    model.setFormFor(taskId);
    model.setCompletedDate(today());
    model.setLocation('');
    model.setNotes('');
  };

  const submitForm = async (taskId: string) => {
    if (model.saving) {
      return;
    }

    model.setSaving(true);
    model.setFailure(null);

    try {
      await model.onCompleteTask({
        taskId,
        completedDate: model.completedDate,
        location: model.location.trim() || undefined,
        notes: model.notes.trim() || undefined,
      });

      model.setFormFor(null);
    } catch (error) {
      console.error('儲存照護記錄失敗:', error);

      model.setFailure({
        taskId,
        message: '儲存失敗，剛才填的內容還在，請確認網路後再送出。',
      });
    } finally {
      model.setSaving(false);
    }
  };

  const undoTask = async (taskId: string) => {
    if (!model.onUndoTask || model.saving) {
      return;
    }

    model.setSaving(true);
    model.setFailure(null);

    try {
      await model.onUndoTask(taskId);
    } catch (error) {
      console.error('取消照護記錄失敗:', error);
      model.setFailure({ taskId, message: '取消失敗，請確認網路後再試一次。' });
    } finally {
      model.setSaving(false);
    }
  };

  const taskRow = (
    task: ResolvedCareTask,
    accent: string,
    beforeProfile = false,
  ) => {
    const isVaccine = Boolean(task.template.vaccineId);
    const showForm = model.formFor === task.template.id;
    const isDone = task.status === 'done';
    /* 已完成、又不是疫苗、而 onUndoTask 還沒接上時，這一列沒有任何動作可做。 */
    const showActions = !isDone || isVaccine || Boolean(model.onUndoTask);

    return (
      <CareTaskRow
        key={task.template.id}
        task={task}
        accent={accent}
        beforeProfile={beforeProfile}
        isDone={isDone}
        showActions={showActions}
        isVaccine={isVaccine}
        onOpenVaccines={() => goTo('littlesteps/vaccine-tracking')}
        undoTask={undoTask}
        saving={model.saving}
        showForm={showForm}
        setFormFor={model.setFormFor}
        openForm={openForm}
        currentChild={model.currentChild}
        completedDate={model.completedDate}
        setCompletedDate={model.setCompletedDate}
        location={model.location}
        setLocation={model.setLocation}
        notes={model.notes}
        setNotes={model.setNotes}
        submitForm={submitForm}
        failure={model.failure}
      />
    );
  };

  return { openForm, submitForm, undoTask, taskRow };
}
