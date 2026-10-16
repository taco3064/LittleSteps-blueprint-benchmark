import { Sheet } from './Sheet';
import { VaccineTrackingView16 } from './VaccineTrackingView16';
interface VaccineTrackingView15Props {
  editingDose: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    currentDate?: string;
  };
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

export function VaccineTrackingView15({
  editingDose, setEditingDose, onSetVaccineDose,
}: VaccineTrackingView15Props) {
  return (
    <Sheet
      title={editingDose.administered ? '修改接種日期' : '記錄接種日期'}
      onClose={() => setEditingDose(null)}
    >
      <VaccineTrackingView16
        onSetVaccineDose={onSetVaccineDose}
        editingDose={editingDose}
        setEditingDose={setEditingDose}
      />

      {/* 取消接種是另一件事，不該由「確認日期」順手做掉——那正是原本的 bug。 */}
      {editingDose.administered && (
        <button
          type="button"
          onClick={() => {
            onSetVaccineDose({
              vaccineId: editingDose.vaccineId,
              doseNumber: editingDose.doseNumber,
              administered: false,
            });

            setEditingDose(null);
          }}
          className="btn-ghost w-full text-primary-dark hover:bg-primary-light"
        >
          取消接種記錄
        </button>
      )}
    </Sheet>
  );
}
