import { motion } from 'framer-motion';
import { Baby, Book, Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';
import AddPregnancyModal from '~app/components/AddPregnancyModal';
import BloomShell from '../BloomShell';
import EmptyState from '~app/components/EmptyState';
import { formatDate, parseLocalDate, toLocalDateKey } from '~app/domain/dateHelpers';
import { hoverLift, listItem, stagger, tap } from '~app/domain/motion';
import { goTo } from '~app/domain/navigate';
import { isPregnancyProfile } from '~app/domain/pregnancy';
import { PREGNANCY_TOTAL_WEEKS, trimesterOf } from '~app/domain/pregnancyGuides';
import { weeksPregnant } from '~app/domain/prenatalSchedule';
import type {
  ChildProfile,
  Gender,
  PrenatalCheckupProgress,
} from '~app/domain/records';
import type { Page } from '~app/domain/routes';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import CurrentPregnancyGuide from './CurrentPregnancyGuide';
import UpcomingPrenatalCheckup from './UpcomingPrenatalCheckup';

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

const THEME = SERVICE_THEME.littlebloom;

const TRIMESTER_LABEL: Record<1 | 2 | 3, string> = {
  1: '第一孕期',
  2: '第二孕期',
  3: '第三孕期',
};

/**
 * 出生日期不通過的理由，通過則 null。
 *
 * 這是四個服務裡唯一不可逆的寫入：確認之後孕期檔案就被改寫成寶寶檔案、孕期
 * 資料封存，沒有任何流程回得去。而空白的日期會讓月齡算出 NaN，照護時程從此
 * 永遠是空的——家長會拿到一份同時壞掉的孕期與寶寶檔案，自己救不回來。
 * 所以擋在送出之前，不是事後補救。
 */
function birthDateProblem(
  birthDate: string,
  lmp: string,
  today: string,
): string | null {
  if (!birthDate || Number.isNaN(parseLocalDate(birthDate).getTime())) {
    return '請填入實際出生日期。';
  }

  if (birthDate > today) {
    return '出生日期不能填未來的日期，寶寶還沒出生就先別登記。';
  }

  // 早於末次月經的日期不可能是這一胎的出生日，多半是選錯年份。
  if (lmp && birthDate < lmp) {
    return `出生日期不能早於末次月經（${formatDate(lmp)}）。`;
  }

  return null;
}

export default function LittleBloomPage({
  currentChild,
  progress,
  onRecordBirth,
  onAddPregnancy,
}: LittleBloomPageProps) {
  const [addOpen, setAddOpen] = useState(false);
  const lmp = currentChild?.pregnancyData?.lastPeriodDate ?? '';
  const dueDate = currentChild?.pregnancyData?.dueDate ?? '';
  const birth = useBirthForm({ lmp, onRecordBirth });

  // weeksPregnant 回傳已完成整週；顯示上習慣說「第 N 週」，故 +1。
  // 舊版用 Math.abs 算天數差，未來的末次月經日會被算成正的週數。
  const displayWeek = useMemo(() => {
    if (!lmp) {
      return 0;
    }

    return Math.min(weeksPregnant(lmp) + 1, PREGNANCY_TOTAL_WEEKS);
  }, [lmp]);

  // 出生後 recordBirth 會保留 lastPeriodDate 與 dueDate 當孕期紀錄，只把 status
  // 改成 archived，所以 `!lmp` 這個條件永遠不會成立。少了下面這個分支，生完的
  // 媽媽會一直看到「第 40 週」與還能按的「登記出生」。判斷條件與側邊欄、
  // LittleSteps 儀表板、LittleExplorer 兩個守門一致。
  if (currentChild && lmp && !isPregnancyProfile(currentChild)) {
    return (
      <BloomShell title="LittleBloom" subtitle="孕期已完成">
        <EmptyState
          theme={THEME}
          icon={Baby}
          title="寶寶已經出生了"
          description={`${currentChild.name} 的孕期紀錄已經封存保留。\n接下來的成長里程碑與疫苗，請到 LittleSteps 繼續。`}
          action={{
            label: '前往 LittleSteps',
            onClick: () => {
              goTo('littlesteps');
            },
          }}
        />
      </BloomShell>
    );
  }

  if (!lmp) {
    return (
      <BloomShell title="LittleBloom" subtitle="孕期陪伴">
        <EmptyState
          theme={THEME}
          title="還沒有孕期檔案"
          description="填入預產期就開始——這裡會依週數顯示身體變化、本週提醒與產檢時程。"
          action={{ label: '新增孕期檔案', onClick: () => setAddOpen(true) }}
        />
        <AddPregnancyModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onAdd={onAddPregnancy}
        />
      </BloomShell>
    );
  }

  return (
    <BloomShell
      title="LittleBloom"
      subtitle={`第 ${displayWeek} 週 · 預產期 ${formatDate(dueDate)}`}
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <PregnancyWeekSummary displayWeek={displayWeek} />

        <CurrentPregnancyGuide displayWeek={displayWeek} />
        <UpcomingPrenatalCheckup lmp={lmp} progress={progress} />
        <motion.section
          variants={listItem}
          className="grid grid-cols-2 gap-3 sm:gap-4"
        >
          <NavCard
            label="產檢時程"
            icon={<Calendar className="w-6 h-6" />}
            page="littlebloom/prenatal"
            className="bg-bloom-sage/20 text-bloom-sage-ink"
          />
          <NavCard
            label="孕期知識庫"
            icon={<Book className="w-6 h-6" />}
            page="littlebloom/wiki"
            className="bg-bloom-dusty-blue/20 text-bloom-dusty-blue-ink"
          />
        </motion.section>

        <BirthRegistration birth={birth} lmp={lmp} />
      </motion.div>
    </BloomShell>
  );
}

interface NavCardProps {
  label: string;
  icon: React.ReactNode;
  page: Page;
  className: string;
}

function NavCard({ label, icon, page, className }: NavCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={hoverLift}
      whileTap={tap}
      onClick={() => {
        goTo(page);
      }}
      className={`${className} rounded-3xl p-5 shadow-soft hover:shadow-soft-lg transition-shadow flex flex-col items-center gap-2`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </motion.button>
  );
}

function useBirthForm({
  lmp,
  onRecordBirth,
}: {
  lmp: string;
  onRecordBirth: LittleBloomPageProps['onRecordBirth'];
}) {
  const [birthOpen, setBirthOpen] = useState(false);
  const [birthDate, setBirthDate] = useState(() => toLocalDateKey());
  // 性別在這裡收，不是額外欄位：沒有它就算不出成長曲線的百分位，而出生
  // 當下正是知道的時候。可以留空，之後在編輯寶寶資料補。
  const [birthGender, setBirthGender] = useState<Gender | ''>('');
  const [birthSaving, setBirthSaving] = useState(false);
  const [birthError, setBirthError] = useState('');

  const dateProblem = birthDateProblem(birthDate, lmp, toLocalDateKey());

  // 登記出生會改寫檔案並封存孕期資料，失敗卻靜靜關閉表單，家長會以為存好了。
  // 同時擋住重複點擊：這個動作不該被送出兩次。
  const submitBirth = async () => {
    // 按鈕已經停用，這裡再擋一次：這個寫入沒有回頭路。
    if (dateProblem) {
      return;
    }

    setBirthSaving(true);
    setBirthError('');

    try {
      await onRecordBirth(birthDate, birthGender || undefined);
      setBirthOpen(false);
    } catch (error) {
      console.error('登記出生失敗:', error);
      setBirthError('儲存失敗，請確認網路後再試一次。');
    } finally {
      setBirthSaving(false);
    }
  };

  return {
    birthOpen,
    setBirthOpen,
    birthDate,
    setBirthDate,
    birthGender,
    setBirthGender,
    birthSaving,
    birthError,
    dateProblem,
    submitBirth,
  };
}

function BirthRegistration({
  birth,
  lmp,
}: {
  birth: ReturnType<typeof useBirthForm>;
  lmp: string;
}) {
  const {
    birthOpen,
    setBirthOpen,
    birthDate,
    setBirthDate,
    birthGender,
    setBirthGender,
    birthSaving,
    birthError,
    dateProblem,
    submitBirth,
  } = birth;

  return (
    <>
      {/* 出生登記：孕期檔案轉為寶寶檔案。PregnancyData.status 這個欄位
            從設計出來就存在，卻一直沒有任何流程會把它改成 archived。 */}
      <motion.section variants={listItem} className="panel">
        <h3 className={`mb-2 ${THEME.body}`}>寶寶出生了</h3>
        <p className={`text-sm leading-relaxed mb-4 ${THEME.muted}`}>
          填入實際出生日期後，這份檔案會變成寶寶檔案， LittleSteps 與 LittleExplorer
          就會依實際月齡接手。孕期與產檢紀錄都會保留。
        </p>

        {birthOpen
          ? (
              <div className="space-y-2">
                <label className={`block text-xs ${THEME.muted}`}>
                  出生日期
                  <input
                    type="date"
                    value={birthDate}
                    min={lmp || undefined}
                    max={toLocalDateKey()}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={
                      'mt-1 w-full px-3 min-h-tap rounded-xl border'
                      + ' border-bloom-sand text-sm text-bloom-stone-ink'
                    }
                  />
                </label>
                <label className={`block text-xs ${THEME.muted}`}>
                  性別（用來計算成長曲線百分位，可稍後補）
                  <select
                    value={birthGender}
                    onChange={(e) => setBirthGender(e.target.value as Gender | '')}
                    className={
                      'mt-1 w-full px-3 min-h-tap rounded-xl border'
                      + ' border-bloom-sand text-sm text-bloom-stone-ink bg-white'
                    }
                  >
                    <option value="">先不填</option>
                    <option value="male">男寶寶</option>
                    <option value="female">女寶寶</option>
                  </select>
                </label>
                {(dateProblem ?? birthError) && (
                  <p role="alert" className="text-sm text-red-600">
                    {dateProblem ?? birthError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={submitBirth}
                    disabled={birthSaving || dateProblem !== null}
                    className={`btn-primary flex-1 ${THEME.fill} ${THEME.fillText}`}
                  >
                    {birthSaving ? '儲存中…' : '確認出生'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBirthOpen(false)}
                    disabled={birthSaving}
                    className="btn-ghost disabled:opacity-60"
                  >
                    取消
                  </button>
                </div>
              </div>
            )
          : (
              <button
                type="button"
                onClick={() => setBirthOpen(true)}
                className={`btn-primary ${THEME.fill} ${THEME.fillText}`}
              >
                登記出生
              </button>
            )}
      </motion.section>
      {' '}
    </>
  );
}

function PregnancyWeekSummary({ displayWeek }: { displayWeek: number }) {
  return (
    <motion.section variants={listItem} className="panel text-center">
      <p className={`text-sm ${THEME.muted}`}>
        {TRIMESTER_LABEL[trimesterOf(displayWeek)]}
      </p>
      <p className={`text-4xl font-bold my-2 ${THEME.ink}`}>
        {'第 '}
        {displayWeek}
        {' 週'}
      </p>
      <p className={`text-sm ${THEME.muted}`}>
        {'還有 '}
        {Math.max(PREGNANCY_TOTAL_WEEKS - displayWeek, 0)}
        {' 週見面'}
      </p>
    </motion.section>
  );
}
