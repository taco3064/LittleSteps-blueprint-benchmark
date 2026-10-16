import { motion } from 'framer-motion';

import { ArrowRight } from 'lucide-react';

import { isPregnancyProfile } from '~app/family/domain/pregnancy';

import ToddlerHandoff from '../ToddlerHandoff';

import VaccineDueCard from '../VaccineDueCard';

import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';

import { formatDate } from '~app/platform/domain/calendar';

import MilestoneSummaryCard from '../MilestoneSummaryCard';

import VaccineSummaryCard from '../VaccineSummaryCard';

import DailyLogSummaryCard from '../DailyLogSummaryCard';

import SleepAnalyticsCard from '../SleepAnalyticsCard';

import FoodTrackingSummaryCard from '../FoodTrackingSummaryCard';

import AlertBanner from '../AlertBanner';

import PoopSummaryCard from '../PoopSummaryCard';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { hoverLift, listItem, stagger, tap } from '~app/platform/components/Motion';
interface DashboardView3Props {
  onPregnancy: () => void;
}

interface DashboardView2Props {
  onPregnancy: () => void;
  onToddler: () => void;
  currentChild: ChildProfile;
  ageDisplay: string;
  activeAlerts: import('~app/littlesteps/domain/alertEngine').Alert[];
  onNavigate: (
    page:
      | 'littlesteps/milestones'
      | 'littlesteps/vaccine-tracking'
      | 'littlesteps/daily-log'
      | 'littlesteps/care-guide'
      | 'littlesteps/complementary-food'
      | 'littlesteps/sleep-analysis'
      | 'littlesteps/clinic-summary',
  ) => void;
  ageMonths: number;
  milestoneSummary:
    import('~app/family/domain/summaryCalculator').MilestoneSummary | null;
  vaccineSummary:
    import('~app/family/domain/summaryCalculator').VaccineSummary | null;
  todaySummary: import('~app/family/domain/familyRecords').DailySummary;
  dailyLogs: DailyLog[];
  sleepAnalytics: import('~app/family/domain/familyRecords').SleepAnalytics;
  foodStats: import('~app/littlesteps/hooks/useFoodTracking').FoodStats;
}

const FEATURES = [
  {
    title: '成長曲線圖',
    description: '記錄身高、體重、頭圍，自動計算百分位數',
    note: '追蹤寶寶健康發展',
  },
  {
    title: '里程碑追蹤',
    description: '記錄第一次微笑、翻身、爬行等珍貴時刻',
    note: '不錯過每個成長瞬間',
  },
  {
    title: '疫苗接種管理',
    description: '完整時程表，提醒下次接種時間，不漏打',
    note: '依衛福部建議時程',
  },
  {
    title: '快速日誌',
    description: '3 秒記錄餵奶、睡眠、尿布，掌握作息規律',
    note: '了解寶寶生活模式',
  },
];

const MORE_FEATURES = [
  '副食品階段指南',
  '食物過敏追蹤',
  '睡眠訓練技巧',
  '照顧重點提醒',
  '資料跨裝置同步',
  '支援多個寶寶',
];

const QUICK_NAV: {
  label: string;
  page:
    | 'littlesteps/milestones'
    | 'littlesteps/vaccine-tracking'
    | 'littlesteps/complementary-food'
    | 'littlesteps/care-guide';
}[] = [
  { label: '里程碑', page: 'littlesteps/milestones' },
  { label: '疫苗追蹤', page: 'littlesteps/vaccine-tracking' },
  { label: '副食品', page: 'littlesteps/complementary-food' },
  { label: '照顧重點', page: 'littlesteps/care-guide' },
];

export function DashboardView1() {
  return (
    <motion.div
      className="screen-body-wide"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={listItem} className="mb-6">
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="還沒有寶寶的資料"
          description="請點右上角的帳號按鈕新增或選擇寶寶。"
        />
      </motion.div>

      <motion.div variants={listItem} className="grid md:grid-cols-2 gap-4 mb-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="card">
            <h3 className="mb-1">{feature.title}</h3>
            <p className="text-sm text-ink-muted mb-1.5">{feature.description}</p>
            <p className="text-xs text-ink-faint">{feature.note}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={listItem} className="panel">
        <h3 className="mb-3">更多實用功能</h3>
        <div
          className={
            'grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm '
            + 'text-ink-muted'
          }
        >
          {MORE_FEATURES.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DashboardView() {
  return (
    <div className="screen">
      <DashboardView1 />
    </div>
  );
}

export function DashboardView3({ onPregnancy }: DashboardView3Props) {
  return (
    <motion.div
      variants={listItem}
      className="panel bg-bloom-cream border border-bloom-dusty-rose/30 mb-6"
    >
      <p className="font-semibold text-bloom-stone-ink mb-1">這是孕期檔案</p>
      <p className="text-sm text-bloom-stone-ink/70 leading-relaxed">
        寶寶還沒出生，所以下面的里程碑、疫苗與日誌都還是空的。 每週指南與產檢時程在
        LittleBloom；出生後在那裡登記出生日期，這裡就會開始有內容。
      </p>
      <button
        type="button"
        onClick={onPregnancy}
        className="btn-primary bg-bloom-dusty-rose-deep mt-3"
      >
        前往 LittleBloom
      </button>
    </motion.div>
  );
}

export function DashboardView2({
  currentChild, ageDisplay, activeAlerts, onNavigate, ageMonths, milestoneSummary,
  vaccineSummary, todaySummary, dailyLogs, sleepAnalytics, foodStats, onPregnancy,
  onToddler,
}: DashboardView2Props) {
  return (
    <div className="screen">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="screen-body-wide"
      >
        {/* 孕期檔案的 birthday 是預產期，所以里程碑、疫苗、日誌一律是 0，
            畫面看起來像個從未使用的帳號。直接說明並指路，勝過讓人以為壞了。 */}
        {isPregnancyProfile(currentChild) && (
          <DashboardView3 onPregnancy={onPregnancy} />
        )}

        {/* 月齡與出生日期是 AppBar 標題沒帶到的資訊，所以這一段留著；
            重複的頁面標題與寶寶頭像圖示已移除。 */}
        <DashboardView2Section1
          ageDisplay={ageDisplay}
          currentChild={currentChild}
        />

        {activeAlerts.length > 0 && (
          <motion.div variants={listItem} className="mb-4">
            <AlertBanner alerts={activeAlerts} />
          </motion.div>
        )}

        {/* 該打的疫苗排在行為警示之後、里程碑之前：它比「昨天少喝一餐」重要，
            但不像餵食警示那樣需要今天就處理。沒有到期的劑次時整張不出現。 */}
        {!isPregnancyProfile(currentChild) && (
          <VaccineDueCard
            child={currentChild}
            onOpen={() => onNavigate('littlesteps/vaccine-tracking')}
          />
        )}

        {/* 滿一歲之後，LittleSteps 的里程碑資料就到頂了；幼兒期的檢核與
            健檢提醒在 LittleExplorer，而這裡從來沒提過它存在。 */}
        {ageMonths >= 12 && !isPregnancyProfile(currentChild) && (
          <ToddlerHandoff childName={currentChild.name} onNavigate={onToddler} />
        )}

        {/* Summary Cards Grid */}
        <DashboardView2Section2
          milestoneSummary={milestoneSummary}
          currentChild={currentChild}
          onNavigate={onNavigate}
          vaccineSummary={vaccineSummary}
        />

        {/* Daily Log & Sleep Analytics */}
        <DashboardView2Section3
          todaySummary={todaySummary}
          dailyLogs={dailyLogs}
          onNavigate={onNavigate}
          sleepAnalytics={sleepAnalytics}
          ageMonths={ageMonths}
        />

        {/* Poop & Food Tracking */}
        <DashboardView2Section4
          dailyLogs={dailyLogs}
          onNavigate={onNavigate}
          foodStats={foodStats}
        />

        {/* Quick Navigation */}
        <DashboardView2Section5 onNavigate={onNavigate} />
      </motion.div>
    </div>
  );
}

function DashboardView2Section1({
  ageDisplay, currentChild,
}: Pick<DashboardView2Props, 'ageDisplay' | 'currentChild'>) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-1">{ageDisplay}</h2>
      {/* 孕期檔案的 birthday 是預產期。標題已經說了「尚未出生」，
              下一行再寫「出生: …」會自相矛盾。 */}
      <p className="text-sm text-ink-muted">
        {isPregnancyProfile(currentChild) ? '預產期' : '出生'}
        :
        {' '}
        {formatDate(currentChild.birthday)}
      </p>
    </motion.div>
  );
}

function DashboardView2Section2({
  milestoneSummary, currentChild, onNavigate, vaccineSummary,
}: Pick<
  DashboardView2Props,
  'milestoneSummary' | 'currentChild' | 'onNavigate' | 'vaccineSummary'
>) {
  return (
    <motion.div variants={listItem} className="grid md:grid-cols-2 gap-4 mb-4">
      {milestoneSummary && (
        <MilestoneSummaryCard
          milestoneProgress={currentChild.milestoneProgress || {}}
          onNavigate={() => onNavigate('littlesteps/milestones')}
        />
      )}

      {vaccineSummary && (
        <VaccineSummaryCard
          vaccineProgress={currentChild.vaccineProgress || {}}
          birthday={currentChild.birthday}
          onNavigate={() => onNavigate('littlesteps/vaccine-tracking')}
        />
      )}
    </motion.div>
  );
}

function DashboardView2Section3({
  todaySummary, dailyLogs, onNavigate, sleepAnalytics, ageMonths,
}: Pick<
  DashboardView2Props,
  'todaySummary' | 'dailyLogs' | 'onNavigate' | 'sleepAnalytics' | 'ageMonths'
>) {
  return (
    <motion.div variants={listItem} className="grid md:grid-cols-2 gap-4 mb-4">
      <DailyLogSummaryCard
        summary={todaySummary}
        dailyLogs={dailyLogs}
        onNavigate={() => onNavigate('littlesteps/daily-log')}
      />

      <SleepAnalyticsCard
        analytics={sleepAnalytics}
        ageMonths={ageMonths}
        onNavigate={() => onNavigate('littlesteps/sleep-analysis')}
      />
    </motion.div>
  );
}

function DashboardView2Section4({
  dailyLogs, onNavigate, foodStats,
}: Pick<DashboardView2Props, 'dailyLogs' | 'onNavigate' | 'foodStats'>) {
  return (
    <motion.div variants={listItem} className="grid md:grid-cols-2 gap-4 mb-6">
      <PoopSummaryCard
        dailyLogs={dailyLogs}
        onNavigate={() => onNavigate('littlesteps/daily-log')}
      />
      <FoodTrackingSummaryCard
        stats={foodStats}
        onNavigate={() => onNavigate('littlesteps/complementary-food')}
      />
    </motion.div>
  );
}

function DashboardView2Section5({
  onNavigate,
}: Pick<DashboardView2Props, 'onNavigate'>) {
  return (
    <motion.div variants={listItem}>
      <h2 className="mb-3">快速導航</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_NAV.map((item) => (
          <motion.button
            key={item.page}
            whileHover={hoverLift}
            whileTap={tap}
            onClick={() => onNavigate(item.page)}
            className="card-tap flex items-center justify-between gap-2 text-left"
          >
            <span className="font-semibold text-ink">{item.label}</span>
            <ArrowRight className="w-4 h-4 text-primary-dark shrink-0" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
