import { useMemo } from 'react';
import type {
  ChildProfile,
  PrenatalCheckupProgress,
} from '~app/family/domain/familyRecords';
import { isPregnancyProfile } from '~app/family/domain/pregnancy';
import { splitOverdueByProfileStart } from '~app/family/domain/profileHistory';
import { prenatalCheckupSchedule } from '~app/knowledge/domain/prenatalCheckups';
import PrenatalCompleted from '~app/littlebloom/components/PrenatalCompleted';
import PrenatalSchedule from '~app/littlebloom/components/PrenatalSchedule';
import PrenatalStart from '~app/littlebloom/components/PrenatalStart';
import {
  resolvePrenatalItems,
  weeksPregnant,
} from '~app/littlebloom/domain/prenatalSchedule';
import { usePrenatalForm } from '~app/littlebloom/hooks/usePrenatalForm';
import { goTo } from '~app/portal/services/navigate';
import BloomShell from './BloomShell';
import { createPrenatalActions } from './createPrenatalActions';
import { createPrenatalRows } from './createPrenatalRows';
export interface PrenatalPageProps {
  currentChild?: ChildProfile | null;
  progress: PrenatalCheckupProgress;
  onComplete: (
    id: string,
    record: { completedDate: string; clinicName?: string; notes?: string },
  ) => Promise<void>;
  onUndo: (id: string) => Promise<void>;
}

export default function PrenatalPage(props: PrenatalPageProps) {
  const form = usePrenatalForm();
  const lmp = props.currentChild?.pregnancyData?.lastPeriodDate ?? '';

  const items = useMemo(
    () =>
      resolvePrenatalItems({
        lastPeriodDate: lmp,
        templates: prenatalCheckupSchedule,
        completed: props.progress,
      }),
    [lmp, props.progress],
  );

  const { overdue, missingHistory } = useMemo(
    () => splitOverdueByProfileStart(items, props.currentChild?.createdAt),
    [items, props.currentChild?.createdAt],
  );

  const weeks = lmp ? weeksPregnant(lmp) : 0;

  if (props.currentChild && lmp && !isPregnancyProfile(props.currentChild)) {
    return (
      <PrenatalCompleted
        BloomShell={BloomShell}
        onOpenInfantCare={() => goTo('littlesteps')}
      />
    );
  }

  if (!lmp) {
    return (
      <PrenatalStart
        BloomShell={BloomShell}
        onStartPregnancy={() => goTo('littlebloom')}
      />
    );
  }

  const actions = createPrenatalActions({
    ...form,
    onComplete: props.onComplete,
    onUndo: props.onUndo,
  });

  const rows = createPrenatalRows({ ...form, ...actions, overdue, items });

  return (
    <PrenatalSchedule
      BloomShell={BloomShell}
      weeks={weeks}
      currentChild={props.currentChild}
      {...rows}
      missingHistory={missingHistory}
      setHistoryOpen={form.setHistoryOpen}
      historyOpen={form.historyOpen}
    />
  );
}
