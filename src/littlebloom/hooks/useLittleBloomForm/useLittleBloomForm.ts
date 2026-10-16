import { useState } from 'react';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { Gender } from '~app/family/domain/familyRecords';

export function useLittleBloomForm() {
  const [addOpen, setAddOpen] = useState(false);
  const [birthOpen, setBirthOpen] = useState(false);
  const [birthDate, setBirthDate] = useState(() => toLocalDateKey());
  const [birthGender, setBirthGender] = useState<Gender | ''>('');
  const [birthSaving, setBirthSaving] = useState(false);
  const [birthError, setBirthError] = useState('');

  return {
    addOpen,
    setAddOpen,
    birthOpen,
    setBirthOpen,
    birthDate,
    setBirthDate,
    birthGender,
    setBirthGender,
    birthSaving,
    setBirthSaving,
    birthError,
    setBirthError,
  };
}
