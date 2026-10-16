import { useMemo } from 'react';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type {
  ChildProfile,
  Gender,
  PrenatalCheckupProgress,
} from '~app/family/domain/familyRecords';
import { isPregnancyProfile } from '~app/family/domain/pregnancy';
import { prenatalCheckupSchedule } from '~app/knowledge/domain/prenatalCheckups';
import BirthRecordedNotice from '~app/littlebloom/components/BirthRecordedNotice';
import PregnancyOverview from '~app/littlebloom/components/PregnancyOverview';
import PregnancyStart from '~app/littlebloom/components/PregnancyStart';
import {
  PREGNANCY_TOTAL_WEEKS,
  pregnancyGuides,
} from '~app/littlebloom/domain/pregnancyGuides';
import {
  birthDateProblem,
  resolvePrenatalItems,
  weeksPregnant,
} from '~app/littlebloom/domain/prenatalSchedule';
import { useLittleBloomForm } from '~app/littlebloom/hooks/useLittleBloomForm';
import { goTo } from '~app/portal/services/navigate';
import AddPregnancyModal from './AddPregnancyModal';
import BloomShell from './BloomShell';
import { createLittleBloomActions } from './createLittleBloomActions';

interface LittleBloomPageProps {
  currentChild?: ChildProfile | null;
  progress: PrenatalCheckupProgress;
  onRecordBirth: (birthday: string, gender?: Gender) => Promise<void>;
  /**
   * 建立孕期檔案。傳預產期進去，資料層就會把它標成孕期檔案並用 Naegele
   * 法則回推末次月經。
   *
   * LittleBloom 自己開這個視窗，而不是把家長送去 LittleSteps 的側邊欄——
   * 兩個服務之間共用的是帳號與孩子資料，不是彼此的畫面。
   */
  onAddPregnancy: (name: string, dueDate: string) => Promise<void>;
}

export default function LittleBloomPage({
  currentChild,
  progress,
  onRecordBirth,
  onAddPregnancy,
}: LittleBloomPageProps) {
  const model = useLittleBloomForm();

  const lmp = currentChild?.pregnancyData?.lastPeriodDate ?? '';
  const dueDate = currentChild?.pregnancyData?.dueDate ?? '';

  // 性別在這裡收，不是額外欄位：沒有它就算不出成長曲線的百分位，而出生
  // 當下正是知道的時候。可以留空，之後在編輯寶寶資料補。

  const dateProblem = birthDateProblem(model.birthDate, lmp, toLocalDateKey());

  // 登記出生會改寫檔案並封存孕期資料，失敗卻靜靜關閉表單，家長會以為存好了。
  // 同時擋住重複點擊：這個動作不該被送出兩次。
  const { submitBirth } = createLittleBloomActions({
    dateProblem,
    setBirthSaving: model.setBirthSaving,
    setBirthError: model.setBirthError,
    onRecordBirth,
    birthDate: model.birthDate,
    birthGender: model.birthGender,
    setBirthOpen: model.setBirthOpen,
  });

  // weeksPregnant 回傳已完成整週；顯示上習慣說「第 N 週」，故 +1。
  // 舊版用 Math.abs 算天數差，未來的末次月經日會被算成正的週數。
  const displayWeek = useMemo(() => {
    if (!lmp) {
      return 0;
    }

    return Math.min(weeksPregnant(lmp) + 1, PREGNANCY_TOTAL_WEEKS);
  }, [lmp]);

  // 舊版是 `find(...) || pregnancyGuides[0]`，而資料只有 1-4 週，
  // 於是第 5 週以後的人全部被自信地告知「懷孕第 1 週：準備懷孕」。
  const currentGuide = useMemo(() => {
    if (displayWeek === 0) {
      return null;
    }

    return pregnancyGuides.find((guide) => guide.week === displayWeek) ?? null;
  }, [displayWeek]);

  const nextItem = useMemo(() => {
    if (!lmp) {
      return null;
    }

    const items = resolvePrenatalItems({
      lastPeriodDate: lmp,
      templates: prenatalCheckupSchedule,
      completed: progress,
    });

    return (
      items.find((item) => item.status === 'overdue')
      ?? items.find((item) => item.status === 'due')
      ?? items.find((item) => item.status === 'upcoming')
      ?? null
    );
  }, [lmp, progress]);

  // 出生後 recordBirth 會保留 lastPeriodDate 與 dueDate 當孕期紀錄，只把 status
  // 改成 archived，所以 `!lmp` 這個條件永遠不會成立。少了下面這個分支，生完的
  // 媽媽會一直看到「第 40 週」與還能按的「登記出生」。判斷條件與側邊欄、
  // LittleSteps 儀表板、LittleExplorer 兩個守門一致。
  if (currentChild && lmp && !isPregnancyProfile(currentChild)) {
    return (
      <BirthRecordedNotice
        BloomShell={BloomShell}
        currentChild={currentChild}
        onOpenInfantCare={() => goTo('littlesteps')}
      />
    );
  }

  if (!lmp) {
    return (
      <PregnancyStart
        AddPregnancyModal={AddPregnancyModal}
        BloomShell={BloomShell}
        setAddOpen={model.setAddOpen}
        addOpen={model.addOpen}
        onAddPregnancy={onAddPregnancy}
      />
    );
  }

  return (
    <PregnancyOverview
      BloomShell={BloomShell}
      displayWeek={displayWeek}
      dueDate={dueDate}
      currentGuide={currentGuide}
      nextItem={nextItem}
      onOpenPrenatal={() => goTo('littlebloom/prenatal')}
      onOpenWiki={() => goTo('littlebloom/wiki')}
      birthOpen={model.birthOpen}
      birthDate={model.birthDate}
      lmp={lmp}
      setBirthDate={model.setBirthDate}
      birthGender={model.birthGender}
      setBirthGender={model.setBirthGender}
      dateProblem={dateProblem}
      birthError={model.birthError}
      submitBirth={submitBirth}
      birthSaving={model.birthSaving}
      setBirthOpen={model.setBirthOpen}
    />
  );
}
