import { useMemo } from 'react';
import { FUNDING_FILTERS } from './funding';
import { useVaccineSelection } from './useVaccineSelection';
import { useVaccineSheets } from './useVaccineSheets';

import { downloadCalendar } from '~app/domain/icsExport';
import {
  ChildProfile,
  VaccineProgress,
  VaccineSchedule,
} from '~app/domain/records';
import {
  buildVaccineIcs,
  outstandingVaccineDoses,
} from '~app/domain/vaccineCalendar';
import {
  vaccineSchedules,
} from '~app/domain/vaccines';
import { useCentreSelectedChip } from '~app/hooks/useCentreSelectedChip';

export interface VaccineTrackingPageProps {
  currentChild?: ChildProfile | null;
  vaccineProgress: VaccineProgress;
  onSetVaccineDose: (input: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    date?: string;
  }) => void;
}

const AVAILABLE_MONTHS = Array.from(
  new Set(vaccineSchedules.map((v) => v.ageInMonths || 0)),
).sort((a, b) => a - b);

export function useVaccineModel(props: VaccineTrackingPageProps) {
  const { currentChild, vaccineProgress } = props;
  const selection = useVaccineSelection(currentChild);
  const { fundingFilter, monthFilter } = selection;

  const sheets = useVaccineSheets();

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

  const exportDoses = (schedules: VaccineSchedule[], label: string) => {
    if (!currentChild) {
      return;
    }

    downloadCalendar(
      buildVaccineIcs({ child: currentChild, schedules, progress: vaccineProgress }),
      `${currentChild.name}-${label}.ics`,
    );
  };

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-mint-light text-mint-dark';
      case 'moderate':
        return 'bg-butter-light text-butter-dark';
      case 'severe':
        return 'bg-primary-light text-primary-dark';
      default:
        return 'bg-ink/5 text-ink-muted';
    }
  };

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

  return {
    ...props,
    ...selection,
    ...sheets,
    scrollerRef,
    selectedRef,
    availableMonths,
    outstanding,
    canExport,
    exportDoses,
    filteredVaccines,
    vaccinesByMonth,
    getSeverityColor,
    isDoseAdministered,
    getDoseDate,
  };
}

export type VaccineModel = ReturnType<typeof useVaccineModel>;
