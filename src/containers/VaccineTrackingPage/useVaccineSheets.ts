import { useState } from 'react';

export function useVaccineSheets() {
  const [showReferences, setShowReferences] = useState(false);
  const [showEmergencies, setShowEmergencies] = useState(false);
  const [showContraindications, setShowContraindications] = useState(false);
  const [showVaccineTypes, setShowVaccineTypes] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  // administered 收在 state 裡，而不是拿 currentDate 有沒有值去猜：只勾了
  // 接種、沒填日期的紀錄是真實存在的，猜的話那一劑會被當成還沒接種。
  const [editingDose, setEditingDose] = useState<{
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    currentDate?: string;
  } | null>(null);

  return {
    showReferences,
    setShowReferences,
    showEmergencies,
    setShowEmergencies,
    showContraindications,
    setShowContraindications,
    showVaccineTypes,
    setShowVaccineTypes,
    showGuidelines,
    setShowGuidelines,
    editingDose,
    setEditingDose,
  };
}
