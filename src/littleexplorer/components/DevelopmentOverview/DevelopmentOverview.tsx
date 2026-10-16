import { motion } from 'framer-motion';
import { TODDLER_MAX_MONTHS } from '~app/family/domain/ageBands';
import { gestationalAgeLabel } from '~app/family/domain/correctedAge';
import type {
  ChildProfile,
  DevelopmentCheckProgress,
  ToothProgress,
} from '~app/family/domain/familyRecords';
import { calculateAgeDisplay } from '~app/family/domain/summaryCalculator';
import type {
  DevelopmentCheckItem,
  DevelopmentDomain,
  DevelopmentWarning,
  ToddlerAgeBand,
} from '~app/knowledge/domain/referenceModels';
import { listItem, stagger } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import AgeBandPicker from '../AgeBandPicker';
import DevelopmentChecklist from '../DevelopmentChecklist';
import DevelopmentGraduation from '../DevelopmentGraduation';
import DevelopmentProgress from '../DevelopmentProgress';
import DevelopmentWarnings from '../DevelopmentWarnings';
import type { ExplorerShellProps } from '../ExplorerShell';

import ToothChart from '../ToothChart';
const THEME = SERVICE_THEME.littleexplorer;

const DOMAIN_ORDER: DevelopmentDomain[] = [
  'gross-motor',
  'fine-motor',
  'language',
  'cognitive',
  'social',
];

interface DevelopmentOverviewProps {
  GrowthCurveLink: React.ComponentType;
  ExplorerShell: React.ComponentType<ExplorerShellProps>;
  currentChild: ChildProfile | null | undefined;
  reminderBadge: number | undefined;
  outOfRange: JSX.Element | null;
  ageMonths: number;
  onOpenVaccines: () => void;
  band: ToddlerAgeBand;
  setBand: React.Dispatch<React.SetStateAction<ToddlerAgeBand>>;
  correcting: boolean;
  bandItems: DevelopmentCheckItem[];
  achievedCount: number;
  progress: DevelopmentCheckProgress;
  expandedId: string | null;
  handleToggle: (item: DevelopmentCheckItem) => Promise<void>;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
  diaryFor: string | null;
  diaryText: string;
  setDiaryText: React.Dispatch<React.SetStateAction<string>>;
  handleQuickDiary: (item: DevelopmentCheckItem) => Promise<void>;
  setDiaryFor: React.Dispatch<React.SetStateAction<string | null>>;
  diaryError: string;
  savedFor: string | null;
  toothProgress: ToothProgress;
  onToggleTooth: (toothId: string) => Promise<void>;
  warning: DevelopmentWarning | undefined;
  setWarningsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  warningsOpen: boolean;
}

export default function DevelopmentOverview(props: DevelopmentOverviewProps) {
  return (
    <props.ExplorerShell
      active="development"
      childName={props.currentChild?.name}
      ageLabel={
        props.currentChild
          ? calculateAgeDisplay(props.currentChild.birthday)
          : undefined
      }
      reminderBadge={props.reminderBadge}
    >
      {props.outOfRange ?? (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {props.ageMonths >= TODDLER_MAX_MONTHS && (
            <motion.div variants={listItem}>
              <DevelopmentGraduation onOpenVaccines={props.onOpenVaccines} />
            </motion.div>
          )}

          <motion.div variants={listItem} className="space-y-2">
            <AgeBandPicker selected={props.band} onSelect={props.setBand} />
            {props.correcting && props.currentChild && (
              <p className="text-xs text-explorer-bark/70">
                已依早產矯正：預設看的是矯正年齡
                {' '}
                {props.ageMonths}
                {' '}
                個月（
                {gestationalAgeLabel(props.currentChild)}
                ）。
              </p>
            )}
          </motion.div>

          {/* 這個分頁叫「成長」卻沒有身高體重。WHO 標準到 36 個月都適用，
              但那張圖住在 LittleSteps，而這裡從來沒提過。
              滿 3 歲之後就不顯示：WHO 這份資料只到 36 個月，再往後那張圖
              算不出百分位，而這張卡片正是拿百分位當賣點。 */}
          {props.ageMonths < TODDLER_MAX_MONTHS && <props.GrowthCurveLink />}

          <DevelopmentProgress
            bandItems={props.bandItems}
            achievedCount={props.achievedCount}
          />

          {DOMAIN_ORDER.map((domain) => {
            const items = props.bandItems.filter((item) => item.domain === domain);

            if (items.length === 0) {
              return null;
            }

            return (
              <DevelopmentChecklist
                key={domain}
                domain={domain}
                items={items}
                progress={props.progress}
                expandedId={props.expandedId}
                handleToggle={props.handleToggle}
                setExpandedId={props.setExpandedId}
                diaryFor={props.diaryFor}
                diaryText={props.diaryText}
                setDiaryText={props.setDiaryText}
                handleQuickDiary={props.handleQuickDiary}
                setDiaryFor={props.setDiaryFor}
                diaryError={props.diaryError}
                savedFor={props.savedFor}
              />
            );
          })}

          <motion.div variants={listItem}>
            <ToothChart
              progress={props.toothProgress}
              ageMonths={props.ageMonths}
              onToggleTooth={props.onToggleTooth}
            />
          </motion.div>

          {props.warning && (
            <DevelopmentWarnings
              setWarningsOpen={props.setWarningsOpen}
              warningsOpen={props.warningsOpen}
              warning={props.warning}
            />
          )}

          <p className={`text-xs leading-relaxed px-1 ${THEME.muted}`}>
            每個孩子的發展速度不同，本表僅供家長觀察參考，不是診斷工具。若有疑慮，正式評估請至兒童發展聯合評估中心。
          </p>
        </motion.div>
      )}
    </props.ExplorerShell>
  );
}
