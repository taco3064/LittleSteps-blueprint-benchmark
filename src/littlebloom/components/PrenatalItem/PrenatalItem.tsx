import type { PrenatalCheckupTemplate } from '~app/knowledge/domain/prenatalCheckups';
import type { ScheduleStatus } from '~app/knowledge/domain/scheduleStatus';
import type { ResolvedPrenatalItem } from '~app/littlebloom/domain/prenatalSchedule';
import PrenatalItemActions from '../PrenatalItemActions';
import PrenatalItemForm from '../PrenatalItemForm';
import PrenatalItemSummary from '../PrenatalItemSummary';
interface PrenatalItemProps {
  template: PrenatalCheckupTemplate;
  accent: '' | 'bg-bloom-terracotta/10';
  status: ScheduleStatus;
  item: ResolvedPrenatalItem;
  beforeProfile: boolean;
  undo: (templateId: string) => Promise<void>;
  saving: boolean;
  showForm: boolean;
  setFormFor: React.Dispatch<React.SetStateAction<string | null>>;
  setCompletedDate: React.Dispatch<React.SetStateAction<string>>;
  setClinicName: React.Dispatch<React.SetStateAction<string>>;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  completedDate: string;
  clinicName: string;
  notes: string;
  submit: (templateId: string) => Promise<void>;
  failure: { templateId: string; message: string } | null;
}

export default function PrenatalItem(props: PrenatalItemProps) {
  return (
    <li
      key={props.template.id}
      className={`card ${props.accent} ${props.status === 'done' ? 'opacity-70' : ''}`}
    >
      <PrenatalItemSummary
        template={props.template}
        item={props.item}
        beforeProfile={props.beforeProfile}
        status={props.status}
      />

      <PrenatalItemActions
        status={props.status}
        undo={props.undo}
        template={props.template}
        saving={props.saving}
        showForm={props.showForm}
        setFormFor={props.setFormFor}
        setCompletedDate={props.setCompletedDate}
        setClinicName={props.setClinicName}
        setNotes={props.setNotes}
      />

      {props.showForm && (
        <PrenatalItemForm
          completedDate={props.completedDate}
          setCompletedDate={props.setCompletedDate}
          clinicName={props.clinicName}
          setClinicName={props.setClinicName}
          notes={props.notes}
          setNotes={props.setNotes}
          submit={props.submit}
          template={props.template}
          saving={props.saving}
        />
      )}

      {props.failure?.templateId === props.template.id && (
        <p role="alert" className="text-sm mt-2 text-bloom-terracotta-ink">
          {props.failure.message}
        </p>
      )}
    </li>
  );
}
