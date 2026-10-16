import { useMemo } from 'react';
import { VaccineTrackingView } from '~app/littlesteps/components/VaccineTrackingView';
import { useVaccineTrackingDraft } from '~app/littlesteps/hooks/useVaccineTrackingDraft';

import { useCentreSelectedChip } from '~app/platform/hooks/useCentreSelectedChip';
import { downloadCalendar } from '~app/family/services/calendar_download';
import { ChildProfile, VaccineProgress } from '~app/family/domain/familyRecords';
import {
  VaccineFunding,
  VaccineSchedule,
} from '~app/knowledge/domain/referenceModels';
import { vaccineMonthForChild } from '~app/littlesteps/domain/ageDefaults';
import {
  buildVaccineIcs,
  outstandingVaccineDoses,
} from '~app/littlesteps/domain/vaccineCalendar';
import { vaccineSchedules } from '~app/knowledge/domain/vaccines';

type FundingFilter = 'all' | 'national' | 'conditional' | 'self-paid';
type MonthFilter = 'all' | number;

interface VaccineTrackingPageProps {
  currentChild?: ChildProfile | null;
  vaccineProgress: VaccineProgress;
  onSetVaccineDose: (dose: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    date?: string;
  }) => void;
}

/**
 * 篩選器是四顆而不是五顆：健保有條件給付與各縣市不同併成「有條件」。
 *
 * 家長在這一頁問的是「這一劑要不要付錢」，答案只有三種——不用、要、看你符不符
 * 合條件。健保給付和縣市加碼都落在第三種，而且都得讀那一行條件才知道自己算不
 * 算，拆成兩顆 chip 是把同一個動作分成兩次。390px 上也放不下五顆。
 */
const FUNDING_FILTERS: {
  value: FundingFilter;
  label: string;
  /** 只有「全部」需要：那兩個字在這一頁的兩排篩選器裡各出現一次。 */
  ariaLabel?: string;
  funding: VaccineFunding[];
}[] = [
  { value: 'all', label: '全部', ariaLabel: '全部給付方式', funding: [] },
  { value: 'national', label: '公費', funding: ['national'] },
  {
    value: 'conditional',
    label: '有條件',
    funding: ['nhi-conditional', 'local-varies'],
  },
  { value: 'self-paid', label: '自費', funding: ['self-paid'] },
];

/** 月齡分組是靜態資料推導出來的，元件外算一次就好。 */
const AVAILABLE_MONTHS = Array.from(
  new Set(vaccineSchedules.map((v) => v.ageInMonths || 0)),
).sort((a, b) => a - b);

export default function VaccineTrackingPage({
  currentChild, vaccineProgress, onSetVaccineDose,
}: VaccineTrackingPageProps) {
  const {
    fundingFilter, setFundingFilter, pickedMonth, setPickedMonth, showReferences,
    setShowReferences, showEmergencies, setShowEmergencies, showContraindications,
    setShowContraindications, showVaccineTypes, setShowVaccineTypes, showGuidelines,
    setShowGuidelines, editingDose, setEditingDose,
  } = useVaccineTrackingDraft();

  const derivedMonth = vaccineMonthForChild(currentChild, AVAILABLE_MONTHS);
  const monthFilter = pickedMonth ?? derivedMonth;

  const pickMonth = (value: MonthFilter) =>
    setPickedMonth(value === derivedMonth ? null : value);

  const { scrollerRef, selectedRef } = useCentreSelectedChip(monthFilter);

  const availableMonths = AVAILABLE_MONTHS;

  // 匯出刻意不跟著上面兩排篩選器：家長要的是一份完整的待接種清單進行事曆，
  // 不是「現在畫面上這幾劑」。按鈕自己寫出劑數，按下去拿到的就是那個數字。
  const outstanding = useMemo(
    () =>
      currentChild?.birthday
        ? outstandingVaccineDoses({
            birthday: currentChild.birthday,
            schedules: vaccineSchedules,
            progress: vaccineProgress,
          })
        : [],
    [currentChild?.birthday, vaccineProgress],
  );

  // 算不出日期就沒有東西可匯出：沒有生日的孩子不顯示匯出。
  const canExport = Boolean(currentChild?.birthday);

  const exportDoses = createCalendarExport({ currentChild, vaccineProgress });

  const filteredVaccines = useMemo(() => {
    let filtered = vaccineSchedules;

    const allowed
      = FUNDING_FILTERS.find((o) => o.value === fundingFilter)?.funding ?? [];

    if (allowed.length > 0) {
      filtered = filtered.filter((v) => allowed.includes(v.funding));
    }

    if (monthFilter !== 'all') {
      filtered = filtered.filter((v) => v.ageInMonths === monthFilter);
    }

    return filtered;
  }, [fundingFilter, monthFilter]);

  // Group vaccines by month
  const vaccinesByMonth = useMemo(() => {
    const grouped: { [key: number]: typeof vaccineSchedules } = {};

    filteredVaccines.forEach((vaccine) => {
      const month = vaccine.ageInMonths || 0;

      if (!grouped[month]) {
        grouped[month] = [];
      }

      grouped[month].push(vaccine);
    });

    return grouped;
  }, [filteredVaccines]);

  // Helper: Check if a specific dose is administered
  const isDoseAdministered = (vaccineId: string, doseNumber: number): boolean => {
    return vaccineProgress[vaccineId]?.doses[doseNumber]?.administered || false;
  };

  // Helper: Get administered date for a dose
  const getDoseDate = (
    vaccineId: string,
    doseNumber: number,
  ): string | undefined => {
    return vaccineProgress[vaccineId]?.doses[doseNumber]?.administeredDate;
  };

  return (
    <VaccineTrackingView
      currentChild={currentChild}
      setShowReferences={setShowReferences}
      showReferences={showReferences}
      setShowEmergencies={setShowEmergencies}
      setShowContraindications={setShowContraindications}
      setShowVaccineTypes={setShowVaccineTypes}
      setShowGuidelines={setShowGuidelines}
      setFundingFilter={setFundingFilter}
      fundingFilter={fundingFilter}
      scrollerRef={scrollerRef}
      monthFilter={monthFilter}
      selectedRef={selectedRef}
      pickMonth={pickMonth}
      availableMonths={availableMonths}
      filteredVaccines={filteredVaccines}
      outstanding={outstanding}
      exportDoses={exportDoses}
      vaccinesByMonth={vaccinesByMonth}
      isDoseAdministered={isDoseAdministered}
      getDoseDate={getDoseDate}
      setEditingDose={setEditingDose}
      canExport={canExport}
      showEmergencies={showEmergencies}
      showContraindications={showContraindications}
      showVaccineTypes={showVaccineTypes}
      showGuidelines={showGuidelines}
      editingDose={editingDose}
      onSetVaccineDose={onSetVaccineDose}
    />
  );
}

function createCalendarExport({
  currentChild, vaccineProgress,
}: {
  currentChild:
    | import('~app/family/domain/familyRecords').ChildProfile
    | null
    | undefined;
  vaccineProgress: import('~app/family/domain/familyRecords').VaccineProgress;
}) {
  return (schedules: VaccineSchedule[], label: string) => {
    if (!currentChild) {
      return;
    }

    downloadCalendar(
      buildVaccineIcs({
        child: currentChild,
        schedules: schedules,
        progress: vaccineProgress,
      }),
      `${currentChild.name}-${label}.ics`,
    );
  };
}
