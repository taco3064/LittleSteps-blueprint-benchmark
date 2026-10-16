import { DailyLog, DiaperData } from '~app/family/domain/familyRecords';

export function fillDiaperDraft({
  editingLog, setDiaperType, setConsistency, setNotes,
}: {
  editingLog: DailyLog;
  setDiaperType: import('react').Dispatch<
    import('react').SetStateAction<'both' | 'pee' | 'poop'>
  >;
  setConsistency: import('react').Dispatch<
    import('react').SetStateAction<'normal' | 'soft' | 'hard' | undefined>
  >;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
}) {
  const data = editingLog.data as DiaperData;

  setDiaperType(data.type);
  setConsistency(data.consistency || 'normal');
  setNotes(data.notes || '');
}
