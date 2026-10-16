import { motion } from 'framer-motion';
import { Check, Undo2 } from 'lucide-react';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { PrenatalCheckupTemplate } from '~app/knowledge/domain/prenatalCheckups';
import type { ScheduleStatus } from '~app/knowledge/domain/scheduleStatus';
import { tap } from '~app/platform/components/Motion';
const today = () => toLocalDateKey();
interface PrenatalItemActionsProps {
  status: ScheduleStatus;
  undo: (templateId: string) => Promise<void>;
  template: PrenatalCheckupTemplate;
  saving: boolean;
  showForm: boolean;
  setFormFor: React.Dispatch<React.SetStateAction<string | null>>;
  setCompletedDate: React.Dispatch<React.SetStateAction<string>>;
  setClinicName: React.Dispatch<React.SetStateAction<string>>;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

export default function PrenatalItemActions(props: PrenatalItemActionsProps) {
  return (
    <div className="mt-3">
      {props.status === 'done'
        ? (
            <motion.button
              type="button"
              whileTap={tap}
              onClick={() => {
                void props.undo(props.template.id);
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
              onClick={() => {
                if (props.showForm) {
                  props.setFormFor(null);

                  return;
                }

                props.setFormFor(props.template.id);
                props.setCompletedDate(today());
                props.setClinicName('');
                props.setNotes('');
              }}
              className="btn-secondary px-4 text-sm text-bloom-sage-ink"
            >
              <Check className="w-4 h-4" />
              標記完成
            </motion.button>
          )}
    </div>
  );
}
