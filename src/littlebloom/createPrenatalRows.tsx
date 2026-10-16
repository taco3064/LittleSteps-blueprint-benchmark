import { motion } from 'framer-motion';
import PrenatalItem from '~app/littlebloom/components/PrenatalItem';
import type {
  PrenatalItemStatus,
  ResolvedPrenatalItem,
} from '~app/littlebloom/domain/prenatalSchedule';
import type { usePrenatalForm } from '~app/littlebloom/hooks/usePrenatalForm';
import { listItem } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littlebloom;
interface Options extends ReturnType<typeof usePrenatalForm> {
  overdue: ResolvedPrenatalItem[];
  items: ResolvedPrenatalItem[];
  submit: (id: string) => Promise<void>;
  undo: (id: string) => Promise<void>;
}

export function createPrenatalRows({
  formFor,
  saving,
  setFormFor,
  setCompletedDate,
  setClinicName,
  setNotes,
  completedDate,
  clinicName,
  notes,
  failure,
  submit,
  undo,
  overdue,
  items,
}: Options) {
  const itemRow = (item: ResolvedPrenatalItem, beforeProfile = false) => {
    const { template, status } = item;
    const showForm = formFor === template.id;

    const accent
      = status === 'overdue' && !beforeProfile ? 'bg-bloom-terracotta/10' : '';

    return (
      <PrenatalItem
        key={template.id}
        template={template}
        accent={accent}
        status={status}
        item={item}
        beforeProfile={beforeProfile}
        undo={undo}
        saving={saving}
        showForm={showForm}
        setFormFor={setFormFor}
        setCompletedDate={setCompletedDate}
        setClinicName={setClinicName}
        setNotes={setNotes}
        completedDate={completedDate}
        clinicName={clinicName}
        notes={notes}
        submit={submit}
        failure={failure}
      />
    );
  };

  const renderSection = ({
    status,
    title,
  }: {
    status: PrenatalItemStatus;
    title: string;
  }) => {
    const rows
      = status === 'overdue'
        ? overdue
        : items.filter((item) => item.status === status);

    if (rows.length === 0) {
      return null;
    }

    return (
      <motion.section key={status} variants={listItem}>
        <h2 className={`px-1 mb-2 ${THEME.body}`}>
          {title}
          <span className={`ml-2 text-sm font-normal ${THEME.muted}`}>
            {rows.length}
          </span>
        </h2>

        <ul className="space-y-3">{rows.map((item) => itemRow(item))}</ul>
      </motion.section>
    );
  };

  return { itemRow, renderSection };
}
