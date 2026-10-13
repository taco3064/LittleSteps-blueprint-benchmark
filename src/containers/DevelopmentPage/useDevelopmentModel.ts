import { useMemo, useState } from 'react';
import NoChildNotice from '~app/components/NoChildNotice';
import {
  bandForMonths,
} from '~app/domain/ageBands';
import {
  correctedAgeMonths,
  isCorrecting,
} from '~app/domain/correctedAge';
import {
  developmentCheckItems,
  developmentWarnings,
} from '~app/domain/developmentChecks';
import type {
  ChildProfile,
  DevelopmentCheckProgress,
  ToddlerAgeBand,
  ToothProgress,
} from '~app/domain/records';
import { useDevelopmentDiary } from './useDevelopmentDiary';

export interface DevelopmentPageProps {
  currentChild?: ChildProfile | null;
  progress: DevelopmentCheckProgress;
  toothProgress: ToothProgress;
  reminderBadge?: number;
  onToggleCheck: (checkItemId: string) => Promise<void>;
  onQuickDiary: (content: string, linkedCheckItemId: string) => Promise<void>;
  onToggleTooth: (toothId: string) => Promise<void>;
  /**
   * 新增／加入寶寶。LittleExplorer 自己開新增視窗，不把家長送去 LittleSteps
   * ——共用的是帳號與孩子資料，不是彼此的畫面。
   */
  onAddChild: React.ComponentProps<typeof NoChildNotice>['onAddChild'];
  onJoinChild?: (uuid: string) => Promise<void>;
}

export function useDevelopmentModel(props: DevelopmentPageProps) {
  const { currentChild, progress } = props;
  // 發展檢核問的是「會不會疊積木、會不會說兩個字的句子」，那是發育進度，所以
  // 早產兒用矯正年齡挑年齡段。標題那行年齡仍是實際年齡——不會有人希望自己
  // 孩子的年齡被系統偷偷改掉，所以矯正只出現在真的拿去比較的地方，並標明。
  const ageMonths = currentChild ? correctedAgeMonths(currentChild) : 0;
  const correcting = currentChild ? isCorrecting(currentChild) : false;
  const [band, setBand] = useState<ToddlerAgeBand>(() => bandForMonths(ageMonths));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [warningsOpen, setWarningsOpen] = useState(false);
  const diary = useDevelopmentDiary(props);

  const bandItems = useMemo(
    () => developmentCheckItems.filter((item) => item.ageBand === band),
    [band],
  );

  const achievedCount = bandItems.filter(
    (item) => progress[item.id]?.achieved,
  ).length;

  const warning = developmentWarnings.find((w) => w.ageBand === band);

  return {
    ...props,
    ...diary,
    ageMonths,
    correcting,
    band,
    setBand,
    expandedId,
    setExpandedId,
    warningsOpen,
    setWarningsOpen,
    bandItems,
    achievedCount,
    warning,
  };
}

export type DevelopmentModel = ReturnType<typeof useDevelopmentModel>;
