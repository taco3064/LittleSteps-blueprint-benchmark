import { useMemo } from 'react';
import type { ChildFormValues } from '~app/family/domain/childForm';
import { correctedAgeMonths, isCorrecting } from '~app/family/domain/correctedAge';
import type {
  ChildProfile,
  DevelopmentCheckProgress,
  ToothProgress,
} from '~app/family/domain/familyRecords';
import DevelopmentOverview from '~app/littleexplorer/components/DevelopmentOverview';
import {
  developmentCheckItems,
  developmentWarnings,
} from '~app/littleexplorer/domain/developmentChecks';
import { useDevelopmentForm } from '~app/littleexplorer/hooks/useDevelopmentForm';
import { goTo } from '~app/portal/services/navigate';
import { createDevelopmentActions } from './createDevelopmentActions';
import { developmentEligibility } from './developmentEligibility';
import ExplorerShell from './ExplorerShell';
import GrowthCurveLink from './GrowthCurveLink';

interface DevelopmentPageProps {
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
  onAddChild: (child: ChildFormValues) => Promise<void>;
  onJoinChild?: (uuid: string) => Promise<void>;
}

/**
 * 成長分頁：這個年紀會什麼、該學什麼。
 *
 * 語氣是這一頁的設計核心。進度與鼓勵在前，紅旗警訊收在底部的可展開區塊——
 * 篩檢優先的版面會讓家長每次打開都在找孩子哪裡不對勁。
 */
export default function DevelopmentPage({
  currentChild,
  progress,
  toothProgress,
  reminderBadge,
  onToggleTooth,
  onToggleCheck,
  onQuickDiary,
  onAddChild,
  onJoinChild,
}: DevelopmentPageProps) {
  // 發展檢核問的是「會不會疊積木、會不會說兩個字的句子」，那是發育進度，所以
  // 早產兒用矯正年齡挑年齡段。標題那行年齡仍是實際年齡——不會有人希望自己
  // 孩子的年齡被系統偷偷改掉，所以矯正只出現在真的拿去比較的地方，並標明。
  const ageMonths = currentChild ? correctedAgeMonths(currentChild) : 0;
  const correcting = currentChild ? isCorrecting(currentChild) : false;

  const model = useDevelopmentForm(ageMonths);

  const bandItems = useMemo(
    () => developmentCheckItems.filter((item) => item.ageBand === model.band),
    [model.band],
  );

  const achievedCount = bandItems.filter(
    (item) => progress[item.id]?.achieved,
  ).length;

  const warning = developmentWarnings.find((w) => w.ageBand === model.band);

  const outOfRange = developmentEligibility({
    currentChild,
    ageMonths,
    onAddChild,
    onJoinChild,
    correcting,
  });

  const { handleToggle, handleQuickDiary } = createDevelopmentActions({
    progress,
    onToggleCheck,
    setDiaryFor: model.setDiaryFor,
    setDiaryText: model.setDiaryText,
    diaryFor: model.diaryFor,
    diaryText: model.diaryText,
    setDiaryError: model.setDiaryError,
    onQuickDiary,
    setSavedFor: model.setSavedFor,
  });

  return (
    <DevelopmentOverview
      GrowthCurveLink={GrowthCurveLink}
      ExplorerShell={ExplorerShell}
      currentChild={currentChild}
      reminderBadge={reminderBadge}
      outOfRange={outOfRange}
      ageMonths={ageMonths}
      onOpenVaccines={() => goTo('littlesteps/vaccine-tracking')}
      band={model.band}
      setBand={model.setBand}
      correcting={correcting}
      bandItems={bandItems}
      achievedCount={achievedCount}
      progress={progress}
      expandedId={model.expandedId}
      handleToggle={handleToggle}
      setExpandedId={model.setExpandedId}
      diaryFor={model.diaryFor}
      diaryText={model.diaryText}
      setDiaryText={model.setDiaryText}
      handleQuickDiary={handleQuickDiary}
      setDiaryFor={model.setDiaryFor}
      diaryError={model.diaryError}
      savedFor={model.savedFor}
      toothProgress={toothProgress}
      onToggleTooth={onToggleTooth}
      warning={warning}
      setWarningsOpen={model.setWarningsOpen}
      warningsOpen={model.warningsOpen}
    />
  );
}
