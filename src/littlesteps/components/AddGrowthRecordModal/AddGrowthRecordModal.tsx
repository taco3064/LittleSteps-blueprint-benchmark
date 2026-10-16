import { useEffect, useState } from 'react';
import { useToast } from '~app/platform/hooks/useToast';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import { GrowthRecord } from '~app/family/domain/familyRecords';
import { AddGrowthRecordModalPresentation } from './AddGrowthRecordModalPresentation';

interface AddGrowthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<GrowthRecord, 'id'>) => Promise<void>;
  childId: string;
  /** 有值就是在改這一筆；打錯的體重原本只能刪掉重來。 */
  editingRecord?: GrowthRecord | null;
}

export default function AddGrowthRecordModal({
  isOpen, onClose, onSave, childId, editingRecord,
}: AddGrowthRecordModalProps) {
  const toast = useToast();
  const [date, setDate] = useState(toLocalDateKey());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaving(false);
    setDate(editingRecord?.date ?? toLocalDateKey());
    setWeight(measurementText(editingRecord?.weight));
    setHeight(measurementText(editingRecord?.height));
    setHeadCircumference(measurementText(editingRecord?.headCircumference));
    setNotes(editingRecord?.notes ?? '');
  }, [editingRecord, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight && !height && !headCircumference) {
      toast.show('請至少輸入一項測量數據');

      return;
    }

    setSaving(true);

    try {
      await onSave({
        childId,
        date,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        headCircumference: headCircumference
          ? parseFloat(headCircumference)
          : undefined,
        percentile: {}, // Will be calculated by the hook
        notes: notes || undefined,
      });

      // 表單的初始值由 editingRecord 決定，下次開啟時 effect 會重設。
      onClose();
    } catch (error) {
      console.error('Failed to save record:', error);
      toast.show((error as Error).message || '儲存失敗，請檢查輸入資料');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AddGrowthRecordModalPresentation
      isOpen={isOpen}
      onClose={onClose}
      editingRecord={editingRecord}
      handleSubmit={handleSubmit}
      date={date}
      setDate={setDate}
      weight={weight}
      setWeight={setWeight}
      height={height}
      setHeight={setHeight}
      headCircumference={headCircumference}
      setHeadCircumference={setHeadCircumference}
      notes={notes}
      setNotes={setNotes}
      saving={saving}
    />
  );
}

function measurementText(value?: number) {
  return value?.toString() ?? '';
}
