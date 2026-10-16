import { AnimatePresence } from 'framer-motion';
import { VaccineTrackingView15 } from './VaccineTrackingView15';
interface VaccineTrackingView14Props {
  editingDose: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    currentDate?: string;
  } | null;
  setEditingDose: import('react').Dispatch<
    import('react').SetStateAction<{
      vaccineId: string;
      doseNumber: number;
      administered: boolean;
      currentDate?: string;
    } | null>
  >;
  onSetVaccineDose: (dose: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    date?: string;
  }) => void;
}

export function VaccineTrackingView14({
  editingDose, setEditingDose, onSetVaccineDose,
}: VaccineTrackingView14Props) {
  return (
    <AnimatePresence>
      {editingDose && (
        <VaccineTrackingView15
          editingDose={editingDose}
          setEditingDose={setEditingDose}
          onSetVaccineDose={onSetVaccineDose}
        />
      )}
    </AnimatePresence>
  );
}
